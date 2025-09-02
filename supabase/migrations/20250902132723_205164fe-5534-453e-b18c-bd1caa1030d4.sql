-- Create doctor_schedules table for managing doctor availability
CREATE TABLE public.doctor_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  max_appointments INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Basic constraint to ensure end time is after start time
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  
  -- Unique constraint for doctor, date, and time combination
  CONSTRAINT unique_doctor_date_time UNIQUE (doctor_id, date, start_time, end_time)
);

-- Enable RLS
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own schedules
CREATE POLICY "Doctors can view their own schedules"
ON public.doctor_schedules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'doctor'
    AND profiles.user_id = doctor_id
  )
);

CREATE POLICY "Doctors can create their own schedules"
ON public.doctor_schedules
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'doctor'
    AND profiles.user_id = doctor_id
  )
  AND doctor_id = auth.uid()
);

CREATE POLICY "Doctors can update their own schedules"
ON public.doctor_schedules
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'doctor'
    AND profiles.user_id = doctor_id
  )
);

CREATE POLICY "Doctors can delete their own schedules"
ON public.doctor_schedules
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'doctor'
    AND profiles.user_id = doctor_id
  )
);

-- Patients can view available schedules for booking
CREATE POLICY "Patients can view available schedules"
ON public.doctor_schedules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'patient'
  )
  AND status = 'available'
  AND date >= CURRENT_DATE
);

-- Add trigger for updated_at
CREATE TRIGGER update_doctor_schedules_updated_at
BEFORE UPDATE ON public.doctor_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_doctor_schedules_doctor_date ON public.doctor_schedules(doctor_id, date);
CREATE INDEX idx_doctor_schedules_status ON public.doctor_schedules(status);
CREATE INDEX idx_doctor_schedules_available ON public.doctor_schedules(date, status) WHERE status = 'available';