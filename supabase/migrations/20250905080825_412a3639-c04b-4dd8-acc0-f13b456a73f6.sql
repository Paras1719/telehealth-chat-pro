-- Fix critical security vulnerability in prescriptions access

-- First, update any existing prescriptions with null patient_id to have proper patient_id
-- This matches patients based on their registered full name (one-time cleanup)
UPDATE public.prescriptions 
SET patient_id = profiles.user_id
FROM public.profiles 
WHERE prescriptions.patient_id IS NULL 
  AND profiles.full_name = prescriptions.patient_name 
  AND profiles.role = 'patient';

-- Make patient_id mandatory going forward
ALTER TABLE public.prescriptions 
ALTER COLUMN patient_id SET NOT NULL;

-- Drop the vulnerable policy that allows name-based access
DROP POLICY IF EXISTS "Patients can view their prescriptions" ON public.prescriptions;

-- Create secure policy that only allows access via verified patient_id
CREATE POLICY "Patients can view their own prescriptions only" 
ON public.prescriptions 
FOR SELECT 
USING (patient_id = auth.uid());

-- Ensure doctors can still view prescriptions they created
-- (this policy should already exist, but making sure)
DROP POLICY IF EXISTS "Doctors can view their prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors can view their prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (doctor_id = auth.uid());