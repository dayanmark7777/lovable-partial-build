
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, GraduationCap, Phone, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface AddClassFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: {
    className: string;
    courseId: string;
    districtLeaderName: string;
    district: string;
    classCenterName: string;
    classCenterAddress: string;
    classOrganizerName: string;
    contactNumber: string;
    classStatus: string;
  };
}

const sriLankanDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", 
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", 
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", 
  "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

export const AddClassForm = ({ onSubmit, onCancel, initialData }: AddClassFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.className || "",
    course_id: initialData?.courseId || "",
    district_leader_name: initialData?.districtLeaderName || "",
    district: initialData?.district || "",
    class_center_name: initialData?.classCenterName || "",
    class_center_address: initialData?.classCenterAddress || "",
    class_organizer_name: initialData?.classOrganizerName || "",
    contact_number: initialData?.contactNumber || "",
    status: initialData?.classStatus || "Active"
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.className,
        course_id: initialData.courseId,
        district_leader_name: initialData.districtLeaderName,
        district: initialData.district,
        class_center_name: initialData.classCenterName,
        class_center_address: initialData.classCenterAddress,
        class_organizer_name: initialData.classOrganizerName,
        contact_number: initialData.contactNumber,
        status: initialData.classStatus
      });
    }
  }, [initialData]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData) {
        // Edit mode - return data for parent to handle
        onSubmit(formData);
      } else {
        // Create mode - insert into database
        const { data, error } = await supabase
          .from('classes')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Class Created",
          description: `${formData.name} has been successfully created.`,
        });

        onSubmit(data);
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
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
            {initialData ? "Edit Class" : "Create New Class"}
          </h2>
          <p className="text-gray-600">
            {initialData ? "Update class details" : "Set up a new class session"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Class Information</h3>
            </div>
            <p className="text-sm text-gray-600">Enter the details for the class</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Class Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. BS101-Evening-Colombo"
                    className="h-10 pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">A descriptive name for this class session</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course" className="text-sm font-medium text-gray-700">
                  Course <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.course_id} 
                  onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  disabled={isLoadingCourses}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select a course"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district_leader_name" className="text-sm font-medium text-gray-700">
                    District Leader Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="district_leader_name"
                      value={formData.district_leader_name}
                      onChange={(e) => setFormData({ ...formData, district_leader_name: e.target.value })}
                      placeholder="e.g. Rev. John Silva"
                      className="h-10 pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.district} 
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                  >
                    <SelectTrigger className="h-10">
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

              <div className="space-y-2">
                <Label htmlFor="class_center_name" className="text-sm font-medium text-gray-700">
                  Class Center Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="class_center_name"
                    value={formData.class_center_name}
                    onChange={(e) => setFormData({ ...formData, class_center_name: e.target.value })}
                    placeholder="e.g. St. John's Church Hall"
                    className="h-10 pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_center_address" className="text-sm font-medium text-gray-700">
                  Class Center Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="class_center_address"
                    value={formData.class_center_address}
                    onChange={(e) => setFormData({ ...formData, class_center_address: e.target.value })}
                    placeholder="e.g. 123 Main Street, Colombo 03"
                    className="h-10 pl-9"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class_organizer_name" className="text-sm font-medium text-gray-700">
                    Class Organizer Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="class_organizer_name"
                      value={formData.class_organizer_name}
                      onChange={(e) => setFormData({ ...formData, class_organizer_name: e.target.value })}
                      placeholder="e.g. Mrs. Mary Fernando"
                      className="h-10 pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number" className="text-sm font-medium text-gray-700">
                    Contact Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      placeholder="e.g. +94 77 123 4567"
                      className="h-10 pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Class Status <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              <GraduationCap className="h-4 w-4 mr-2" />
              {isLoading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Class" : "Create Class")}
            </Button>
          </DialogFooter>
        </form>
      </div>
    </div>
  );
};
