import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orytchawzooiabfwwqek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeXRjaGF3em9vaWFiZnd3cWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NDc4NzMsImV4cCI6MjA5MjMyMzg3M30.JjdgQtIBmzD8qjh0TE2pYtL4DUbjEKORLnmFwgz8HVw';

export const supabase = createClient(supabaseUrl, supabaseKey);
/*
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false  // 브라우저 종료 시 세션 삭제
  }
})
*/