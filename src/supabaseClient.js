import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjcmzchaggzizaexzvyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqY216Y2hhZ2d6aXphZXh6dnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDY2MjQsImV4cCI6MjA5MjI4MjYyNH0.zyWEAUua57enHD7QIVjlVX73iEgpG6lxwjdPPQmzsUA';

export const supabase = createClient(supabaseUrl, supabaseKey);