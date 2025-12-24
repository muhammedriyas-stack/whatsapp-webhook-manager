import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import { ClientDialog } from "@/components/clients/ClientDialog";
import { useToast } from "@/hooks/use-toast";
import { IClient, useDeleteClient, useGetClients, useUpdateClient } from "@/services/client.service";
import { OverrideDialog } from "@/components/clients/OverrideDialog";
import { useOverrideAllWebhook, useOverrideWebhook } from "@/services/webhook.service";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OverrideAllDialog } from "@/components/clients/OverrideAllDialog";

export default function Clients() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideClient, setOverrideClient] = useState<IClient | null>(null);

  const [overrideAllOpen, setOverrideAllOpen] = useState(false);

  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400); // ⬅️ NEW

  const [page, setPage] = useState(0);
  const limit = 10; // number per page

  // ⬅️ NEW — FILTER STATES
  const [planFilter, setPlanFilter] = useState("");
  const [automatedFilter, setAutomatedFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const clearFilters = () => {
    setPlanFilter("");
    setAutomatedFilter("");
    setActiveFilter("");
  };

  // DATA
  const { data: clientsData, isLoading, refetch } = useGetClients({ plan: planFilter, automated: automatedFilter, isActive: activeFilter, pageIndex: page, pageSize: limit, search: debouncedSearch });
  const clients = clientsData?.data;


  // MUTATIONS
  const { mutateAsync: updateClient, isPending: isPendingUpdateClient } = useUpdateClient();
  const { mutateAsync: overrideWebhook, isPending: isPendingOverriding } = useOverrideWebhook();
  const { mutateAsync: overrideAllWebhook, isPending: isPendingOverrideAll } = useOverrideAllWebhook();
  const { mutateAsync: deleteClient, isPending: isPendingDeleteClient } = useDeleteClient();

  // EDIT HANDLER
  const handleEdit = (client: IClient) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  // ADD HANDLER
  const handleAdd = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  // OVERRIDE ALL HANDLER
  const handleOverrideAll = () => {
    setOverrideAllOpen(true);
  };

  // STATUS TOGGLE
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateClient({ _id: id, isActive: !currentStatus });
      toast({
        title: "Success",
        description: "Client status updated successfully",
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

  // OVERRIDE HANDLER
  const handleOverride = (client: IClient) => {
    setOverrideClient(client);
    setOverrideOpen(true);
  };

  // SUBMIT OVERRIDE FORM
  const handleSubmitOverride = async (env: "PRODUCTION" | "DEVELOPMENT", url: string) => {
    if (!overrideClient) return;

    try {
      await overrideWebhook({ _id: overrideClient._id, env, url });

      toast({
        title: "Success",
        description: `Webhook updated for ${env.toLowerCase()} successfully.`,
      });

      setOverrideOpen(false);
      setOverrideClient(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message,
        variant: "destructive",
      });
    }
  };

  // SUBMIT OVERRIDE ALL FORM
  const handleSubmitOverrideAll = async (env: "PRODUCTION" | "DEVELOPMENT", url: string) => {
    if (!overrideClient) return;

    try {
      await overrideAllWebhook({ env, url });

      toast({
        title: "Success",
        description: `Webhook updated for ${env.toLowerCase()} successfully.`,
      });

      setOverrideAllOpen(false);
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
      await deleteClient(id);

      toast({
        title: "Deleted",
        description: "Client removed successfully!",
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
              <h2 className="text-3xl font-bold">Clients</h2>
              <p className="text-muted-foreground">Manage your webhook clients</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOverrideAll}>
                <RotateCcw className="h-4 w-4 mr-2" /> Override All
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" /> Add Client
              </Button>
            </div>
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

            {/* AUTOMATED FILTER */}
            <Select value={automatedFilter} onValueChange={setAutomatedFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Automated?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Automated</SelectItem>
                <SelectItem value="false">Manual</SelectItem>
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

        <ClientsTable
          clients={clients}
          loading={isLoading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onOverride={handleOverride}
          onDelete={handleDelete}   // 🚀 ADDED
          total={clientsData?.total}
          page={page}
          limit={limit}
          onPageChange={(newPage) => setPage(newPage)}
        />

        <ClientDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          client={editingClient}
          loading={isPendingUpdateClient}
        />

        <OverrideDialog
          open={overrideOpen}
          onOpenChange={setOverrideOpen}
          client={overrideClient}
          onSubmitOverride={handleSubmitOverride}
          loading={isPendingOverriding}
        />

        <OverrideAllDialog
          open={overrideAllOpen}
          onOpenChange={setOverrideAllOpen}
          onSubmitOverride={handleSubmitOverrideAll}
          loading={isPendingOverrideAll}
        />
      </div>
    </DashboardLayout>
  );
}