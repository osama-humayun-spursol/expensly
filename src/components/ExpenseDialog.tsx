import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Expense } from '../App';
import { TravelIconSelector, TravelIconKey } from './TravelIconSelector';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

type OCRResult = {
  text: string;
  amount?: number;
  name?: string;
};

// OCR.space API integration
const OCR_SPACE_API_KEY = import.meta.env.VITE_OCR_SPACE_API_KEY || 'K87899142388957'; // Free tier API key

async function runOCRWithOCRSpace(file: File): Promise<OCRResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('apikey', OCR_SPACE_API_KEY);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for OCR.space

  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OCR.space API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.OCRExitCode !== 1 || !result.ParsedResults || result.ParsedResults.length === 0) {
      const errorMessage = result.ErrorMessage?.[0] || 'OCR failed or no text detected';
      throw new Error(errorMessage);
    }

    const text = result.ParsedResults[0].ParsedText || '';
    const lines = text.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);

    // Try to find a line that contains TOTAL or Total Amount first
    const totalLine = lines.find((l: string) => /TOTAL|TOTAL AMOUNT|AMOUNT INC|AMOUNT EX|NET BILL|NET TOTAL|GRAND TOTAL/i.test(l));
    let amount: number | undefined;

    if (totalLine) {
      const match = Array.from(totalLine.matchAll(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g)).map(m => m[0]);
      const nums = match.map(a => parseFloat(a.replace(/,/g, ''))).filter(n => !isNaN(n));
      if (nums.length) {
        amount = nums[nums.length - 1]; // prefer last number on total line
      }
    }

    // fallback: pick the largest monetary value found if no total line
    if (amount === undefined) {
      const amountMatches = Array.from(text.matchAll(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g)).map(m => m[0]);
      const normalizedAmounts = amountMatches.map(a => parseFloat(a.replace(/,/g, ''))).filter(n => !isNaN(n));
      amount = normalizedAmounts.length ? Math.max(...normalizedAmounts) : undefined;
    }

    // Extract likely merchant/name line (first sensible non-numeric line)
    let name: string | undefined = undefined;
    for (const line of lines) {
      const upper = line.toUpperCase();
      if (/TOTAL|SUBTOTAL|TAX|CHANGE|AMOUNT|BALANCE|Q R|QR|FBR|POS|NET BILL|INVOICE|SUBTOTAL/.test(upper)) continue;
      if (/\d/.test(line) && !/[A-Za-z]/.test(line)) continue;
      if (line.length < 2) continue;
      name = line;
      break;
    }

    return { text, amount, name };
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error('OCR request timed out');
    }
    throw error;
  }
}

async function uploadReceiptFile(file: File) {
  const filename = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('receipts').upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(filename);
  return urlData.publicUrl;
}

type ExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  title: string;
  initialData?: Expense;
};

