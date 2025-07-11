
-- Add a schedules table to track class schedules
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  lecturer_id UUID REFERENCES public.lecturers(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create policy for schedules
CREATE POLICY "Allow all operations on schedules" 
  ON public.schedules 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create index for performance on date/time queries
CREATE INDEX idx_schedules_lecturer_datetime ON public.schedules(lecturer_id, scheduled_date, start_time, end_time);

-- Create a function to check for scheduling conflicts
CREATE OR REPLACE FUNCTION check_lecturer_availability(
  p_lecturer_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_schedule_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.schedules 
    WHERE lecturer_id = p_lecturer_id 
      AND scheduled_date = p_date
      AND status = 'Scheduled'
      AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id)
      AND (
        -- Check for time overlap
        (p_start_time < end_time AND p_end_time > start_time)
      )
  );
END;
$$;
