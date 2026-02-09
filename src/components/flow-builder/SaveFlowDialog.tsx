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
import { Client } from "@/types/flow";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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
    const [popoverOpen, setPopoverOpen] = useState(false);

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
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className="w-full justify-between font-normal"
                                >
                                    {clientId ? (
                                        <div className="flex items-center gap-2 truncate">
                                            <span>{clients.find((c) => c.id === clientId)?.name}</span>
                                            {clients.find((c) => c.id === clientId)?.has_access_token && (
                                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Connected</Badge>
                                            )}
                                        </div>
                                    ) : (
                                        "Select client..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search client..." />
                                    <CommandList>
                                        <CommandEmpty>No client found.</CommandEmpty>
                                        <CommandGroup>
                                            {clients.map((client) => (
                                                <CommandItem
                                                    key={client.id}
                                                    value={client.name} // CMDK uses value for filtering
                                                    onSelect={() => {
                                                        setClientId(client.id);
                                                        setPopoverOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            clientId === client.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span>{client.name}</span>
                                                        {client.has_access_token && (
                                                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Connected</Badge>
                                                        )}
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
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
