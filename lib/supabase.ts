import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdhgguquynvakmxghvok.supabase.co';

// Hardcoded API Key
const supabaseKey = 'sb_publishable_BoQLw2xLJPum07PicUwG7A__gtVF02K';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Always return true since the key is now hardcoded in the source
export const isSupabaseConfigured = () => {
  return true;
};

// Deprecated configuration helpers - kept as no-ops to prevent breaking imports
export const configureSupabase = (key: string) => {
  console.log('Supabase key is hardcoded, configuration ignored.');
};

export const resetConfiguration = () => {
  console.log('Supabase key is hardcoded, reset ignored.');
};