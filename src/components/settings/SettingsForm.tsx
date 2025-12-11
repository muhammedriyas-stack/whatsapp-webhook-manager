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
import { useToast } from "@/hooks/use-toast";
import { ICommonCredentials, useUpdateSettings } from "@/services/settings.service";

const settingsSchema = z.object({
  awsRegion: z.string().min(1, "AWS region is required"),
  awsAccessKeyId: z.string().min(1, "AWS access key ID is required"),
  awsAccessKeySecret: z.string().min(1, "AWS access key secret is required"),
  s3BucketName: z.string().min(1, "S3 bucket name is required"),
  googleApiKey: z.string().min(1, "Google API key is required"),
  assistantApiUrl: z.string().url("Must be a valid URL"),
  automatedAssistantApiUrl: z.string().url("Must be a valid URL"),
  facebookGraphUrl: z.string().url("Must be a valid URL"),
  verifyToken: z.string().min(1, "Verify Token Required"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  settings: ICommonCredentials | null;
  loading: boolean;
}

export function SettingsForm({ settings, loading }: SettingsFormProps) {
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      awsRegion: "",
      awsAccessKeyId: "",
      awsAccessKeySecret: "",
      s3BucketName: "",
      googleApiKey: "",
      assistantApiUrl: "",
      automatedAssistantApiUrl: "",
      facebookGraphUrl: "",
      verifyToken: ""
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        awsRegion: settings.awsRegion,
        awsAccessKeyId: settings.awsAccessKeyId,
        awsAccessKeySecret: settings.awsAccessKeySecret,
        s3BucketName: settings.s3BucketName,
        googleApiKey: settings.googleApiKey,
        assistantApiUrl: settings.assistantApiUrl,
        automatedAssistantApiUrl: settings.automatedAssistantApiUrl,
        facebookGraphUrl: settings.facebookGraphUrl,
        verifyToken: settings.verifyToken
      });
    }
  }, [settings, form]);

  const { mutateAsync: updateSettings } = useUpdateSettings()

  const onSubmit = async (data: SettingsFormData) => {
    try {
      // if (settings?._id) {
      await updateSettings({
        _id: settings?._id,
        awsRegion: data.awsRegion,
        awsAccessKeyId: data.awsAccessKeyId,
        awsAccessKeySecret: data.awsAccessKeySecret,
        s3BucketName: data.s3BucketName,
        googleApiKey: data.googleApiKey,
        assistantApiUrl: data.assistantApiUrl,
        automatedAssistantApiUrl: data.automatedAssistantApiUrl,
        facebookGraphUrl: data.facebookGraphUrl,
        verifyToken: data.verifyToken
      });

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      // }
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
                name="awsRegion"
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
                name="awsAccessKeyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AWS Access Key ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="awsAccessKeySecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AWS Access Key Secret</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="s3BucketName"
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
                name="googleApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google API Key</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assistantApiUrl"
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
                name="automatedAssistantApiUrl"
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
                name="facebookGraphUrl"
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
              <FormField
                control={form.control}
                name="verifyToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verify Token <span className="text-gray-500 ml-2">(Common Verify Token)</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="my_token" />
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
