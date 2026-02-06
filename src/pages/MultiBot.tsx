import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IMultibot, useDeleteMultibot, useGetMultibots, useUpdateMultibot } from "@/services/multibot.service";
import { MultibotsTable } from "@/components/multibots/MultibotTable";
import { MultibotDialog } from "@/components/multibots/MultibotDialog";
import { BOT_TYPE, PLAN } from "@/components/common/constant.common";
import { capitalize } from "@/lib/utils";

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
    const [botTypeFilter, setBotTypeFilter] = useState<any>(BOT_TYPE.MULTIBOT);

    const clearFilters = () => {
        setPlanFilter("");
        setActiveFilter("");
        setBotTypeFilter("");
    };

    // DATA
    const { data: clientsData, isLoading, refetch } = useGetMultibots({ plan: planFilter, isActive: activeFilter, pageIndex: page, pageSize: limit, search: debouncedSearch, botType: botTypeFilter });
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
            {/* Mobile: whole section scrollable | Desktop: fixed header + scrollable table */}
            <div className="space-y-6 md:flex md:flex-col md:h-[calc(100vh-7rem)] md:overflow-hidden">
                {/* HEADER + SEARCH + FILTERS */}
                <div className="flex flex-col gap-4 md:flex-shrink-0 md:space-y-4 md:pb-4">
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
                                {Object.values(PLAN).map((plan) => (
                                    <SelectItem key={plan} value={plan}>
                                        {capitalize(plan)}
                                    </SelectItem>

                                ))}
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

                        {/* BOT TYPE FILTER */}
                        <Select value={botTypeFilter} onValueChange={setBotTypeFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Filter: Bot Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEMO">Demo</SelectItem>
                                <SelectItem value="MULTIBOT">MultiBot</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* CLEAR FILTERS */}
                        <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="md:flex-1 md:overflow-auto">
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
                </div>

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