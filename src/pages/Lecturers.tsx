import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, BookOpen, Calendar, Award, Edit, Trash2, Clock } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddLecturerForm } from "@/components/forms/AddLecturerForm";
import { ScheduleClassForm } from "@/components/forms/ScheduleClassForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Lecturers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLecturer, setEditingLecturer] = useState<any>(null);
  const [deletingLecturer, setDeletingLecturer] = useState<any>(null);
  const [schedulingLecturer, setSchedulingLecturer] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const { data, error } = await supabase
        .from('lecturers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLecturers(data || []);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      toast({
        title: "Error",
        description: "Failed to load lecturers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLecturer = (data: any) => {
    fetchLecturers();
    setIsDialogOpen(false);
  };

  const handleEditLecturer = async (data: any) => {
    try {
      const { data: updatedLecturer, error } = await supabase
        .from('lecturers')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subjects: data.subjects
        })
        .eq('id', editingLecturer.id)
        .select()
        .single();

      if (error) throw error;

      setLecturers(lecturers.map(l => l.id === editingLecturer.id ? updatedLecturer : l));
      toast({
        title: "Lecturer Updated",
        description: `${data.name} has been successfully updated.`,
      });
      setIsEditDialogOpen(false);
      setEditingLecturer(null);
    } catch (error) {
      console.error("Error updating lecturer:", error);
      toast({
        title: "Error",
        description: "Failed to update lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLecturer = async () => {
    try {
      const { error } = await supabase
        .from('lecturers')
        .delete()
        .eq('id', deletingLecturer.id);

      if (error) throw error;

      setLecturers(lecturers.filter(l => l.id !== deletingLecturer.id));
      toast({
        title: "Lecturer Deleted",
        description: `${deletingLecturer.name} has been removed.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingLecturer(null);
    } catch (error) {
      console.error("Error deleting lecturer:", error);
      toast({
        title: "Error",
        description: "Failed to delete lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleClass = () => {
    setIsScheduleDialogOpen(false);
    setSchedulingLecturer(null);
    toast({
      title: "Success",
      description: "Class has been scheduled successfully.",
    });
  };

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lecturer.subjects && lecturer.subjects.some((subject: string) => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const openEditDialog = (lecturer: any) => {
    setEditingLecturer(lecturer);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (lecturer: any) => {
    setDeletingLecturer(lecturer);
    setIsDeleteDialogOpen(true);
  };

  const openScheduleDialog = (lecturer: any) => {
    console.log("Opening schedule dialog for lecturer:", lecturer.name);
    setSchedulingLecturer(lecturer);
    setIsScheduleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lecturers</h1>
          <p className="text-muted-foreground">Manage lecturer profiles and assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lecturer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Lecturer</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new lecturer to the system.
              </DialogDescription>
            </DialogHeader>
            <AddLecturerForm
              onSubmit={handleAddLecturer}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search lecturers..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturers.length}</div>
            <p className="text-xs text-muted-foreground">Registered lecturers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lecturers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturers.filter(l => l.status === 'Active').length}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
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
            <p className="text-xs text-muted-foreground">Unique specialties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Subjects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lecturers.length > 0 ? 
                Math.round(lecturers.reduce((acc, l) => acc + (l.subjects?.length || 0), 0) / lecturers.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per lecturer</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lecturer List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading lecturers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLecturers.map((lecturer) => (
                  <TableRow key={lecturer.id}>
                    <TableCell className="font-medium">{lecturer.name}</TableCell>
                    <TableCell>{lecturer.email}</TableCell>
                    <TableCell>{lecturer.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {lecturer.subjects && lecturer.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {lecturer.subjects.slice(0, 2).map((subject: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {lecturer.subjects.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{lecturer.subjects.length - 2} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No subjects</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{lecturer.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openScheduleDialog(lecturer)}
                          title="Schedule Class"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(lecturer)}
                          title="Edit Lecturer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDeleteDialog(lecturer)}
                          title="Delete Lecturer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Lecturer</DialogTitle>
            <DialogDescription>
              Update the lecturer's information below.
            </DialogDescription>
          </DialogHeader>
          {editingLecturer && (
            <AddLecturerForm
              initialData={{
                name: editingLecturer.name,
                email: editingLecturer.email,
                phone: editingLecturer.phone || "",
                subjects: editingLecturer.subjects || []
              }}
              onSubmit={handleEditLecturer}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingLecturer(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lecturer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingLecturer?.name}? This action cannot be undone and will affect all class assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingLecturer(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLecturer}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Lecturers;
