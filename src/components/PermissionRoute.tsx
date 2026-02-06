import { useGetProfile } from "@/services/auth.service";
import { Navigate, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "./layout/DashboardLayout";

import { ROLES, PERMISSIONS } from "@/constants/common";

interface PermissionRouteProps {
    children: React.ReactNode;
    permission: string;
}

const PERMISSION_TO_ROUTE: Record<string, string> = {
    [PERMISSIONS.ANALYTICS]: "/",
    [PERMISSIONS.MANAGE_CLIENTS]: "/clients",
    [PERMISSIONS.MANAGE_MULTIBOT]: "/multibot",
    [PERMISSIONS.FLOW_BUILDER]: "/flow-builder",
    [PERMISSIONS.MANAGE_USERS]: "/users",
};

export function PermissionRoute({ children, permission }: PermissionRouteProps) {
    const { data: user, isLoading } = useGetProfile();
    const { pathname } = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-muted-foreground">Checking permissions...</p>
                </div>
            </div>
        );
    }

    // Admin has access to everything
    if (user?.role === ROLES.ADMIN) {
        return <ProtectedRoute>{children}</ProtectedRoute>;
    }

    // Check specific permission
    if (user?.permissions?.includes(permission)) {
        return <ProtectedRoute>{children}</ProtectedRoute>;
    }

    // No access to this route.
    // If we are on the root path, don't redirect to first available; just show the welcome screen below.
    // This allows users to actually land on the dashboard without being forced into a module.
    if (pathname === "/") {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <h1 className="text-2xl font-bold mb-2">Welcome</h1>
                        <p className="text-muted-foreground text-center max-w-md">
                            {user?.permissions?.length === 0
                                ? "You don't have any permissions assigned yet. Please contact your administrator."
                                : "Please select an authorized module from the sidebar to continue."
                            }
                        </p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    // Otherwise, find the first route they DO have access to.
    const firstAvailablePermission = Object.values(PERMISSIONS).find(p =>
        user?.permissions?.includes(p) && PERMISSION_TO_ROUTE[p]
    );

    const targetRoute = firstAvailablePermission ? PERMISSION_TO_ROUTE[firstAvailablePermission] : null;

    // If we have a target route and we aren't already there, redirect
    if (targetRoute && pathname !== targetRoute) {
        return <Navigate to={targetRoute} replace />;
    }

    return <Navigate to="/" replace />;
}
