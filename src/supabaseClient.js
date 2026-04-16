import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://knpchfkozppmenmdbxwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucGNoZmtvenBwbWVubWRieHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjI1NDcsImV4cCI6MjA5MDI5ODU0N30.A9pE86QJLSi9Q53_0KqJlpLFXYnQjOpqEr8-O-CC0eY';

export const supabase = createClient(supabaseUrl, supabaseKey);
