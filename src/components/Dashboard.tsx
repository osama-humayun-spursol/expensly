import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import Logo from './ui/Logo';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Plus, LogOut, Utensils, Zap, ShoppingBag, Plane, Gift, Home, Edit, Trash2, Copy, DollarSign, Hash, Grid3x3, CalendarIcon } from 'lucide-react';
import { Expense, User } from '../App';
import { ExpenseDialog } from './ExpenseDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatCurrency';

type DashboardProps = {
  user: User;
  expenses: Expense[];
  onSignOut: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
};

function CarSVG({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="18" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="7" cy="17" r="1" fill="currentColor" />
      <circle cx="17" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

const expenseTypeIcons = {
  food: Utensils,
  utility: Zap,
  shopping: ShoppingBag,
  travel: CarSVG,
  gifts: Gift,
  home: Home,
};

const expenseTypeColors = {
  food: 'bg-orange-100 text-orange-700',
  utility: 'bg-yellow-100 text-yellow-700',
  shopping: 'bg-pink-100 text-pink-700',
  travel: 'bg-blue-100 text-blue-700',
  gifts: 'bg-purple-100 text-purple-700',
  home: 'bg-green-100 text-green-700',
};

const chartColors = {
  food: '#16a34a',
  utility: '#34d399',
  shopping: '#86efac',
  travel: '#065f46',
  gifts: '#bbf7d0',
  home: '#22c55e',
};

export function Dashboard({ user, expenses, onSignOut, onAddExpense, onEditExpense, onDeleteExpense }: DashboardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'day' | 'week' | 'month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Filter expenses based on selected date range
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseDateOnly = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());

      switch (filterType) {
        case 'day':
          return expenseDateOnly.getTime() === today.getTime();
        
        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return expenseDateOnly >= weekAgo && expenseDateOnly <= today;
        }
        
        case 'month': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return expenseDateOnly >= monthAgo && expenseDateOnly <= today;
        }
        
        case 'custom':
          if (!customStartDate || !customEndDate) return true;
          const startDateOnly = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate());
          const endDateOnly = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate());
          return expenseDateOnly >= startDateOnly && expenseDateOnly <= endDateOnly;
        
        default:
          return true;
      }
    });
  }, [expenses, filterType, customStartDate, customEndDate]);

  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDuplicate = (expense: Expense) => {
    const duplicatedExpense = {
      ...expense,
      name: `${expense.name} (Copy)`,
      date: new Date().toISOString(),
    };
    delete (duplicatedExpense as any).id;
    handleAddExpense(duplicatedExpense);
    toast.success('Expense duplicated successfully');
  };

  const handleDelete = (id: string) => {
    setDeleteExpenseId(id);
  };

  const confirmDelete = () => {
    if (deleteExpenseId) {
      onDeleteExpense(deleteExpenseId);
      toast.success('Expense deleted successfully');
      setDeleteExpenseId(null);
    }
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    onAddExpense(expense);
    setIsAddDialogOpen(false);
    toast.success('Expense added successfully');
  };

  const handleEditExpense = (expense: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      onEditExpense(editingExpense.id, expense);
      setEditingExpense(null);
      toast.success('Expense updated successfully');
    }
  };

  const toggleSelectExpense = (id: string) => {
    setSelectedExpenseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedExpenseIds.size === filteredExpenses.length) {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedExpenseIds(new Set(filteredExpenses.map((exp) => exp.id)));
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    const idsToDelete = Array.from(selectedExpenseIds);
    const count = idsToDelete.length;

    try {
      await Promise.all(idsToDelete.map((id) => onDeleteExpense(id)));
      toast.success(`${count} expense(s) deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete some expenses');
    } finally {
      setSelectedExpenseIds(new Set());
      setShowBulkDeleteDialog(false);
    }
  };

  const expensesByType = filteredExpenses.reduce((acc, exp) => {
    acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for monthly spending chart
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = months.map((month, index) => {
      const monthTotal = filteredExpenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === index && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      return {
        month,
        amount: monthTotal,
      };
    });

    return monthlyExpenses;
  }, [filteredExpenses]);

  // Prepare data for category pie chart
  const fallbackColors = ['#16a34a','#34d399','#86efac','#0f766e','#22c55e','#bbf7d0','#065f46','#064e3b'];

  function generateColor(key: string) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return fallbackColors[Math.abs(hash) % fallbackColors.length];
  }

  const categoryData = useMemo(() => {
    return Object.entries(expensesByType).map(([type, amount]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: amount,
      color: chartColors[type as keyof typeof chartColors] || generateColor(type),
    }));
  }, [expensesByType]);

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, var(--background), color-mix(in srgb, var(--background) 80%, #ffffff))'}}>
      {/* Header */}
      <div className="text-white shadow-lg" style={{background: 'linear-gradient(90deg, var(--primary), var(--secondary))'}}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-white">
                  <Logo width={200} height={56} />
                </div>
              </div>
              <p className="text-primary-foreground">Welcome back, {user.name}!</p>
            </div>
            <Button
              onClick={onSignOut}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Filter */}
        <Card className="p-4 mb-6 bg-white shadow-lg border-0 relative overflow-visible">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <span className="text-gray-700">Filter by:</span>
            </div>
            
            <Tabs value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)} className="flex-1">
              <TabsList className="bg-gray-100">
                <TabsTrigger
                  value="day"
                  style={{
                    backgroundColor: filterType === 'day' ? '#16a34a' : undefined,
                    color: filterType === 'day' ? 'white' : undefined,
                    borderColor: filterType === 'day' ? '#16a34a' : undefined,
                  }}
                  className="transition-all"
                >
                  Day
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  style={{
                    backgroundColor: filterType === 'week' ? '#16a34a' : undefined,
                    color: filterType === 'week' ? 'white' : undefined,
                    borderColor: filterType === 'week' ? '#16a34a' : undefined,
                  }}
                  className="transition-all"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  style={{
                    backgroundColor: filterType === 'month' ? '#16a34a' : undefined,
                    color: filterType === 'month' ? 'white' : undefined,
                    borderColor: filterType === 'month' ? '#16a34a' : undefined,
                  }}
                  className="transition-all"
                >
                  Month
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  style={{
                    backgroundColor: filterType === 'custom' ? '#16a34a' : undefined,
                    color: filterType === 'custom' ? 'white' : undefined,
                    borderColor: filterType === 'custom' ? '#16a34a' : undefined,
                  }}
                  className="transition-all"
                >
                  Custom
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {filterType === 'custom' && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex flex-col">
                    <Button
                      variant="outline"
                      className="justify-start text-left border"
                      style={{ borderColor: 'rgba(22,163,74,0.12)' }}
                      onClick={() => setIsStartDateOpen((prev) => !prev)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {customStartDate ? format(customStartDate, 'PP') : 'Start Date'}
                    </Button>
                    {isStartDateOpen && (
                      <div className="mt-2 p-3 bg-white border rounded-lg shadow-sm" style={{borderColor: 'rgba(22,163,74,0.08)'}}>
                        <div className="flex justify-center py-4">
                          <DatePicker
                              selected={customStartDate ?? null}
                              onChange={(date: Date | null) => {
                                if (date) setCustomStartDate(date);
                                setIsStartDateOpen(false);
                              }}
                              inline
                            />
                        </div>
                      </div>
                    )}
                  </div>

                <span className="text-gray-500">to</span>

                <div className="inline-flex flex-col">
                    <Button
                      variant="outline"
                      className="justify-start text-left border"
                      style={{ borderColor: 'rgba(22,163,74,0.12)' }}
                      onClick={() => setIsEndDateOpen((prev) => !prev)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {customEndDate ? format(customEndDate, 'PP') : 'End Date'}
                    </Button>
                    {isEndDateOpen && (
                      <div className="mt-2 p-3 bg-white border rounded-lg shadow-sm" style={{borderColor: 'rgba(22,163,74,0.08)'}}>
                        <div className="flex justify-center py-4">
                          <DatePicker
                              selected={customEndDate ?? null}
                              onChange={(date: Date | null) => {
                                if (date) setCustomEndDate(date);
                                setIsEndDateOpen(false);
                              }}
                              inline
                            />
                        </div>
                      </div>
                    )}
                  </div>
              </div>
            )}
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-lg border-0" style={{background: 'linear-gradient(135deg, var(--primary), var(--secondary))'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground mb-2">Total Expenses</p>
                <p className="text-white">{formatCurrency(totalExpense)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-lg font-semibold">₨</span>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-lg border-0" style={{background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 60%, #065f46 40%), var(--primary))'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground mb-2">Number of Expenses</p>
                <p className="text-white">{filteredExpenses.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Hash className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-lg border-0" style={{background: 'linear-gradient(135deg, var(--secondary), var(--accent))'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground mb-2">Categories</p>
                <p className="text-white">{Object.keys(expensesByType).length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content: Charts on Left, Expenses on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Charts */}
          <div className="space-y-6 flex flex-col">
            {/* Spending Trend Chart */}
            <Card className="p-6 bg-white shadow-lg border-0 flex-1">
              <h3 className="text-gray-800 mb-2">Spending Trend</h3>
              <p className="text-gray-500 mb-4">Monthly expenses for {new Date().getFullYear()}</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Category Breakdown Chart */}
            <Card className="p-6 bg-white shadow-lg border-0 flex-1" >
              <h3 className="text-gray-800 mb-2">Category Breakdown</h3>
              <p className="text-gray-500 mb-4">Expenses by category</p>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400">
                  No expense data to display
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Expenses List */}
          <div className="flex flex-col">
            <Card className="p-6 bg-white shadow-lg border-0 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {filteredExpenses.length > 0 && (
                    <Checkbox
                      checked={selectedExpenseIds.size === filteredExpenses.length && filteredExpenses.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all expenses"
                    />
                  )}
                  <h2 className="text-gray-800">All Expenses</h2>
                  {selectedExpenseIds.size > 0 && (
                    <span className="text-sm text-gray-500">
                      ({selectedExpenseIds.size} selected)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedExpenseIds.size > 0 && (
                    <Button
                      onClick={handleBulkDelete}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">No expenses yet. Start tracking your spending!</p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      variant="outline"
                      className="border text-primary text-primary-foreground"
                      style={{ borderColor: 'var(--primary)' }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Expense
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {filteredExpenses.map((expense) => {
                    const iconKey = (expense as any).icon;
                    let iconElement: JSX.Element = <Grid3x3 className="w-5 h-5" />;
                    if (iconKey === 'plane') iconElement = <Plane className="w-5 h-5" />;
                    else if (iconKey === 'train') iconElement = <span className="text-xl">🚆</span>;
                    else if (iconKey === 'bike') iconElement = <span className="text-xl">🚲</span>;
                    else if (iconKey === 'car') iconElement = <span className="text-xl">🚗</span>;
                    else {
                      const IconComp = expenseTypeIcons[expense.type];
                      iconElement = IconComp ? <IconComp className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />;
                    }

                    const colorClass = expenseTypeColors[expense.type] || 'bg-gray-100 text-gray-700';

                    return (
                      <div key={expense.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={selectedExpenseIds.has(expense.id)}
                              onCheckedChange={() => toggleSelectExpense(expense.id)}
                              aria-label={`Select ${expense.name}`}
                            />
                            <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                              {iconElement}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-gray-800 truncate">{expense.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className={`${colorClass} text-xs`}>
                                  {expense.type}
                                </Badge>
                                <span className="text-gray-400 text-xs">
                                  {new Date(expense.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <p className="text-gray-900 whitespace-nowrap">{formatCurrency(expense.amount)}</p>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => handleEdit(expense)}
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 w-8 p-0"
                                title="Edit expense"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDuplicate(expense)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                                title="Duplicate expense"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(expense.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                title="Delete expense"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Add Expense Dialog */}
      <ExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddExpense}
        title="Add New Expense"
      />

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <ExpenseDialog
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          onSubmit={handleEditExpense}
          title="Edit Expense"
          initialData={editingExpense}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteExpenseId} onOpenChange={(open) => !open && setDeleteExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedExpenseIds.size} expense(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700">
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
