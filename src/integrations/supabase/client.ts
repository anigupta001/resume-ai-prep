// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xpcnlgeldcwltjojalsz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwY25sZ2VsZGN3bHRqb2phbHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mjg3MjIsImV4cCI6MjA2ODAwNDcyMn0.MRriwlVvhJqok--o6iscypiGOCSr-sZIYqml79lINdU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});