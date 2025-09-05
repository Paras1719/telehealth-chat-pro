-- Fix missing user profile for authenticated user
-- This user exists in auth.users but has no profile in profiles table

INSERT INTO public.profiles (user_id, full_name, role) 
VALUES (
  'cbae1191-36cf-4526-88a8-a2fb69f2a159',
  'Classey',
  'patient'
)
ON CONFLICT (user_id) DO NOTHING;