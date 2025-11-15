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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/pages/Clients";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  whatsapp_number: z.string().min(1, "WhatsApp number is required"),
  phone_number_id: z.string().min(1, "Phone number ID is required"),
  token: z.string().min(1, "Token is required"),
  my_token: z.string().min(1, "My token is required"),
  plan: z.enum(["STARTER", "BASIC", "PRO"]),
  assistant_id: z.string().min(1, "Assistant ID is required"),
  automated: z.boolean(),
  waba_id: z.string().min(1, "WABA ID is required"),
  app_id: z.string().min(1, "App ID is required"),
  app_secret: z.string().min(1, "App secret is required"),
  session_key: z.string().min(1, "Session key is required"),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess: () => void;
}

export function ClientDialog({ open, onOpenChange, client, onSuccess }: ClientDialogProps) {
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      whatsapp_number: "",
      phone_number_id: "",
      token: "",
      my_token: "",
      plan: "STARTER",
      assistant_id: "",
      automated: false,
      waba_id: "",
      app_id: "",
      app_secret: "",
      session_key: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        whatsapp_number: client.whatsapp_number,
        phone_number_id: client.phone_number_id,
        token: client.token,
        my_token: client.my_token,
        plan: client.plan,
        assistant_id: client.assistant_id,
        automated: client.automated,
        waba_id: client.waba_id,
        app_id: client.app_id,
        app_secret: client.app_secret,
        session_key: client.session_key,
      });
    } else {
      form.reset({
        name: "",
        whatsapp_number: "",
        phone_number_id: "",
        token: "",
        my_token: "",
        plan: "STARTER",
        assistant_id: "",
        automated: false,
        waba_id: "",
        app_id: "",
        app_secret: "",
        session_key: "",
      });
    }
  }, [client, form]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (client?.id) {
        await api.updateClient(client.id, {
          name: data.name,
          whatsappNumber: data.whatsapp_number,
          phoneNumberId: data.phone_number_id,
          token: data.token,
          myToken: data.my_token,
          plan: data.plan,
          assistantId: data.assistant_id,
          automated: data.automated,
          wabaId: data.waba_id,
          appId: data.app_id,
          appSecret: data.app_secret,
          sessionKey: data.session_key,
        });

        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        await api.createClient({
          name: data.name,
          whatsappNumber: data.whatsapp_number,
          phoneNumberId: data.phone_number_id,
          token: data.token,
          myToken: data.my_token,
          plan: data.plan,
          assistantId: data.assistant_id,
          automated: data.automated,
          wabaId: data.waba_id,
          appId: data.app_id,
          appSecret: data.app_secret,
          sessionKey: data.session_key,
        });

        toast({
          title: "Success",
          description: "Client created successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
                name="whatsapp_number"
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
                name="phone_number_id"
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
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="my_token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>My Token</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
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
                name="assistant_id"
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
                name="waba_id"
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
                name="app_id"
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
                name="app_secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Secret</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="session_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Key</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="automated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Automated</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
              <Button type="submit">
                {client ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
