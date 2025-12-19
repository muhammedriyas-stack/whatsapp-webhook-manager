import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientDialog } from "@/components/clients/ClientDialog";
import { useToast } from "@/hooks/use-toast";
import { IClient, useDeleteClient, useGetClients, useUpdateClient } from "@/services/client.service";
import { OverrideDialog } from "@/components/clients/OverrideDialog";
import { useOverrideWebhook } from "@/services/webhook.service";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IMultibot, useDeleteMultibot, useGetMultibots, useUpdateMultibot } from "@/services/multibot.service";
import { MultibotsTable } from "@/components/multibots/MultibotTable";
import { MultibotDialog } from "@/components/multibots/MultibotDialog";

export default function MultiBot() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMultibot, setEditingMultibot] = useState<IMultibot | null>(null);

    const { toast } = useToast();

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400); // ⬅️ NEW

    const [page, setPage] = useState(0);
    const limit = 10; // number per page

    // ⬅️ NEW — FILTER STATES
    const [planFilter, setPlanFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");

    const clearFilters = () => {
        setPlanFilter("");
        setActiveFilter("");
    };

    // DATA
    const { data: clientsData, isLoading, refetch } = useGetMultibots({ plan: planFilter, isActive: activeFilter, pageIndex: page, pageSize: limit, search: debouncedSearch });
    const clients = clientsData?.data;


    // MUTATIONS
    const { mutateAsync: updateMultibot, isPending: isPendingUpdateMultibot } = useUpdateMultibot();
    const { mutateAsync: deleteMultibot, isPending: isPendingDeleteMultibot } = useDeleteMultibot();

    // EDIT HANDLER
    const handleEdit = (multibot: IMultibot) => {
        setEditingMultibot(multibot);
        setDialogOpen(true);
    };

    // ADD HANDLER
    const handleAdd = () => {
        setEditingMultibot(null);
        setDialogOpen(true);
    };

    // STATUS TOGGLE
    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await updateMultibot({ _id: id, isActive: !currentStatus });
            toast({
                title: "Success",
                description: "Bot status updated successfully",
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

    // 💥 DELETE HANDLER
    const handleDelete = async (id: string) => {
        try {
            await deleteMultibot(id);

            toast({
                title: "Deleted",
                description: "Bot removed successfully!",
            });

            refetch(); // Refresh list
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
            <div className="space-y-6">
                {/* HEADER + SEARCH + FILTERS */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold">Multi Bots</h2>
                            <p className="text-muted-foreground">Manage your multi bots</p>
                        </div>
                        <Button onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" /> Add Bot
                        </Button>
                    </div>

                    {/* 🔍 Search + Filters Row */}
                    <div className="flex flex-wrap gap-3 items-center">

                        {/* Search */}
                        <Input
                            placeholder="Search clients..."
                            className="w-full sm:w-64"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                        />

                        {/* PLAN FILTER */}
                        <Select value={planFilter} onValueChange={setPlanFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Filter: Plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STARTER">Starter</SelectItem>
                                <SelectItem value="BASIC">Basic</SelectItem>
                                <SelectItem value="PRO">Pro</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* ACTIVE FILTER */}
                        <Select value={activeFilter} onValueChange={setActiveFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* CLEAR FILTERS */}
                        <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                            Clear Filters
                        </Button>
                    </div>
                </div>

                <MultibotsTable
                    multibots={clients}
                    loading={isLoading}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}   // 🚀 ADDED
                    total={clientsData?.total}
                    page={page}
                    limit={limit}
                    onPageChange={(newPage) => setPage(newPage)}
                />

                <MultibotDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    multibot={editingMultibot}
                    loading={isPendingUpdateMultibot}
                />
            </div>
        </DashboardLayout>
    );
}