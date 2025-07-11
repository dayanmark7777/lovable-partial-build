import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Link, BookOpen, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddStudentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const sriLankanDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", 
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", 
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", 
  "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

export const AddStudentForm = ({ onSubmit, onCancel, initialData }: AddStudentFormProps) => {
  const [formData, setFormData] = useState({
    studentIndexNumber: "",
    nationalIdNumber: "",
    fullName: "",
    email: "",
    whatsappNumber: "",
    district: "",
    personalFileUrl: "",
    systematicTheologyProject: false,
    courseId: "",
    classId: ""
  });
  
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    fetchCourses();
    // Only fetch all classes initially, filtering will happen via useEffect
  }, [initialData]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');

      if (error) throw error;
      setCourses(data || []);
      
      // Extract unique subjects from all courses
      const subjects = new Set<string>();
      data?.forEach(course => {
        if (course.subjects && Array.isArray(course.subjects)) {
          course.subjects.forEach((subject: string) => subjects.add(subject));
        }
      });
      setAvailableSubjects(Array.from(subjects));
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchClasses = async (district?: string, courseId?: string) => {
    try {
      let query = supabase
        .from('classes')
        .select('*, courses(name, code)')
        .order('name');

      // Filter by district if provided
      if (district) {
        query = query.eq('district', district);
      }

      // Filter by course if provided
      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter classes when district or course changes
  useEffect(() => {
    if (formData.district || formData.courseId) {
      fetchClasses(formData.district, formData.courseId);
      // Clear class selection when filters change
      if (formData.classId) {
        setFormData(prev => ({ ...prev, classId: "" }));
      }
    } else {
      fetchClasses();
    }
  }, [formData.district, formData.courseId]);

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Include selected subjects in the form data
    const submitData = {
      ...formData,
      subjects: selectedSubjects
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="text-center space-y-3 mb-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Student' : 'Add New Student'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {initialData ? 'Update the student details below' : 'Enter the new student\'s details below'}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-sm bg-gray-50/50">
          <CardContent className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentIndexNumber" className="text-sm font-medium">
                  Student Index Number *
                </Label>
                <Input
                  id="studentIndexNumber"
                  value={formData.studentIndexNumber}
                  onChange={(e) => setFormData({ ...formData, studentIndexNumber: e.target.value })}
                  placeholder="ST2024001"
                  className="bg-white"
                  required
                />
                <p className="text-xs text-gray-500">Unique identifier for the student</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalIdNumber" className="text-sm font-medium">
                  National ID Number *
                </Label>
                <Input
                  id="nationalIdNumber"
                  value={formData.nationalIdNumber}
                  onChange={(e) => setFormData({ ...formData, nationalIdNumber: e.target.value })}
                  placeholder="199812345678"
                  className="bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe Silva"
                className="bg-white"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gray-50/50">
          <CardContent className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.silva@example.com"
                className="bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp Number *
                </Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  District *
                </Label>
                <Select 
                  value={formData.district} 
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {sriLankanDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gray-50/50">
          <CardContent className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Academic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseId" className="text-sm font-medium">
                  Course *
                </Label>
                <Select 
                  value={formData.courseId} 
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId" className="text-sm font-medium">
                  Class *
                </Label>
                <Select 
                  value={formData.classId} 
                  onValueChange={(value) => setFormData({ ...formData, classId: value })}
                  disabled={!formData.district || !formData.courseId}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={
                      !formData.district || !formData.courseId 
                        ? "Select district and course first" 
                        : "Select class"
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {classes.length === 0 && formData.district && formData.courseId && (
                  <p className="text-xs text-orange-600">
                    No classes found for selected district and course
                  </p>
                )}
              </div>
            </div>

            {availableSubjects.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Subjects
                  <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableSubjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2 p-2 bg-white rounded border">
                      <Checkbox
                        id={`subject-${subject}`}
                        checked={selectedSubjects.includes(subject)}
                        onCheckedChange={() => handleSubjectToggle(subject)}
                      />
                      <Label htmlFor={`subject-${subject}`} className="text-sm">
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gray-50/50">
          <CardContent className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Link className="h-4 w-4" />
              Additional Information
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="personalFileUrl" className="text-sm font-medium">
                Personal File URL
                <span className="text-gray-400 text-xs ml-1">(Optional)</span>
              </Label>
              <Input
                id="personalFileUrl"
                type="url"
                value={formData.personalFileUrl}
                onChange={(e) => setFormData({ ...formData, personalFileUrl: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="bg-white"
              />
              <p className="text-xs text-gray-500">Link to student's personal file storage</p>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Checkbox
                id="systematicTheologyProject"
                checked={formData.systematicTheologyProject}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, systematicTheologyProject: checked as boolean })
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="systematicTheologyProject" className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Systematic Theology Project Submitted
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Check if the student has submitted their theology project
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 sm:flex-none bg-primary hover:bg-primary/90">
            {initialData ? 'Update Student' : 'Add Student'}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
};
