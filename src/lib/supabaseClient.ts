import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylennxgzqlorgnadjwza.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZW5ueGd6cWxvcmduYWRqd3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTIxNjQsImV4cCI6MjA3NTYyODE2NH0.MxbZIP-eFSNiV9UHqaV_MzHBTSHuQoAO5plu-z2rY2k';

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
