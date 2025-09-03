-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  diagnosis TEXT NOT NULL,
  medications JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for prescriptions
CREATE POLICY "Doctors can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'doctor'::user_role
  ) AND doctor_id = auth.uid()
);

CREATE POLICY "Doctors can view their prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Patients can view their prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (
  patient_id = auth.uid() OR 
  (patient_id IS NULL AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'patient'::user_role 
    AND full_name = patient_name
  ))
);

CREATE POLICY "Doctors can update their prescriptions" 
ON public.prescriptions 
FOR UPDATE 
USING (doctor_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_patient_name ON public.prescriptions(patient_name);
CREATE INDEX idx_prescriptions_created_at ON public.prescriptions(created_at DESC);