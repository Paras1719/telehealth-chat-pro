-- Create appointment status enum
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- Create announcement category enum  
CREATE TYPE public.announcement_category AS ENUM ('health_tip', 'news', 'emergency', 'general');

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id),
  doctor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  patient_notes TEXT,
  doctor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(user_id),
  category announcement_category NOT NULL DEFAULT 'general',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on announcements  
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY "Patients can view their own appointments"
ON public.appointments
FOR SELECT
USING (
  auth.uid() = patient_id OR 
  auth.uid() = doctor_id
);

CREATE POLICY "Doctors can create appointments"
ON public.appointments  
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'doctor'
  )
);

CREATE POLICY "Doctors and patients can update their appointments"
ON public.appointments
FOR UPDATE
USING (
  auth.uid() = doctor_id OR 
  (auth.uid() = patient_id AND status = 'scheduled')
);

-- RLS Policies for announcements
CREATE POLICY "Everyone can view published announcements"
ON public.announcements
FOR SELECT
USING (is_published = true);

CREATE POLICY "Authors can view their own announcements"
ON public.announcements
FOR SELECT
USING (auth.uid() = author_id);

CREATE POLICY "Doctors can create announcements"
ON public.announcements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'doctor'
  ) AND auth.uid() = author_id
);

CREATE POLICY "Authors can update their own announcements"
ON public.announcements
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own announcements"
ON public.announcements
FOR DELETE
USING (auth.uid() = author_id);

-- Add triggers for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add useful indexes
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_announcements_published ON public.announcements(is_published, published_at DESC);
CREATE INDEX idx_announcements_category ON public.announcements(category);
CREATE INDEX idx_announcements_author ON public.announcements(author_id);