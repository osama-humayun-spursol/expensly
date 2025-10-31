import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Expense } from '../App';
import { TravelIconSelector, TravelIconKey } from './TravelIconSelector';

type ExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  title: string;
  initialData?: Expense;
};

export function ExpenseDialog({ open, onOpenChange, onSubmit, title, initialData }: ExpenseDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Expense['type']>('food');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<TravelIconKey>('car');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setCustomCategory('');
      setSelectedIcon((initialData as any).icon || 'car');
      setAmount(initialData.amount.toString());
    } else {
      setName('');
      setType('food');
      setCustomCategory('');
      setSelectedIcon('car');
      setAmount('');
    }
  }, [initialData, open]);

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
        date: initialData?.date || new Date().toISOString(),
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
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="type">Expense Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as Expense['type'])}>
              <SelectTrigger className="mt-1">
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
                className="mt-1"
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
              className="mt-1"
            />
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {initialData ? 'Update' : 'Add'} Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
