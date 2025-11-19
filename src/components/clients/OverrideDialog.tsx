import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { IClient } from "@/services/client.service";
import { Loader2 } from "lucide-react";

const overrideSchema = z.object({
    environment: z.enum(["PRODUCTION", "DEVELOPMENT"]),
    url: z.string().url("Please enter a valid URL"),
});

type OverrideFormData = z.infer<typeof overrideSchema>;

interface OverrideDialogProps {
    open: boolean;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    client: IClient | null;
    onSubmitOverride: (env: "PRODUCTION" | "DEVELOPMENT", url: string) => void;
}

export function OverrideDialog({
    open,
    onOpenChange,
    client,
    onSubmitOverride,
    loading
}: OverrideDialogProps) {
    const { toast } = useToast();

    const form = useForm<OverrideFormData>({
        resolver: zodResolver(overrideSchema),
        defaultValues: {
            environment: "DEVELOPMENT",
            url: "",
        },
    });

    // Dynamically update URL field based on selected env
    const environment = form.watch("environment");

    useEffect(() => {
        if (!client) return;

        if (environment === "PRODUCTION") {
            form.setValue("url", client.webhookUrlProd || "");
        } else {
            form.setValue("url", client.webhookUrlDev || "");
        }
    }, [environment, client, form]);

    const submitForm = (data: OverrideFormData) => {
        onSubmitOverride(data.environment, data.url);
        // form.reset();
        // onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Override Webhook URL</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">

                        {/* Environment Dropdown */}
                        <FormField
                            control={form.control}
                            name="environment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Environment</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose environment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PRODUCTION">Production</SelectItem>
                                                <SelectItem value="DEVELOPMENT">Development</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* URL Field */}
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {environment === "PRODUCTION"
                                            ? "Production Webhook URL"
                                            : "Development Webhook URL"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="https://example.com/webhook" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.reset();
                                    onOpenChange(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
