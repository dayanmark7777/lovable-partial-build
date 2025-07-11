
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, MapPin, Users, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScheduleClassForm } from "@/components/forms/ScheduleClassForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LecturersSchedule = () => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [schedulingLecturer, setSchedulingLecturer] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLecturers();
    fetchSchedules();
  }, []);

  const fetchLecturers = async () => {
    try {
      const { data, error } = await supabase
        .from('lecturers')
        .select('*')
        .eq('status', 'Active')
        .order('name');

      if (error) throw error;
      setLecturers(data || []);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      toast({
        title: "Error",
        description: "Failed to load lecturers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          lecturers(name, email),
          classes(name)
        `)
        .eq('status', 'Scheduled')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date')
        .order('start_time');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Failed to load schedules. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleClass = () => {
    fetchSchedules();
    setIsScheduleDialogOpen(false);
    setSchedulingLecturer(null);
    toast({
      title: "Success",
      description: "Class has been scheduled successfully.",
    });
  };

  const openScheduleDialog = (lecturer: any) => {
    console.log("Opening schedule dialog for lecturer:", lecturer.name);
    setSchedulingLecturer(lecturer);
    setIsScheduleDialogOpen(true);
  };

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduleDate >= today;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lecturers Schedule</h1>
          <p className="text-muted-foreground">Schedule classes and manage lecturer assignments</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturers.length}</div>
            <p className="text-xs text-muted-foreground">Ready to teach</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => 
                new Date(s.scheduled_date).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Classes today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(lecturers.flatMap(l => l.subjects || [])).size}
            </div>
            <p className="text-xs text-muted-foreground">Available topics</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Lecturers */}
        <Card>
          <CardHeader>
            <CardTitle>Available Lecturers</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search lecturers..." 
                  className="pl-9" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading lecturers...</div>
            ) : (
              <div className="space-y-4">
                {filteredLecturers.map((lecturer) => (
                  <div key={lecturer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{lecturer.name}</h3>
                      <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lecturer.subjects && lecturer.subjects.slice(0, 2).map((subject: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {lecturer.subjects && lecturer.subjects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{lecturer.subjects.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => openScheduleDialog(lecturer)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      variant="outline"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedules */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming schedules found
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSchedules.slice(0, 10).map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{schedule.classes?.name || 'Unknown Class'}</h3>
                      <p className="text-sm text-muted-foreground">{schedule.lecturers?.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(schedule.scheduled_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </div>
                        {schedule.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {schedule.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="default">
                      {schedule.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Class</DialogTitle>
            <DialogDescription>
              Schedule a new class for the selected lecturer.
            </DialogDescription>
          </DialogHeader>
          {schedulingLecturer && (
            <ScheduleClassForm
              lecturerId={schedulingLecturer.id}
              lecturerName={schedulingLecturer.name}
              onSubmit={handleScheduleClass}
              onCancel={() => {
                setIsScheduleDialogOpen(false);
                setSchedulingLecturer(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LecturersSchedule;
