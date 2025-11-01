import { useState, useEffect } from 'react';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { supabase } from './lib/supabaseClient';
import { toast } from 'sonner';

export type Expense = {
  id: string;
  name: string;
  type: string;
  icon?: string;
  amount: number;
  date: string;
};

export type User = {
  email: string;
  name: string;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'signin' | 'signup' | 'dashboard'>('signin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const ensureProfile = async (userObj: any) => {
      if (!userObj?.id) return;
      try {
        await supabase.from('profiles').upsert({ id: userObj.id, email: userObj.email || null, name: userObj.user_metadata?.name || null, mobile: userObj.user_metadata?.mobile || null }, { onConflict: ['id'] });
      } catch (e) {
        console.warn('Failed ensuring profile row:', e);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setCurrentUser({
          email: u.email || '',
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'User'
        });
        // ensure profile exists for this user
        ensureProfile(u).catch(() => {});
        setCurrentScreen('dashboard');
        fetchExpenses();
      } else {
        setCurrentUser(null);
        setExpenses([]);
        setCurrentScreen('signin');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser({ 
          email: session.user.email || '', 
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User' 
        });
        setCurrentScreen('dashboard');
        await fetchExpenses();
      }
    } catch (error: any) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      setExpenses(data || []);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
    }
  };

  const handleSignUp = async (name: string, email: string, password: string, mobile: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            mobile,
          },
        },
      });

      if (error) throw error;

      // If a user object is returned immediately, create a profile row
      if (data?.user?.id) {
        const userId = data.user.id;
        try {
          const { error: pe } = await supabase.from('profiles').upsert({ id: userId, email, name, mobile }, { onConflict: ['id'] });
          if (pe) console.warn('Profile upsert warning:', pe.message || pe);
        } catch (e) {
          console.error('Error creating profile row:', e);
        }
      }

      toast.success('Account created successfully! Please check your email for verification.');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to sign up');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          user_id: user.id,
          name: expense.name,
          type: expense.type,
          icon: expense.icon,
          amount: expense.amount,
          date: expense.date,
        }])
        .select()
        .single();

      if (error) throw error;

      setExpenses([data, ...expenses]);
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      throw error;
    }
  };

  const handleEditExpense = async (id: string, updatedExpense: Omit<Expense, 'id'>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          name: updatedExpense.name,
          type: updatedExpense.type,
          icon: updatedExpense.icon,
          amount: updatedExpense.amount,
          date: updatedExpense.date,
        })
        .eq('id', id);

      if (error) throw error;

      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...updatedExpense, id } : exp
      ));
    } catch (error: any) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
      throw error;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'signin' && (
        <SignIn 
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setCurrentScreen('signup')}
        />
      )}
      {currentScreen === 'signup' && (
        <SignUp 
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setCurrentScreen('signin')}
        />
      )}
      {currentScreen === 'dashboard' && currentUser && (
        <Dashboard 
          user={currentUser}
          expenses={expenses}
          onSignOut={handleSignOut}
          onAddExpense={handleAddExpense}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      )}
      <Toaster />
    </div>
  );
}
