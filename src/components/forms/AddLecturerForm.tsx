import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, User, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddLecturerFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    email: string;
    phone: string;
    subjects: string[];
  };
}

export const AddLecturerForm = ({ onSubmit, onCancel, initialData }: AddLecturerFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || ""
  });

  const [subjects, setSubjects] = useState<string[]>(initialData?.subjects || []);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [courseSubjects, setCourseSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone
      });
      setSubjects(initialData.subjects || []);
    }
  }, [initialData]);

  useEffect(() => {
    fetchCourseSubjects();
  }, []);

  const fetchCourseSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('subjects')
        .not('subjects', 'is', null);

      if (error) throw error;

      // Extract and flatten all subjects from all courses
      const allSubjects = data
        .flatMap(course => course.subjects || [])
        .filter((subject, index, arr) => arr.indexOf(subject) === index) // Remove duplicates
        .sort();

      setCourseSubjects(allSubjects);
    } catch (error) {
      console.error("Error fetching course subjects:", error);
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const addSelectedSubject = () => {
    if (selectedSubject && !subjects.includes(selectedSubject)) {
      setSubjects([...subjects, selectedSubject]);
      setSelectedSubject("");
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
          .from('lecturers')
          .insert([{
            ...formData,
            subjects: subjects.length > 0 ? subjects : null
          }])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Lecturer Added",
          description: `${formData.name} has been successfully added.`,
        });

        onSubmit(data);
      }
    } catch (error) {
      console.error("Error creating lecturer:", error);
      toast({
        title: "Error",
        description: "Failed to add lecturer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get available course subjects (not already added)
  const availableCourseSubjects = courseSubjects.filter(subject => !subjects.includes(subject));

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-6 p-1">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Edit Lecturer" : "Add New Lecturer"}
          </h2>
          <p className="text-gray-600">
            {initialData ? "Update lecturer details" : "Add a new lecturer to the system"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lecturer Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Lecturer Information</h3>
            </div>
            <p className="text-sm text-gray-600">Enter the details of the lecturer</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rev. Michael Johnson"
                    className="h-10 pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Full name with title if applicable</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. michael.j@example.com"
                    className="h-10 pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Work email address</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone <span className="text-gray-400">(Optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +94 77 123 4567"
                    className="h-10 pl-9"
                  />
                </div>
                <p className="text-xs text-gray-500">Contact phone number</p>
              </div>
            </div>
          </div>

          {/* Subjects Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <div className="h-5 w-5 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Subjects</h3>
            </div>

            {/* Select from existing course subjects */}
            {availableCourseSubjects.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Select from Course Subjects
                </Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a subject from courses" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourseSubjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    onClick={addSelectedSubject} 
                    size="sm" 
                    className="h-10 px-4"
                    disabled={!selectedSubject || subjects.includes(selectedSubject)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Add custom subject */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Or Add Custom Subject
              </Label>
              <div className="flex space-x-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter custom subject name"
                  className="h-10"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                />
                <Button type="button" onClick={addSubject} size="sm" className="h-10 px-4">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
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
              <User className="h-4 w-4 mr-2" />
              {isLoading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Lecturer" : "Add Lecturer")}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </div>
  );
};
