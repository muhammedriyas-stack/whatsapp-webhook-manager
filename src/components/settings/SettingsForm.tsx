import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { SettingsData } from "@/pages/Settings";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  aws_region: z.string().min(1, "AWS region is required"),
  aws_access_key_id: z.string().min(1, "AWS access key ID is required"),
  aws_access_key_secret: z.string().min(1, "AWS access key secret is required"),
  s3_bucket_name: z.string().min(1, "S3 bucket name is required"),
  google_api_key: z.string().min(1, "Google API key is required"),
  assistant_api_url: z.string().url("Must be a valid URL"),
  automated_assistant_api_url: z.string().url("Must be a valid URL"),
  facebook_graph_url: z.string().url("Must be a valid URL"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  settings: SettingsData | null;
  loading: boolean;
  onSuccess: () => void;
}

export function SettingsForm({ settings, loading, onSuccess }: SettingsFormProps) {
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      aws_region: "",
      aws_access_key_id: "",
      aws_access_key_secret: "",
      s3_bucket_name: "",
      google_api_key: "",
      assistant_api_url: "",
      automated_assistant_api_url: "",
      facebook_graph_url: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        aws_region: settings.aws_region,
        aws_access_key_id: settings.aws_access_key_id,
        aws_access_key_secret: settings.aws_access_key_secret,
        s3_bucket_name: settings.s3_bucket_name,
        google_api_key: settings.google_api_key,
        assistant_api_url: settings.assistant_api_url,
        automated_assistant_api_url: settings.automated_assistant_api_url,
        facebook_graph_url: settings.facebook_graph_url,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      if (settings?.id) {
        await api.updateSettings({
          awsRegion: data.aws_region,
          awsAccessKeyId: data.aws_access_key_id,
          awsAccessKeySecret: data.aws_access_key_secret,
          s3BucketName: data.s3_bucket_name,
          googleApiKey: data.google_api_key,
          assistantApiUrl: data.assistant_api_url,
          automatedAssistantApiUrl: data.automated_assistant_api_url,
          facebookGraphUrl: data.facebook_graph_url,
        });

        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
      } else {
        await api.createSettings({
          awsRegion: data.aws_region,
          awsAccessKeyId: data.aws_access_key_id,
          awsAccessKeySecret: data.aws_access_key_secret,
          s3BucketName: data.s3_bucket_name,
          googleApiKey: data.google_api_key,
          assistantApiUrl: data.assistant_api_url,
          automatedAssistantApiUrl: data.automated_assistant_api_url,
          facebookGraphUrl: data.facebook_graph_url,
        });

        toast({
          title: "Success",
          description: "Settings created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>Configure your API keys and URLs</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aws_region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AWS Region</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="us-east-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aws_access_key_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AWS Access Key ID</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aws_access_key_secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AWS Access Key Secret</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="s3_bucket_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>S3 Bucket Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="google_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google API Key</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assistant_api_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistant API URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://api.example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="automated_assistant_api_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Automated Assistant API URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://api.example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebook_graph_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Graph URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://graph.facebook.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                {settings ? "Update Settings" : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
