import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhygtcqscsjiadgzzouq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoeWd0Y3FzY3NqaWFkZ3p6b3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDg5OTgsImV4cCI6MjA4NDMyNDk5OH0.hE3dYoxdHM0T7wU8Y8OweS1JXpaBiSJzllHOiuCNHB4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
