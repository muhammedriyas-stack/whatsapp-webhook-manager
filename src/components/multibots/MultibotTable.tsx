"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Globe, MoreHorizontal, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Column, DataTable } from "../common/DataTable";
import { IMultibot } from "@/services/multibot.service";
import { capitalize, cn } from "@/lib/utils";
import { BOT_TYPE } from "../common/constant.common";

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
      header: "S.No",
      cell: (_, i) => (page * limit) + i + 1,
    },
    {
      header: "Name",
      cell: (c) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{c.name}</span>
          {c.botType && (
            <Badge
              className={cn(
                "w-fit text-[10px] md:text-xs px-2 py-0.5 flex items-center gap-1.5 font-semibold transition-all duration-300",
                c.botType === BOT_TYPE.MULTIBOT
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/25"
                  : "bg-cyan-500/15 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/25"
              )}
              variant="outline"
            >
              {c.botType === BOT_TYPE.MULTIBOT ? (
                <Globe className="w-3 h-3 animate-pulse" />
              ) : (
                <FlaskConical className="w-3 h-3" />
              )}
              {capitalize(c.botType)}
            </Badge>
          )}
        </div>
      ),
    },
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
            renderMobileItem={(c, i) => (
              <div key={c._id} className="mb-4 rounded-lg border border-border bg-card p-4">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">
                      <span className="text-muted-foreground mr-2">#{(page * limit) + i + 1}</span>
                      {c.name}
                    </div>
                    {c.botType && (
                      <Badge
                        className={cn(
                          "w-fit text-[10px] px-2 py-0.5 flex items-center gap-1 font-semibold",
                          c.botType === BOT_TYPE.MULTIBOT
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
                            : "bg-cyan-500/15 text-cyan-500 border-cyan-500/20"
                        )}
                        variant="outline"
                      >
                        {c.botType === BOT_TYPE.MULTIBOT ? (
                          <Globe className="w-2.5 h-2.5" />
                        ) : (
                          <FlaskConical className="w-2.5 h-2.5" />
                        )}
                        {capitalize(c.botType)}
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
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(c)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-muted-foreground mb-1 uppercase tracking-wider font-semibold opacity-70">Assistant ID</p>
                      <p className="font-medium">{c.assistant_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground mb-1 uppercase tracking-wider font-semibold opacity-70">Plan</p>
                      <Badge variant={c.plan === "PRO" ? "default" : "secondary"} className="text-[10px] px-1.5 h-4">
                        {c.plan}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Status</span>
                    <Switch
                      checked={c.isActive}
                      onCheckedChange={() => handleStatusChangeClick(c)}
                    />
                  </div>
                </div>
              </div>
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