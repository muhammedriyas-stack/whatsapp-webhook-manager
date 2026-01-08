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
import { Loader2 } from "lucide-react";
import { IClient, useLAConfig } from "@/services/client.service";

const laConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assistant_id: z.string().min(1, "Assistant ID is required"),
  phone_num_id: z.string().min(1, "Phone Number ID is required"),
  user_email: z.string().min(1, "User Email is required"),
  user_key: z.string().min(1, "User Key is required"),
});

type LAConfigFormData = z.infer<typeof laConfigSchema>;

interface ILAConfig {
  _id: string;
  name: string;
  assistant_id: string;
  phone_num_id: string;
  user_email: string;
  user_key: string;
}

interface LAConfigDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  client: IClient | null;
}

export function LAConfigDialog({ open, loading, onOpenChange, client }: LAConfigDialogProps) {
  const { toast } = useToast();

  const form = useForm<LAConfigFormData>({
    resolver: zodResolver(laConfigSchema),
    defaultValues: {
      name: "",
      assistant_id: "",
      phone_num_id: "",
      user_email: "muhammed.riyas@kiksy.ai",
      user_key: "devkey4",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client?.displayName || "",
        assistant_id: client?.assistantId || "",
        phone_num_id: client?.phoneNumberId || "",
        user_email: "muhammed.riyas@kiksy.ai",
        user_key: "devkey4",
      });
    } else {
      form.reset({
        name: "",
        assistant_id: "",
        phone_num_id: "",
        user_email: "muhammed.riyas@kiksy.ai",
        user_key: "devkey4",
      });
    }
  }, [client, form, loading]);

  useEffect(() => {
    if (client) {
      form.reset({
        name: client?.displayName || "",
        assistant_id: client?.assistantId || "",
        phone_num_id: client?.phoneNumberId || "",
        user_email: "muhammed.riyas@kiksy.ai",
        user_key: "devkey4",
      });
    } else {
      form.reset({
        name: "",
        assistant_id: "",
        phone_num_id: "",
        user_email: "muhammed.riyas@kiksy.ai",
        user_key: "devkey4",
      });
    }
  }, [client, form, loading]);

  const { mutateAsync: createLAConfig, isPending: isPendingCreateLAConfig } = useLAConfig()

  const onSubmit = async (data: any) => {
    try {
      if (client?._id) {
        const response = await createLAConfig({ id: client?._id, ...data });

        toast({
          title: "Success",
          description: response?.data?.message,
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

  const isSubmitting = isPendingCreateLAConfig;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Edit LA Config" : "Add New LA Config"}</DialogTitle>
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
                name="user_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Key</FormLabel>
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
