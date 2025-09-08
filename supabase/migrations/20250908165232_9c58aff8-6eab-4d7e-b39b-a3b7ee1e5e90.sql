-- Add RLS policy to allow patients to create their own appointments
CREATE POLICY "Patients can create their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'patient'::user_role)))) 
  AND (auth.uid() = patient_id)
);