import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientDialog } from "@/components/clients/ClientDialog";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Client {
  id: string;
  name: string;
  whatsapp_number: string;
  phone_number_id: string;
  token: string;
  my_token: string;
  plan: "STARTER" | "BASIC" | "PRO";
  assistant_id: string;
  automated: boolean;
  waba_id: string;
  app_id: string;
  app_secret: string;
  session_key: string;
  status: boolean;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data as Client[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.updateClientStatus(id, !currentStatus);
      toast({
        title: "Success",
        description: "Client status updated successfully",
      });
      fetchClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Clients</h2>
            <p className="text-muted-foreground">Manage your webhook clients</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        <ClientsTable
          clients={clients}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />

        <ClientDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          client={editingClient}
          onSuccess={fetchClients}
        />
      </div>
    </DashboardLayout>
  );
}
