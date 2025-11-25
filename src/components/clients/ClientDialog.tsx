import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { IClient, useCreateClient, useUpdateClient } from "@/services/client.service";
import { Loader2 } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  phoneNumberId: z.string().min(1, "Phone number ID is required"),
  token: z.string().min(1, "Token is required"),
  plan: z.enum(["STARTER", "BASIC", "PRO"]),
  assistantId: z.string().min(1, "Assistant ID is required"),
  automated: z.boolean(),
  wabaId: z.string().min(1, "WABA ID is required"),
  appId: z.string(),
  appSecret: z.string(),
  webhookUrlProd: z.string(),
  webhookUrlDev: z.string(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  client: IClient | null;
}

export function ClientDialog({ open, loading, onOpenChange, client }: ClientDialogProps) {
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      whatsappNumber: "",
      phoneNumberId: "",
      token: "",
      plan: "STARTER",
      assistantId: "",
      automated: false,
      wabaId: "",
      appId: "",
      appSecret: "",
      webhookUrlProd: "",
      webhookUrlDev: ""
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        whatsappNumber: client.whatsappNumber,
        phoneNumberId: client.phoneNumberId,
        token: client.token,
        plan: client.plan,
        assistantId: client.assistantId,
        automated: client.automated,
        wabaId: client.wabaId,
        appId: client.appId,
        appSecret: client.appSecret,
        webhookUrlProd: client.webhookUrlProd,
        webhookUrlDev: client.webhookUrlDev,
      });
    } else {
      form.reset({
        name: "",
        whatsappNumber: "",
        phoneNumberId: "",
        token: "",
        plan: "STARTER",
        assistantId: "",
        automated: false,
        wabaId: "",
        appId: "",
        appSecret: "",
        webhookUrlProd: "",
        webhookUrlDev: ""
      });
    }
  }, [client, form, loading]);

  //MUTATIONS
  const { mutateAsync: createClient, isPending: isPendingCreateClient } = useCreateClient()
  const { mutateAsync: updateClient, isPending: isPendingUpdateClient } = useUpdateClient()

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (client?._id) {
        await updateClient({
          _id: client._id,
          name: data.name,
          whatsappNumber: data.whatsappNumber,
          phoneNumberId: data.phoneNumberId,
          token: data.token,
          plan: data.plan,
          assistantId: data.assistantId,
          automated: data.automated,
          wabaId: data.wabaId,
          appId: data.appId,
          appSecret: data.appSecret,
          webhookUrlProd: data.webhookUrlProd,
          webhookUrlDev: data.webhookUrlDev,
        });

        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        await createClient({
          name: data.name,
          whatsappNumber: data.whatsappNumber,
          phoneNumberId: data.phoneNumberId,
          token: data.token,
          plan: data.plan,
          assistantId: data.assistantId,
          automated: data.automated,
          wabaId: data.wabaId,
          appId: data.appId,
          appSecret: data.appSecret,
          webhookUrlProd: data.webhookUrlProd,
          webhookUrlDev: data.webhookUrlDev,
        });

        toast({
          title: "Success",
          description: "Client created successfully",
        });
      }

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || 'An error occurred',
        variant: "destructive",
      });
    }
  };

  const isSubmitting = isPendingCreateClient || isPendingUpdateClient;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STARTER">Starter</SelectItem>
                        <SelectItem value="BASIC">Basic</SelectItem>
                        <SelectItem value="PRO">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assistantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistant ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wabaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WABA ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Secret</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `${client ? "Update" : "Create"}`}

              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
