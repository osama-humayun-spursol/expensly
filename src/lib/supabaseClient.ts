import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkydvheltbtmvufvamjs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpreWR2aGVsdGJ0bXZ1ZnZhbWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTY1NjAsImV4cCI6MjA3NzU3MjU2MH0.5QOGvJ4IYoof2QIfE6UJnlkLGcMvPuC7pwy_Q-J2hJg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          icon: string | null;
          amount: number;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          icon?: string | null;
          amount: number;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          icon?: string | null;
          amount?: number;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
