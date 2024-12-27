import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { UserTable } from "./UserTable";
import { UserFilters } from "./UserFilters";
import { CreateUserForm } from "./CreateUserForm";
import { EditUserDialog } from "./EditUserDialog";
import { UserProfile, EditUserFormValues } from "./types";

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    const {
        data: users,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("*");

            if (error) {
                toast.error("Failed to fetch users");
                throw error;
            }

            return profiles as UserProfile[];
        },
    });

    const filteredUsers = users?.filter((user) => {
        const matchesSearch =
            searchTerm === "" ||
            (user.full_name &&
                user.full_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()));

        const matchesRole =
            !selectedRole ||
            selectedRole === "all" ||
            user.role === selectedRole;

        return matchesSearch && matchesRole;
    });

    const handleCreateUser = async (data: any) => {
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                        role: data.role,
                    },
                },
            });

            if (signUpError) throw signUpError;

            toast.success("User created successfully");
            setIsCreateModalOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to create user");
        }
    };

    const handleEditUser = async (data: EditUserFormValues) => {
        if (!editingUser) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: data.full_name,
                    role: data.role,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", editingUser.id);

            if (error) throw error;

            toast.success("User updated successfully");
            setEditingUser(null);
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to update user");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .delete()
                .eq("id", userId);

            if (error) throw error;

            toast.success("User deleted successfully");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete user");
        }
    };

    if (isLoading) {
        return <div>Loading users...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <UserFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedRole={selectedRole}
                    onRoleChange={setSelectedRole}
                />
                <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the platform. They will
                                receive an email to confirm their account.
                            </DialogDescription>
                        </DialogHeader>
                        <CreateUserForm
                            onSubmit={handleCreateUser}
                            onCancel={() => setIsCreateModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <EditUserDialog
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSubmit={handleEditUser}
            />

            <UserTable
                users={filteredUsers || []}
                onDeleteUser={handleDeleteUser}
                onEditUser={setEditingUser}
            />
        </div>
    );
};

export default UserManagement;
