
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScheduleClassFormProps {
  lecturerId: string;
  lecturerName: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ScheduleClassForm = ({ lecturerId, lecturerName, onSubmit, onCancel }: ScheduleClassFormProps) => {
  const [formData, setFormData] = useState({
    classId: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: ""
  });
  
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('status', 'Active')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const checkAvailability = async () => {
    if (!formData.scheduledDate || !formData.startTime || !formData.endTime) {
      return true;
    }

    try {
      const { data, error } = await supabase
        .rpc('check_lecturer_availability', {
          p_lecturer_id: lecturerId,
          p_date: formData.scheduledDate,
          p_start_time: formData.startTime,
          p_end_time: formData.endTime
        });

      if (error) throw error;
      
      if (!data) {
        setAvailabilityError("Lecturer is not available at this time. Please choose a different time slot.");
        return false;
      }
      
      setAvailabilityError("");
      return true;
    } catch (error) {
      console.error("Error checking availability:", error);
      return true; // Allow submission if check fails
    }
  };

  const handleTimeChange = async (field: 'startTime' | 'endTime', value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    
    // Check availability when both times are set
    if (updatedData.startTime && updatedData.endTime && updatedData.scheduledDate) {
      setTimeout(checkAvailability, 300); // Debounce
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Final availability check
      const isAvailable = await checkAvailability();
      if (!isAvailable) {
        setIsLoading(false);
        return;
      }

      // Validate end time is after start time
      if (formData.startTime >= formData.endTime) {
        toast({
          title: "Invalid Time",
          description: "End time must be after start time.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('schedules')
        .insert([{
          class_id: formData.classId,
          lecturer_id: lecturerId,
          scheduled_date: formData.scheduledDate,
          start_time: formData.startTime,
          end_time: formData.endTime,
          location: formData.location || null,
          notes: formData.notes || null
        }]);

      if (error) throw error;

      toast({
        title: "Class Scheduled",
        description: `Class has been scheduled for ${lecturerName}.`,
      });

      onSubmit();
    } catch (error) {
      console.error("Error scheduling class:", error);
      toast({
        title: "Error",
        description: "Failed to schedule class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Schedule Class</h2>
        <p className="text-gray-600">Schedule a class for {lecturerName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="class" className="text-sm font-medium text-gray-700">
            Class <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="date"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="pl-9"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
              End Time <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
        </div>

        {availabilityError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{availabilityError}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-gray-700">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Room 101, Main Building"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
            Notes
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or instructions..."
              className="pl-9 min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !!availabilityError} 
            className="w-full sm:w-auto"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isLoading ? "Scheduling..." : "Schedule Class"}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
};
