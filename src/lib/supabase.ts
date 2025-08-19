import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = "https://iixlgfokoblhmiergwgd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGxnZm9rb2JsaG1pZXJnd2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njc5NDcsImV4cCI6MjA3MTE0Mzk0N30.3Jmy2emN--QZNQPKDa-6VUBKmBl0HRrBT1n7VInUq5Y";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);