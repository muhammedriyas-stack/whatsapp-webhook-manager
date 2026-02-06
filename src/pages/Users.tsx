import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useGetUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/services/user.service";
import { UsersTable } from "@/components/users/UsersTable";
import { UserDialog } from "@/components/users/UserDialog";
import { IUser, ICreateUser } from "@/types/user.type";
import { ROLES } from "@/constants/common";

export default function Users() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [search, setSearch] = useState("");

    const { toast } = useToast();

    // DATA
    const { data: users, isLoading, refetch } = useGetUsers();

    // MUTATIONS
    const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
    const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
    const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();

    const filteredUsers = users?.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setEditingUser(null);
        setDialogOpen(true);
    };

    const handleEdit = (user: IUser) => {
        setEditingUser(user);
        setDialogOpen(true);
    };

    const handleSubmit = async (data: ICreateUser) => {
        try {
            if (editingUser) {
                await updateUser({ ...data, _id: editingUser._id });
                toast({ title: "Success", description: "User updated successfully" });
            } else {
                await createUser(data);
                toast({ title: "Success", description: "User created successfully" });
            }
            refetch();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || error?.message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteUser(id);
            toast({ title: "Deleted", description: "User removed successfully" });
            refetch();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || error?.message,
                variant: "destructive",
            });
        }
    };

    const handleStatusToggle = async (user: IUser, isActive: boolean) => {
        try {
            await updateUser({ _id: user._id, isActive });
            toast({
                title: "Success",
                description: `User ${isActive ? "enabled" : "disabled"} successfully`
            });
            refetch();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || error?.message,
                variant: "destructive",
            });
        }
    };

    return (
        <DashboardLayout>
            {/* Mobile: whole section scrollable | Desktop: fixed header + scrollable table */}
            <div className="space-y-6 md:flex md:flex-col md:h-[calc(100vh-7rem)] md:overflow-hidden">
                {/* HEADER + SEARCH */}
                <div className="flex flex-col gap-4 md:flex-shrink-0 md:space-y-4 md:pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold">Users</h2>
                            <p className="text-muted-foreground">Manage dashboard users and permissions</p>
                        </div>
                        <Button onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" /> Add User
                        </Button>
                    </div>

                    <div className="flex items-center">
                        <Input
                            placeholder="Search users..."
                            className="w-full sm:w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="md:flex-1 md:overflow-auto">
                    <UsersTable
                        users={filteredUsers || []}
                        loading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusToggle={handleStatusToggle}
                    />
                </div>

                <UserDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    user={editingUser}
                    onSubmit={handleSubmit}
                    loading={isCreating || isUpdating}
                    adminExists={users?.some(u => u.role === ROLES.ADMIN) || false}
                />
            </div>
        </DashboardLayout>
    );
}