function toDateInputValue(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ExpenseDialog({ open, onOpenChange, onSubmit, title, initialData }: ExpenseDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Expense['type']>('food');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<TravelIconKey>('car');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setCustomCategory('');
      setSelectedIcon((initialData as any).icon || 'car');
      setAmount(initialData.amount.toString());
      try {
        const d = new Date(initialData.date);
        setExpenseDate(toDateInputValue(d));
      } catch (e) {
        setExpenseDate(toDateInputValue(new Date()));
      }
    } else {
      setName('');
      setType('food');
      setCustomCategory('');
      setSelectedIcon('car');
      setAmount('');
      setExpenseDate(toDateInputValue(new Date()));
    }
  }, [initialData, open]);

  useEffect(() => {
    if (receiptFile) {
      const url = URL.createObjectURL(receiptFile);
      setOcrPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [receiptFile]);

  useEffect(() => {
    // Clear receipt when modal closes
    if (!open) {
      if (ocrRunning) setOcrRunning(false);

      // revoke preview URL and clear receipt file
      if (ocrPreviewUrl) {
        try {
          URL.revokeObjectURL(ocrPreviewUrl);
        } catch (e) {}
      }
      setOcrPreviewUrl(null);
      setReceiptFile(null);

      // reset file input value so re-selecting same file triggers onChange
      if (inputRef.current) {
        try {
          (inputRef.current as HTMLInputElement).value = '';
        } catch (e) {}
      }
    }
  }, [open]);

  const handleReceiptChange = (f?: File) => {
    if (!f) return;
    setReceiptFile(f);
    // automatically start scanning on file select
    handleScanReceipt(f);
  };

  const handleScanReceipt = async (file?: File) => {
    const fileToUse = file || receiptFile;
    if (!fileToUse) return;
    setOcrRunning(true);

    try {
      // Use OCR.space API directly
      const result = await runOCRWithOCRSpace(fileToUse);

      if (result.amount || result.name) {
        toast.success('Receipt scanned successfully!');
      } else {
        toast.info('Receipt scanned but no amount/name found. Please enter manually.');
      }

      if (result.amount) setAmount(result.amount.toString());
      if (result.name) setName(result.name);

      // Set preview URL
      const url = URL.createObjectURL(fileToUse);
      setOcrPreviewUrl(url);
    } catch (error) {
      console.error('OCR error details:', error);

      // User-friendly error messages
      let errorMessage = 'Unable to scan receipt';

      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Scan took too long. Please try a smaller image';
        } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Check your internet connection';
        } else if (error.message.includes('API error')) {
          errorMessage = 'OCR service unavailable. Try again later';
        }
      }

      toast.error(errorMessage);
    } finally {
      setOcrRunning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && amount) {
      const finalType = customCategory.trim() ? customCategory.trim().toLowerCase() : type;
      const iconToSave = finalType === 'travel' ? selectedIcon : (initialData as any)?.icon;
      onSubmit({
        name,
        type: finalType,
        icon: iconToSave,
        amount: parseFloat(amount),
        date: new Date(`${expenseDate}T12:00:00`).toISOString(),
      });
      setName('');
      setType('food');
      setCustomCategory('');
      setSelectedIcon('car');
      setAmount('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the expense details below.' : 'Fill in the details to add a new expense.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Expense Name</Label>
            <Input
              id="name"
              placeholder="Enter expense name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 h-12 rounded-xl border-gray-200 px-4"
            />
          </div>

          <div>
            <Label htmlFor="type">Expense Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as Expense['type'])}>
              <SelectTrigger className="mt-1 h-12 rounded-xl border-gray-200 px-4">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">🍔 Food</SelectItem>
                <SelectItem value="utility">⚡ Utility</SelectItem>
                <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                <SelectItem value="travel">🚗 Travel</SelectItem>
                <SelectItem value="gifts">🎁 Gifts</SelectItem>
                <SelectItem value="home">🏠 Home</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-2">
              <Label htmlFor="customCategory">Or add custom category</Label>
              <Input
                id="customCategory"
                placeholder="e.g. subscriptions"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-1 h-12 rounded-xl border-gray-200 px-4"
              />
            </div>
            { (type === 'travel' || customCategory.trim().toLowerCase() === 'travel') && (
              <div className="mt-3">
                <Label>Choose travel icon</Label>
                <TravelIconSelector value={selectedIcon} onChange={(k) => setSelectedIcon(k)} />
              </div>
            ) }
          </div>

          <div>
            <Label htmlFor="amount">Amount (PKR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="mt-1 h-12 rounded-xl border-gray-200 px-4"
            />
          </div>

          <div>
            <Label htmlFor="date">Expense Date</Label>
            <Input
              id="date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
              className="mt-1 h-12 rounded-xl border-gray-200 px-4"
            />
          </div>

          <div className="mt-3">
            <Label>Receipt (optional)</Label>
            <div className="flex flex-wrap items-center gap-2 mt-2 min-w-0">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleReceiptChange(e.target.files ? e.target.files[0] : undefined)}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="px-3">
                Choose File
              </Button>
              <span className="text-sm text-gray-600 truncate max-w-[50%] min-w-0">{receiptFile ? receiptFile.name : 'No file chosen'}</span>
              <div className="ml-auto">
                <Button type="button" onClick={handleScanReceipt} disabled={!receiptFile || ocrRunning}>
                  {ocrRunning ? 'Scanning...' : 'Scan Receipt'}
                </Button>
              </div>
            </div>
            {ocrPreviewUrl && (
              <img src={ocrPreviewUrl} alt="receipt preview" className="scanimge mt-3 max-h-40 max-w-full object-contain rounded-md border" />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {initialData ? 'Update' : 'Add'} Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
