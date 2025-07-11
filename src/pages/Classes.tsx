import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, MapPin, Users, GraduationCap, Edit, Trash2 } from "lucide-react";
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
import { AddClassForm } from "@/components/forms/AddClassForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Classes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClass, setEditingClass] = useState<any>(null);
  const [deletingClass, setDeletingClass] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          courses (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClass = (data: any) => {
    fetchClasses();
    setIsDialogOpen(false);
  };

  const handleEditClass = async (data: any) => {
    try {
      const { data: updatedClass, error } = await supabase
        .from('classes')
        .update({
          name: data.className,
          course_id: data.courseId,
          district_leader_name: data.districtLeaderName,
          district: data.district,
          class_center_name: data.classCenterName,
          class_center_address: data.classCenterAddress,
          class_organizer_name: data.classOrganizerName,
          contact_number: data.contactNumber,
          status: data.classStatus
        })
        .eq('id', editingClass.id)
        .select(`
          *,
          courses (
            name,
            code
          )
        `)
        .single();

      if (error) throw error;

      setClasses(classes.map(c => c.id === editingClass.id ? updatedClass : c));
      toast({
        title: "Class Updated",
        description: `${data.className} has been successfully updated.`,
      });
      setIsEditDialogOpen(false);
      setEditingClass(null);
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: "Failed to update class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async () => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', deletingClass.id);

      if (error) throw error;

      setClasses(classes.filter(c => c.id !== deletingClass.id));
      toast({
        title: "Class Deleted",
        description: `${deletingClass.name} has been removed.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingClass(null);
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.class_organizer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditDialog = (classItem: any) => {
    setEditingClass(classItem);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (classItem: any) => {
    setDeletingClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">Manage class schedules and locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <AddClassForm
              onSubmit={handleAddClass}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search classes..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.filter(c => c.status === 'Active').length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Districts</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(classes.map(c => c.district)).size}</div>
            <p className="text-xs text-muted-foreground">Unique districts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.filter(c => c.status === 'Completed').length}</div>
            <p className="text-xs text-muted-foreground">Finished classes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading classes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">{classItem.name}</TableCell>
                    <TableCell>
                      {classItem.courses ? `${classItem.courses.code} - ${classItem.courses.name}` : 'N/A'}
                    </TableCell>
                    <TableCell>{classItem.district}</TableCell>
                    <TableCell>{classItem.class_organizer_name}</TableCell>
                    <TableCell>{classItem.contact_number}</TableCell>
                    <TableCell>
                      <Badge variant={classItem.status === "Active" ? "default" : "secondary"}>
                        {classItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(classItem)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDeleteDialog(classItem)}
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
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          {editingClass && (
            <AddClassForm
              initialData={{
                className: editingClass.name,
                courseId: editingClass.course_id,
                districtLeaderName: editingClass.district_leader_name,
                district: editingClass.district,
                classCenterName: editingClass.class_center_name,
                classCenterAddress: editingClass.class_center_address,
                classOrganizerName: editingClass.class_organizer_name,
                contactNumber: editingClass.contact_number,
                classStatus: editingClass.status
              }}
              onSubmit={handleEditClass}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingClass(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingClass?.name}? This action cannot be undone and will affect all enrolled students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingClass(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Classes;
