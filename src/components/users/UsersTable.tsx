"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Column, DataTable } from "../common/DataTable";
import { IUser } from "@/types/user.type";
import { ROLES } from "@/constants/common";

import { Switch } from "@/components/ui/switch";
import { useGetProfile } from "@/services/auth.service";

interface UsersTableProps {
    users: IUser[];
    loading: boolean;
    onEdit: (user: IUser) => void;
    onDelete: (id: string) => Promise<void>;
    onStatusToggle: (user: IUser, isActive: boolean) => Promise<void>;
}

export function UsersTable({
    users,
    loading,
    onEdit,
    onDelete,
    onStatusToggle,
}: UsersTableProps) {
    const { data: currentUser } = useGetProfile();

    // TABLE COLUMNS
    const columns: Column<IUser>[] = [
        {
            header: "Name",
            cell: (user) => <span className="font-medium">{user.name}</span>,
        },
        {
            header: "Email",
            cell: (user) => user.email,
        },
        {
            header: "Role",
            cell: (user) => (
                <Badge variant={user.role === ROLES.ADMIN ? "default" : "secondary"}>
                    {user.role}
                </Badge>
            ),
        },
        {
            header: "Permissions",
            cell: (user) => (
                <div className="flex flex-wrap gap-1">
                    {user.permissions?.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-[10px]">
                            {perm.replace("_", " ")}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            header: "Status",
            cell: (user) => (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={user.isActive}
                        onCheckedChange={(checked) => handleStatusClick(user, checked)}
                        disabled={user.role === ROLES.ADMIN}
                    />
                    <span className={`text-xs font-medium ${user.isActive ? "text-green-600" : "text-red-600"} ${user.role === ROLES.ADMIN ? "opacity-50" : ""}`}>
                        {user.isActive ? "Active" : "Inactive"}
                    </span>
                </div>
            ),
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (user) => {
                const isSelf = user._id === currentUser?._id;
                const canEdit = user.role !== ROLES.ADMIN || currentUser?.role === ROLES.ADMIN;
                const canDelete = user.role !== ROLES.ADMIN && !isSelf;

                if (!canEdit && !canDelete) return null;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>
                            )}
                            {canDelete && (
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteClick(user)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [pendingStatus, setPendingStatus] = useState<boolean>(true);

    const handleDeleteClick = (user: IUser) => {
        setSelectedUser(user);
        setConfirmOpen(true);
    };

    const handleStatusClick = (user: IUser, checked: boolean) => {
        setSelectedUser(user);
        setPendingStatus(checked);
        setStatusConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        await onDelete(selectedUser._id);
        setConfirmOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmStatus = async () => {
        if (!selectedUser) return;
        await onStatusToggle(selectedUser, pendingStatus);
        setStatusConfirmOpen(false);
        setSelectedUser(null);
    };

    return (
        <>
            <div className="rounded-md border border-border overflow-x-auto">
                <DataTable
                    data={users || []}
                    columns={columns}
                    loading={loading}
                    total={users?.length || 0}
                    page={0}
                    limit={100} // Showing all users for now
                    renderMobileItem={(user, i) => (
                        <div key={user._id} className="mb-4 rounded-lg border border-border bg-card p-4">
                            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex flex-col gap-1">
                                    <div className="text-sm font-medium">
                                        {user.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>

                                {(() => {
                                    const isSelf = user._id === currentUser?._id;
                                    const canEdit = user.role !== ROLES.ADMIN || currentUser?.role === ROLES.ADMIN;
                                    const canDelete = user.role !== ROLES.ADMIN && !isSelf;

                                    if (!canEdit && !canDelete) return null;

                                    return (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                {canEdit && (
                                                    <DropdownMenuItem onClick={() => onEdit(user)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}
                                                {canDelete && (
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDeleteClick(user)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    );
                                })()}
                            </div>
                            <div className="text-xs space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-semibold opacity-70">Role</span>
                                    <Badge variant={user.role === ROLES.ADMIN ? "default" : "secondary"}>
                                        {user.role}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-muted-foreground font-semibold opacity-70">Status</span>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={user.isActive}
                                            onCheckedChange={(checked) => handleStatusClick(user, checked)}
                                            disabled={user.role === ROLES.ADMIN}
                                        />
                                        <span className={`text-xs font-medium ${user.isActive ? "text-green-600" : "text-red-600"} ${user.role === ROLES.ADMIN ? "opacity-50" : ""}`}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t pt-2">
                                    <p className="text-muted-foreground mb-1 font-semibold opacity-70">Permissions</p>
                                    <div className="flex flex-wrap gap-1">
                                        {user.permissions?.map((perm) => (
                                            <Badge key={perm} variant="outline" className="text-[10px]">
                                                {perm.replace("_", " ")}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                />
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                destructive
                title="Delete User?"
                description={`Are you sure you want to delete "${selectedUser?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
            />

            <ConfirmDialog
                open={statusConfirmOpen}
                onCancel={() => setStatusConfirmOpen(false)}
                onConfirm={handleConfirmStatus}
                title={`${pendingStatus ? "Enable" : "Disable"} User?`}
                description={`Are you sure you want to ${pendingStatus ? "enable" : "disable"} "${selectedUser?.name}"?`}
                confirmText={pendingStatus ? "Enable" : "Disable"}
                cancelText="Cancel"
            />
        </>
    );
}
