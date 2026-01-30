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
import { Switch } from "@/components/ui/switch"
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
import { MODE, PLAN } from "../common/constant.common";
import { capitalize } from "@/lib/utils";

const clientSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "WhatsApp number is required"),
  phoneNumberId: z.string().min(1, "Phone number ID is required"),
  accessToken: z.string().min(1, "Token is required"),
  plan: z.enum([PLAN.BASIC, PLAN.PRO, PLAN.STARTER]),
  mode: z.enum([MODE.DEVELOPMENT_MODE, MODE.PRODUCTION_MODE]),
  assistantId: z.string().min(1, "Assistant ID is required"),
  automated: z.boolean().optional(),
  whatsappBusinessId: z.string().min(1, "WABA ID is required"),
  appId: z.string(),
  secretKey: z.string().optional(),
  webhookUrlProd: z.string(),
  webhookUrlDev: z.string(),
  botEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  apiUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
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
      displayName: "",
      phoneNumber: "",
      phoneNumberId: "",
      accessToken: "",
      plan: PLAN.STARTER,
      mode: MODE.DEVELOPMENT_MODE,
      assistantId: "",
      automated: false,
      whatsappBusinessId: "",
      appId: "",
      secretKey: "",
      webhookUrlProd: "",
      webhookUrlDev: "",
      botEnabled: true,
      isActive: true,
      apiUrl: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        displayName: client?.displayName || "",
        phoneNumber: client?.phoneNumber || "",
        phoneNumberId: client?.phoneNumberId || "",
        accessToken: client?.accessToken || "",
        plan: client?.plan || PLAN.STARTER,
        mode: client?.mode || MODE.DEVELOPMENT_MODE,
        assistantId: client?.assistantId || "",
        automated: typeof client?.automated === "boolean" ? client?.automated : false,
        whatsappBusinessId: client?.whatsappBusinessId || "",
        appId: client?.appId || "",
        secretKey: client?.secretKey || "",
        webhookUrlProd: client?.webhookUrlProd || "",
        webhookUrlDev: client?.webhookUrlDev || "",
        botEnabled: typeof client?.botEnabled === "boolean" ? client?.botEnabled : true,
        isActive: typeof client?.isActive === "boolean" ? client?.isActive : true,
        apiUrl: client?.apiUrl || "",
      });
    } else {
      form.reset({
        displayName: "",
        phoneNumber: "",
        phoneNumberId: "",
        accessToken: "",
        plan: PLAN.STARTER,
        mode: MODE.DEVELOPMENT_MODE,
        assistantId: "",
        automated: false,
        whatsappBusinessId: "",
        appId: "",
        secretKey: "",
        webhookUrlProd: "",
        webhookUrlDev: "",
        botEnabled: true,
        isActive: true,
        apiUrl: "",
      });
    }
  }, [client, form, loading]);

  //MUTATIONS
  const { mutateAsync: createClient, isPending: isPendingCreateClient } = useCreateClient()
  const { mutateAsync: updateClient, isPending: isPendingUpdateClient } = useUpdateClient()

  const onSubmit = async (data: ClientFormData) => {
    console.log(data, 'FORM SUBMITTING');
    try {
      if (client?._id) {
        await updateClient({
          _id: client._id,
          displayName: data.displayName,
          phoneNumber: data.phoneNumber,
          phoneNumberId: data.phoneNumberId,
          accessToken: data.accessToken,
          plan: data.plan,
          mode: data.mode,
          assistantId: data.assistantId,
          automated: typeof data.automated === "boolean" ? data.automated : false,
          whatsappBusinessId: data.whatsappBusinessId,
          appId: data.appId,
          secretKey: data.secretKey,
          webhookUrlProd: data.webhookUrlProd,
          webhookUrlDev: data.webhookUrlDev,
          botEnabled: typeof data.botEnabled === "boolean" ? data.botEnabled : true,
          isActive: typeof data.isActive === "boolean" ? data.isActive : true,
          apiUrl: data.apiUrl,
        });

        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        await createClient({
          displayName: data.displayName,
          phoneNumber: data.phoneNumber,
          phoneNumberId: data.phoneNumberId,
          accessToken: data.accessToken,
          plan: data.plan,
          mode: data.mode,
          assistantId: data.assistantId,
          automated: typeof data.automated === "boolean" ? data.automated : false,
          whatsappBusinessId: data.whatsappBusinessId,
          appId: data.appId,
          secretKey: data.secretKey,
          webhookUrlProd: data.webhookUrlProd,
          webhookUrlDev: data.webhookUrlDev,
          botEnabled: typeof data.botEnabled === "boolean" ? data.botEnabled : true,
          isActive: typeof data.isActive === "boolean" ? data.isActive : true,
          apiUrl: data.apiUrl,
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

  console.log(isSubmitting, 'IS SUBMITTING');

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
                name="displayName"
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
                name="phoneNumber"
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
                name="accessToken"
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
                        {Object.values(PLAN).map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            {capitalize(plan)}
                          </SelectItem>

                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(MODE).map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {capitalize(mode)}
                          </SelectItem>

                        ))}
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
                name="whatsappBusinessId"
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
                name="apiUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Service API URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Leave empty to use default system AI service"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-[0.8rem] font-medium text-destructive">
                      ⚠️ Changing this affects how AI responses are generated for this client
                    </p>
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
                name="secretKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Key</FormLabel>
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Automated</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="botEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Bot Enabled</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
