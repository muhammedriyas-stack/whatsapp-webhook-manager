"use client";

import { useState } from "react";

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
import { MoreHorizontal, Trash2 } from "lucide-react";
import { IClient } from "@/services/client.service";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ClientsTableProps {
  clients: IClient[];
  loading: boolean;
  onEdit: (client: IClient) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onOverride: (client: IClient) => void;
  onDelete: (id: string) => Promise<void>;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function ClientsTable({
  clients,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onToggleStatus,
  onOverride,
  onDelete,

}: ClientsTableProps) {

  const totalPages = Math.ceil(total / limit);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);

  const handleDeleteClick = (client: IClient) => {
    setSelectedClient(client);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;

    await onDelete(selectedClient._id);

    setConfirmOpen(false);
    setSelectedClient(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setSelectedClient(null);
  };

  // --------------- LOADING ---------------
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

  // --------------- TABLE ---------------
  return (
    <>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>WhatsApp Number</TableHead>
              <TableHead>Phone Number ID</TableHead>
              <TableHead>Waba ID</TableHead>
              <TableHead>Assistant ID</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Automated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="font-medium">{client.whatsappNumber}</TableCell>
                <TableCell className="font-medium">{client.phoneNumberId}</TableCell>
                <TableCell className="font-medium">{client.wabaId}</TableCell>
                <TableCell className="font-medium">{client.assistantId}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      client.plan === "PRO"
                        ? "default"
                        : client.plan === "BASIC"
                          ? "secondary"
                          : "outline"
                    }
                  >
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
                    checked={client.isActive}
                    onCheckedChange={() => onToggleStatus(client._id, client.isActive)}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit(client)}>
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem onSelect={() => onOverride(client)}>
                        Override
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={() => handleDeleteClick(client)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-4">
        <Button
          variant="outline"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages}
        </div>

        <Button
          variant="outline"
          disabled={page === totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>

      {/* ---------- CONFIRM DELETE DIALOG ---------- */}
      <ConfirmDialog
        open={confirmOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        destructive
        title="Delete Client?"
        description={
          selectedClient
            ? `Are you sure you want to delete "${selectedClient.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this client?"
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
