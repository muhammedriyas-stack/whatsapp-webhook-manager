import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IUser, ICreateUser } from "@/types/user.type";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ROLES, PERMISSIONS } from "@/constants/common";

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: IUser | null;
    onSubmit: (data: ICreateUser) => Promise<void>;
    loading: boolean;
    adminExists: boolean;
}

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export function UserDialog({
    open,
    onOpenChange,
    user,
    onSubmit,
    loading,
    adminExists,
}: UserDialogProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ICreateUser>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: ROLES.USER,
            permissions: [],
        },
    });

    const selectedPermissions = watch("permissions") || [];
    const selectedRole = watch("role");

    useEffect(() => {
        if (user) {
            setValue("name", user.name);
            setValue("email", user.email);
            setValue("role", user.role);
            setValue("permissions", user.permissions || []);
            // Password not set on edit by default
        } else {
            reset({
                name: "",
                email: "",
                password: "",
                role: ROLES.USER,
                permissions: [],
            });
        }
    }, [user, open, setValue, reset]);

    const handlePermissionChange = (permission: string, checked: boolean) => {
        if (checked) {
            setValue("permissions", [...selectedPermissions, permission]);
        } else {
            setValue(
                "permissions",
                selectedPermissions.filter((p) => p !== permission)
            );
        }
    };

    const onFormSubmit = async (data: ICreateUser) => {
        const payload = { ...data };
        if (user && !payload.password) {
            delete payload.password;
        }
        await onSubmit(payload);
        onOpenChange(false);
    };

    const isAdminOptionDisabled = adminExists && user?.role !== ROLES.ADMIN;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register("name", { required: true })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email", { required: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {user ? "New Password (leave empty to keep current)" : "Password"}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            {...register("password", { required: !user })}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            onValueChange={(val: "ADMIN" | "USER") => setValue("role", val)}
                            value={selectedRole}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ROLES.ADMIN} disabled={isAdminOptionDisabled}>
                                    Admin {isAdminOptionDisabled && "(Limit Reached)"}
                                </SelectItem>
                                <SelectItem value={ROLES.USER}>User</SelectItem>
                            </SelectContent>
                        </Select>
                        {isAdminOptionDisabled && (
                            <p className="text-[10px] text-amber-600 mt-1">
                                Only one administrator is allowed in the system.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="flex flex-col gap-2 border p-3 rounded-md">
                            {ALL_PERMISSIONS.map((permission) => (
                                <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={permission}
                                        checked={selectedPermissions.includes(permission)}
                                        onCheckedChange={(checked) =>
                                            handlePermissionChange(permission, checked as boolean)
                                        }
                                    />
                                    <Label htmlFor={permission} className="text-sm font-normal">
                                        {permission.replace("_", " ")}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
