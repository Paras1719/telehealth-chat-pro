-- First, drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Patients can view doctor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can view patient profiles" ON public.profiles;

-- Create a security definer function to get current user's role (prevents recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create secure policies using the function (no recursion)
CREATE POLICY "Patients can view doctor profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'patient' AND role = 'doctor');

CREATE POLICY "Doctors can view patient profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'doctor' AND role = 'patient');