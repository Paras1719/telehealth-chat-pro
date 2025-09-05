-- Drop the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure, role-based policies for profile access
-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Patients can view doctor profiles (for booking appointments)
CREATE POLICY "Patients can view doctor profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles viewer_profile
    WHERE viewer_profile.user_id = auth.uid() 
    AND viewer_profile.role = 'patient'
  ) 
  AND role = 'doctor'
);

-- Policy 3: Doctors can view patient profiles (for medical purposes)  
CREATE POLICY "Doctors can view patient profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles viewer_profile
    WHERE viewer_profile.user_id = auth.uid() 
    AND viewer_profile.role = 'doctor'
  ) 
  AND role = 'patient'
);