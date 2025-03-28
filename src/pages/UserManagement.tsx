
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser, getUsers } from "@/services/databaseService";
import { User } from "@/types";
import { UserForm } from "@/components/users/UserForm";
import { supabase } from "@/integrations/supabase/client";

const UserManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        
        if (!currentUser || currentUser.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "Only administrators can access user management",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        await fetchUsers();
      } catch (error) {
        console.error("Error checking access:", error);
        toast({
          title: "Error",
          description: "Failed to verify access permissions",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [navigate, toast]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddUserOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Check if current user is admin
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Only administrators can delete users");
      }
      
      // Delete user from database
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      toast({
        title: "Success",
        description: `${selectedUser.name} has been deleted`
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUserFormSubmit = async (userData: User) => {
    try {
      // Check if current user is admin
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Only administrators can manage users");
      }
      
      // Check if this is a new user (add) or existing user (edit)
      const isNewUser = !users.some(user => user.id === userData.id);
      
      if (isNewUser) {
        // Insert new user
        const { data, error } = await supabase
          .from('users')
          .insert([{
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          }])
          .select();
        
        if (error) throw error;
        
        // Update local state with the returned data
        if (data && data.length > 0) {
          setUsers(prev => [...prev, data[0] as User]);
        }
      } else {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            name: userData.name,
            email: userData.email,
            role: userData.role
          })
          .eq('id', userData.id);
        
        if (error) throw error;
        
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userData.id ? userData : user
        ));
      }
      
      toast({
        title: "Success",
        description: isNewUser 
          ? "New user created successfully" 
          : `${userData.name} updated successfully`
      });
      
      // Close the dialogs
      setIsAddUserOpen(false);
      setIsEditUserOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save user information",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null; // This will redirect via useEffect
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={handleAddUser}>Add New User</Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No users found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user)}
                          >
                            Delete
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
        
        {/* Add User Dialog */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with the following details
              </DialogDescription>
            </DialogHeader>
            <UserForm 
              onSubmit={handleUserFormSubmit} 
              onCancel={() => setIsAddUserOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user account details
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <UserForm 
                user={selectedUser}
                onSubmit={handleUserFormSubmit} 
                onCancel={() => setIsEditUserOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                account for {selectedUser?.name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default UserManagement;
