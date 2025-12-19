"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Column, DataTable } from "../common/DataTable";
import { IMultibot } from "@/services/multibot.service";

interface MultibotsTableProps {
  multibots: IMultibot[];
  loading: boolean;
  onEdit: (multibot: IMultibot) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function MultibotsTable({
  multibots,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,

}: MultibotsTableProps) {

  // TABLE COLUMNS
  const columns: Column<IMultibot>[] = [
    {
      header: "Name",
      cell: (c) => c.name,
    },
    // {
    //   header: "API URL",
    //   cell: (c) => c.apiUrl,
    // },
    {
      header: "Assistant ID",
      cell: (c) => c.assistant_id,
    },
    {
      header: "Plan",
      cell: (c) => (
        <Badge variant={c.plan === "PRO" ? "default" : "secondary"}>
          {c.plan}
        </Badge>
      ),
    },

    {
      header: "Status",
      cell: (c) => (
        <Switch
          checked={c.isActive}
          onCheckedChange={() =>
            handleStatusChangeClick(c)
          }
        />
      ),
    },
    {
      header: "Actions",
      className: "",
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
  const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] = useState(false);

  const [selectedMultibot, setSelectedMultibot] = useState<IMultibot | null>(null);

  const handleDeleteClick = (multibot: IMultibot) => {
    setSelectedMultibot(multibot);
    setConfirmOpen(true);
  };

  const handleStatusChangeClick = (multibot: IMultibot) => {
    setSelectedMultibot(multibot);
    setConfirmStatusChangeOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMultibot) return;

    await onDelete(selectedMultibot._id);

    setConfirmOpen(false);
    setSelectedMultibot(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedMultibot) return;

    await onToggleStatus(selectedMultibot._id, selectedMultibot.isActive);

    setConfirmStatusChangeOpen(false);
    setSelectedMultibot(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setSelectedMultibot(null);
  };

  const handleCancelStatusChange = () => {
    setConfirmStatusChangeOpen(false);
    setSelectedMultibot(null);
  };

  // --------------- LOADING ---------------
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (!loading && !multibots || multibots?.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No multibots found. Add your first multibot to get started.
      </div>
    );
  }

  // --------------- TABLE ---------------
  return (
    <>
      <div className="rounded-md border border-border overflow-x-auto">
        {multibots && multibots?.length > 0 &&
          <DataTable
            data={multibots}
            columns={columns}
            loading={loading}
            total={total}
            page={page}
            limit={limit}
            onPageChange={onPageChange}
          />
        }
      </div>

      {/* ---------- CONFIRM DELETE DIALOG ---------- */}
      <ConfirmDialog
        open={confirmOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        destructive
        title="Delete Bot?"
        description={
          selectedMultibot
            ? `Are you sure you want to delete "${selectedMultibot.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this bot?"
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ConfirmDialog
        open={confirmStatusChangeOpen}
        onCancel={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        destructive
        title="Change Bot Status?"
        description={
          selectedMultibot
            ? `Are you sure you want to change the status of "${selectedMultibot.name}"?`
            : "Are you sure you want to change the status of this bot?"
        }
        confirmText="Change Status"
        cancelText="Cancel"
      />
    </>
  );
}