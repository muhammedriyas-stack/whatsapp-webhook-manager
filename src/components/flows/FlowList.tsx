import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Plus,
    ExternalLink,
    Trash2,
    MoreVertical,
    Workflow,
    RefreshCcw,
    Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IFlow, useGetFlows, useDeleteFlow, useSyncFlow, usePublishFlow } from "@/services/flow.service";
import { useGetProfile } from "@/services/auth.service";
import { ROLES } from "@/constants/common";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function FlowList() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const { data: user } = useGetProfile();
    const { data: flowsResponse, isLoading } = useGetFlows({ search });
    const deleteFlowMutation = useDeleteFlow();
    const syncFlowMutation = useSyncFlow();
    const publishFlowMutation = usePublishFlow();

    // Confirmation Dialog State
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        destructive?: boolean;
    }>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });

    const flows = flowsResponse?.data || [];

    const isAnyActionPending = deleteFlowMutation.isPending || syncFlowMutation.isPending || publishFlowMutation.isPending;

    const handleDelete = (id: string) => {
        const flow = flows.find(f => f._id === id);
        setConfirmState({
            open: true,
            title: "Delete Flow",
            description: `Are you sure you want to delete "${flow?.name || 'this flow'}"? ${flow?.meta_flow_id ? "This will also delete the flow from Meta permanently." : "This action cannot be undone."}`,
            destructive: true,
            onConfirm: async () => {
                try {
                    await deleteFlowMutation.mutateAsync(id);
                    toast.success("Flow deleted successfully");
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Failed to delete flow");
                } finally {
                    setConfirmState(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleSync = async (id: string) => {
        try {
            await syncFlowMutation.mutateAsync(id);
            toast.success("Flow synchronized with Meta successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to sync with Meta");
        }
    };

    const handlePublish = (id: string) => {
        const flow = flows.find(f => f._id === id);
        setConfirmState({
            open: true,
            title: "Publish Flow to Meta",
            description: `Are you sure you want to publish "${flow?.name || 'this flow'}"? Once published, it cannot be deleted in Meta assets and will be live for users.`,
            destructive: false,
            onConfirm: async () => {
                try {
                    await publishFlowMutation.mutateAsync(id);
                    toast.success("Flow published successfully in Meta");
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Failed to publish flow");
                } finally {
                    setConfirmState(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, ID or client..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => navigate("/flow-builder")}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Flow
                    </Button>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Flow Name</TableHead>
                                <TableHead>Flow ID</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Local Status</TableHead>
                                <TableHead>Meta Status</TableHead>
                                <TableHead>Sync Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        Loading flows...
                                    </TableCell>
                                </TableRow>
                            ) : flows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        No flows found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                flows.map((flow) => (
                                    <TableRow key={flow._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Workflow className="h-4 w-4 text-primary" />
                                                {flow.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {flow.flowId || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {flow.clientName || (typeof flow.clientId === 'object' ? flow.clientId?.displayName : "Unknown")}
                                        </TableCell>
                                        <TableCell>
                                            {flow.status === "published" ? (
                                                <Badge variant="default" className="bg-green-600">
                                                    Published
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                                                    Draft
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {!flow.meta_flow_id ? (
                                                flow.meta_sync_status === "FAILED" ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 cursor-help">
                                                                Creation Failed
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">{flow.meta_error_message || "Unknown Meta error"}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : flow.meta_sync_status === "PENDING" ? (
                                                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
                                                        Pending Creation
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">Not Created</span>
                                                )
                                            ) : flow.meta_flow_status === "PUBLISHED" ? (
                                                <Badge variant="default" className="bg-green-600">
                                                    Published
                                                </Badge>
                                            ) : flow.meta_sync_status === "FAILED" ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 cursor-help">
                                                            Draft (Sync Error)
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{flow.meta_error_message || "Asset sync failed"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                                    Draft
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {flow.meta_sync_status ? (
                                                <Badge
                                                    variant={flow.meta_sync_status === "SUCCESS" ? "default" : flow.meta_sync_status === "FAILED" ? "destructive" : "secondary"}
                                                    className={cn(
                                                        flow.meta_sync_status === "SUCCESS" && "bg-green-500 hover:bg-green-600",
                                                        flow.meta_sync_status === "PENDING" && "bg-yellow-500 hover:bg-yellow-600"
                                                    )}
                                                >
                                                    {flow.meta_sync_status}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Not synced</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {format(new Date(flow.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/flow-builder/${flow._id}`)}
                                                    title="Edit in Builder"
                                                    disabled={isAnyActionPending}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={isAnyActionPending}
                                                            className={cn(
                                                                (syncFlowMutation.isPending && syncFlowMutation.variables === flow._id ||
                                                                    deleteFlowMutation.isPending && deleteFlowMutation.variables === flow._id ||
                                                                    publishFlowMutation.isPending && publishFlowMutation.variables === flow._id) && "text-primary"
                                                            )}
                                                        >
                                                            {((syncFlowMutation.isPending && syncFlowMutation.variables === flow._id) ||
                                                                (deleteFlowMutation.isPending && deleteFlowMutation.variables === flow._id) ||
                                                                (publishFlowMutation.isPending && publishFlowMutation.variables === flow._id)) ? (
                                                                <RefreshCcw className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MoreVertical className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/flow-builder/${flow._id}`)}
                                                            disabled={isAnyActionPending}
                                                        >
                                                            Open Builder
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => handleSync(flow._id)}
                                                            disabled={isAnyActionPending}
                                                        >
                                                            <RefreshCcw className={cn(
                                                                "mr-2 h-4 w-4",
                                                                syncFlowMutation.isPending && syncFlowMutation.variables === flow._id && "animate-spin"
                                                            )} />
                                                            {syncFlowMutation.isPending && syncFlowMutation.variables === flow._id ? "Syncing..." : "Sync with Meta"}
                                                        </DropdownMenuItem>

                                                        {flow.meta_flow_id && flow.meta_flow_status === "DRAFT" && flow.meta_sync_status === "SUCCESS" && (
                                                            <DropdownMenuItem
                                                                onClick={() => handlePublish(flow._id)}
                                                                className="text-primary focus:text-primary"
                                                                disabled={isAnyActionPending}
                                                            >
                                                                <RefreshCcw className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    publishFlowMutation.isPending && publishFlowMutation.variables === flow._id && "animate-spin"
                                                                )} />
                                                                {publishFlowMutation.isPending && publishFlowMutation.variables === flow._id ? "Publishing..." : "Publish to Meta"}
                                                            </DropdownMenuItem>
                                                        )}

                                                        {user?.role === ROLES.ADMIN && (
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDelete(flow._id)}
                                                                disabled={isAnyActionPending}
                                                            >
                                                                <Trash2 className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    deleteFlowMutation.isPending && deleteFlowMutation.variables === flow._id && "animate-spin"
                                                                )} />
                                                                {deleteFlowMutation.isPending && deleteFlowMutation.variables === flow._id ? "Deleting..." : "Delete Flow"}
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                description={confirmState.description}
                confirmText={confirmState.destructive ? "Delete" : "Confirm"}
                destructive={confirmState.destructive}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))}
            />
        </TooltipProvider>
    );
}
