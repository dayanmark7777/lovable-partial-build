
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, BookOpen, FileText, Clock, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddCourseFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: {
    courseCode: string;
    courseName: string;
    courseType: string;
    duration: string;
    description: string;
    subjects: string[];
  };
}

export const AddCourseForm = ({ onSubmit, onCancel, initialData }: AddCourseFormProps) => {
  const [formData, setFormData] = useState({
    code: initialData?.courseCode || "",
    name: initialData?.courseName || "",
    type: initialData?.courseType || "",
    duration: initialData?.duration || "",
    description: initialData?.description || ""
  });

  const [subjects, setSubjects] = useState<string[]>(initialData?.subjects || []);
  const [newSubject, setNewSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.courseCode,
        name: initialData.courseName,
        type: initialData.courseType,
        duration: initialData.duration,
        description: initialData.description
      });
      setSubjects(initialData.subjects || []);
    }
  }, [initialData]);

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setSubjects(subjects.filter(subject => subject !== subjectToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData) {
        // Edit mode - return data for parent to handle
        onSubmit({
          ...formData,
          subjects: subjects.length > 0 ? subjects : null
        });
      } else {
        // Create mode - insert into database
        const { data, error } = await supabase
          .from('courses')
          .insert([{
            ...formData,
            subjects: subjects.length > 0 ? subjects : null
          }])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Course Created",
          description: `${formData.name} has been successfully created.`,
        });

        onSubmit(data);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-6 p-1">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Edit Course" : "Create New Course"}
          </h2>
          <p className="text-gray-600">
            {initialData ? "Update course details" : "Add a new course to the curriculum"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Course Information</h3>
            </div>
            <p className="text-sm text-gray-600">Enter the details for the course</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Course Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. BS101"
                  className="h-10"
                  required
                />
                <p className="text-xs text-gray-500">Unique identifier for the course</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Course Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Course Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Introduction to Biblical Studies"
                className="h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                Duration <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 6 months"
                  className="h-10 pl-9"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Expected length of the course</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description <span className="text-gray-400">(Optional)</span>
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the course content and objectives..."
                  className="min-h-[80px] pl-9"
                />
              </div>
            </div>
          </div>

          {/* Course Subjects Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Tag className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Course Subjects</h3>
            </div>
            <p className="text-sm text-gray-600">Add subjects that will be covered in this course</p>

            <div className="flex space-x-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter subject name"
                className="h-10"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
              />
              <Button type="button" onClick={addSubject} size="sm" className="h-10 px-4">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {subjects.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Added Subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {subject}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeSubject(subject)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-500 italic">No subjects added yet</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              <BookOpen className="h-4 w-4 mr-2" />
              {isLoading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Course" : "Create Course")}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </div>
  );
};
