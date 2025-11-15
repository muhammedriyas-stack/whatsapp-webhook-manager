import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { Client } from "@/pages/Clients";

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function ClientsTable({ clients, loading, onEdit, onToggleStatus }: ClientsTableProps) {
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No clients found. Add your first client to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>WhatsApp Number</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Automated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.whatsapp_number}</TableCell>
              <TableCell>
                <Badge variant={
                  client.plan === "PRO" ? "default" : 
                  client.plan === "BASIC" ? "secondary" : 
                  "outline"
                }>
                  {client.plan}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={client.automated ? "default" : "secondary"}>
                  {client.automated ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch
                  checked={client.status}
                  onCheckedChange={() => onToggleStatus(client.id, client.status)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(client)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
