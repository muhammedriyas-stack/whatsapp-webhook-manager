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
import { IMultibot, useCreateMultibot, useUpdateMultibot } from "@/services/multibot.service";

const multibotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assistant_id: z.string().min(1, "Assistant ID is required"),
  apiUrl: z.string().min(1, "API URL is required"),
  plan: z.enum(["STARTER", "BASIC", "PRO"]),
  isActive: z.boolean().optional()
});

type MultibotFormData = z.infer<typeof multibotSchema>;

interface MultibotDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  multibot: IMultibot | null;
}

export function MultibotDialog({ open, loading, onOpenChange, multibot }: MultibotDialogProps) {
  const { toast } = useToast();

  const form = useForm<MultibotFormData>({
    resolver: zodResolver(multibotSchema),
    defaultValues: {
      name: "",
      assistant_id: "",
      apiUrl: "",
      plan: "STARTER",
      isActive: false,
    },
  });

  useEffect(() => {
    if (multibot) {
      form.reset({
        name: multibot?.name || "",
        assistant_id: multibot?.assistant_id || "",
        apiUrl: multibot?.apiUrl || "",
        plan: multibot?.plan || "STARTER",
        isActive: multibot?.isActive || false,
      });
    } else {
      form.reset({
        name: "",
        assistant_id: "",
        apiUrl: "",
        plan: "STARTER",
        isActive: false,
      });
    }
  }, [multibot, form, loading]);

  useEffect(() => {
    if (multibot) {
      form.reset({
        name: multibot?.name || "",
        assistant_id: multibot?.assistant_id || "",
        apiUrl: multibot?.apiUrl || "",
        plan: multibot?.plan || "STARTER",
        isActive: multibot?.isActive || false,
      });
    } else {
      form.reset({
        name: "",
        assistant_id: "",
        apiUrl: "https://voice.kiksy.live/get_text",
        plan: "STARTER",
        isActive: false,
      });
    }
  }, [multibot, form, loading]);

  const { mutateAsync: createMultibot, isPending: isPendingCreateMultibot } = useCreateMultibot()
  const { mutateAsync: updateMultibot, isPending: isPendingUpdateMultibot } = useUpdateMultibot()

  const onSubmit = async (data: MultibotFormData) => {
    console.log(data, 'FORM SUBMITTING');
    try {
      if (multibot?._id) {
        await updateMultibot({
          _id: multibot._id,
          name: data.name,
          assistant_id: data.assistant_id,
          apiUrl: data.apiUrl,
          plan: data.plan,
          isActive: data.isActive,
        });

        toast({
          title: "Success",
          description: "Multibot updated successfully",
        });
      } else {
        await createMultibot({
          name: data.name,
          assistant_id: data.assistant_id,
          apiUrl: data.apiUrl,
          plan: data.plan,
          isActive: data.isActive,
        });

        toast({
          title: "Success",
          description: "Multibot created successfully",
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

  const isSubmitting = isPendingCreateMultibot || isPendingUpdateMultibot;

  console.log(isSubmitting, 'IS SUBMITTING');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{multibot ? "Edit Multibot" : "Add New Multibot"}</DialogTitle>
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
                name="apiUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API URL</FormLabel>
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
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STARTER">STARTER</SelectItem>
                          <SelectItem value="BASIC">BASIC</SelectItem>
                          <SelectItem value="PRO">PRO</SelectItem>
                        </SelectContent>
                      </Select>
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
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `${multibot ? "Update" : "Create"}`}

              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
