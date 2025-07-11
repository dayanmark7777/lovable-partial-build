
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Basic', 'Intermediate', 'Advanced')),
  duration TEXT NOT NULL,
  description TEXT,
  subjects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  district_leader_name TEXT NOT NULL,
  district TEXT NOT NULL,
  class_center_name TEXT NOT NULL,
  class_center_address TEXT NOT NULL,
  class_organizer_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lecturers table
CREATE TABLE public.lecturers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  subjects TEXT[],
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  index_number TEXT NOT NULL UNIQUE,
  national_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT NOT NULL,
  district TEXT NOT NULL,
  personal_file_url TEXT,
  systematic_theology_project BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_course_enrollments table (many-to-many relationship)
CREATE TABLE public.student_course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Dropped')),
  UNIQUE(student_id, course_id)
);

-- Create lecturer_class_assignments table (many-to-many relationship)
CREATE TABLE public.lecturer_class_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lecturer_id UUID REFERENCES public.lecturers(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  schedule_info JSONB,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Inactive')),
  UNIQUE(lecturer_id, class_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturer_class_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing full access for now - you can restrict based on user roles later)
CREATE POLICY "Allow all operations on courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lecturers" ON public.lecturers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on student_course_enrollments" ON public.student_course_enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lecturer_class_assignments" ON public.lecturer_class_assignments FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_classes_course_id ON public.classes(course_id);
CREATE INDEX idx_student_course_enrollments_student_id ON public.student_course_enrollments(student_id);
CREATE INDEX idx_student_course_enrollments_course_id ON public.student_course_enrollments(course_id);
CREATE INDEX idx_student_course_enrollments_class_id ON public.student_course_enrollments(class_id);
CREATE INDEX idx_lecturer_class_assignments_lecturer_id ON public.lecturer_class_assignments(lecturer_id);
CREATE INDEX idx_lecturer_class_assignments_class_id ON public.lecturer_class_assignments(class_id);
