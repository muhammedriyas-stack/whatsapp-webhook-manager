import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Client } from "@/types/flow";
import { Badge } from "@/components/ui/badge";

interface SaveFlowDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clients: Client[];
    defaultValues?: {
        flowName: string;
        clientId: string | null;
    };
    onSave: (data: { flowName: string; clientId: string }) => void;
    isLoading?: boolean;
    mode: "save" | "create";
}

export function SaveFlowDialog({
    open,
    onOpenChange,
    clients,
    defaultValues,
    onSave,
    isLoading = false,
    mode
}: SaveFlowDialogProps) {
    const [flowName, setFlowName] = useState("");
    const [clientId, setClientId] = useState<string>("");

    useEffect(() => {
        if (open) {
            setFlowName(defaultValues?.flowName || "");
            setClientId(defaultValues?.clientId || "");
        }
    }, [open, defaultValues]);

    const handleSave = () => {
        if (!flowName.trim() || !clientId) return;
        onSave({ flowName, clientId });
    };

    const selectedClient = clients.find((c) => c.id === clientId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Create Flow" : "Save Draft"}</DialogTitle>
                    <DialogDescription>
                        Enter the details for your flow below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Flow Name</Label>
                        <Input
                            id="name"
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            placeholder="e.g. Feedback Survey"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="client">Client</Label>
                        <Select value={clientId} onValueChange={setClientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        <div className="flex items-center gap-2">
                                            <span>{client.name}</span>
                                            {client.has_access_token && (
                                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Connected</Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedClient && !selectedClient.has_access_token && (
                            <p className="text-[10px] text-destructive">
                                This client is not connected to WhatsApp API.
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading || !flowName.trim() || !clientId}>
                        {isLoading ? "Processing..." : (mode === "create" ? "Create" : "Save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
