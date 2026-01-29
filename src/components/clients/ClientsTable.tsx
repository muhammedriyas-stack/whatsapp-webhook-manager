"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Globe, FlaskConical } from "lucide-react";
import { IClient } from "@/services/client.service";
import { capitalize, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Column, DataTable } from "../common/DataTable";
import { MODE } from "../common/constant.common";

interface ClientsTableProps {
  clients: IClient[];
  loading: boolean;
  onEdit: (client: IClient) => void;
  onOverride: (client: IClient) => void;
  onLAConfig: (client: IClient) => void;
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
  onOverride,
  onLAConfig,
  onDelete,

}: ClientsTableProps) {

  // TABLE COLUMNS
  const columns: Column<IClient>[] = [
    {
      header: "S.No",
      cell: (_, i) => (page * limit) + i + 1,
    },
    {
      header: "Name",
      cell: (c) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{c.displayName}</span>
          {c.mode && (
            <Badge
              className={cn(
                "w-fit text-[10px] md:text-xs px-2 py-0.5 flex items-center gap-1.5 font-semibold transition-all duration-300",
                c.mode === MODE.PRODUCTION_MODE
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/25"
                  : "bg-cyan-500/15 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/25"
              )}
              variant="outline"
            >
              {c.mode === MODE.PRODUCTION_MODE ? (
                <Globe className="w-3 h-3 animate-pulse" />
              ) : (
                <FlaskConical className="w-3 h-3" />
              )}
              {capitalize(c.mode.replace("_MODE", ""))}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "WhatsApp Number",
      cell: (c) => c.phoneNumber,
    },
    {
      header: "Phone Number ID",
      cell: (c) => c.phoneNumberId,
    },
    {
      header: "Waba ID",
      cell: (c) => c.whatsappBusinessId,
    },
    {
      header: "Assistant ID",
      cell: (c) => c.assistantId,
    },
    {
      header: "Plan",
      cell: (c) => (
        <Badge variant={c.plan === "PRO" ? "default" : "secondary"}>
          {capitalize(c.plan)}
        </Badge>

      ),
    },
    {
      header: "Bot",
      cell: (c) => (
        <Badge variant={c.botEnabled ? "default" : "secondary"}>
          {c.botEnabled ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (c) => (
        <Badge variant={c.isActive ? "default" : "secondary"}>
          {c.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-center",
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(c)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOverride(c)}>
              Override
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLAConfig(c)}>
              LA Config
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeleteClick(c)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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

  if (!loading && !clients || clients?.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No clients found. Add your first client to get started.
      </div>
    );
  }

  // --------------- TABLE ---------------
  return (
    <>
      <div className="rounded-md border border-border overflow-x-auto">
        {clients && clients?.length > 0 &&
          <DataTable
            data={clients}
            columns={columns}
            loading={loading}
            total={total}
            page={page}
            limit={limit}
            onPageChange={onPageChange}
            renderMobileItem={(c, i) => (
              <Card key={c._id} className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-medium">
                      <span className="text-muted-foreground mr-2">#{(page * limit) + i + 1}</span>
                      {c.displayName}
                    </CardTitle>
                    {c.mode && (
                      <Badge
                        className={cn(
                          "w-fit text-[10px] px-2 py-0.5 flex items-center gap-1 font-semibold",
                          c.mode === "PRODUCTION_MODE"
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
                            : "bg-cyan-500/15 text-cyan-500 border-cyan-500/20"
                        )}
                        variant="outline"
                      >
                        {c.mode === "PRODUCTION_MODE" ? (
                          <Globe className="w-2.5 h-2.5" />
                        ) : (
                          <FlaskConical className="w-2.5 h-2.5" />
                        )}
                        {capitalize(c.mode.replace("_MODE", ""))}
                      </Badge>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(c)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOverride(c)}>
                        Override
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onLAConfig(c)}>
                        LA Config
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(c)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="text-xs space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-muted-foreground mb-1 uppercase tracking-wider font-semibold opacity-70">WhatsApp</p>
                        <p className="font-medium">{c.phoneNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground mb-1 uppercase tracking-wider font-semibold opacity-70">Plan</p>
                        <Badge variant={c.plan === "PRO" ? "default" : "secondary"} className="text-[10px] px-1.5 h-4">
                          {capitalize(c.plan)}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Automated</span>
                      <Badge variant={c.automated ? "default" : "secondary"} className="text-[10px] px-1.5 h-4">
                        {c.automated ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Status</span>
                      <Badge variant={c.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 h-4">
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          />
        }
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
            ? `Are you sure you want to delete "${selectedClient.displayName}"? This action cannot be undone.`
            : "Are you sure you want to delete this client?"
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}