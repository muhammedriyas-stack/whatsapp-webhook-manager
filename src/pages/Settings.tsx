import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGetSettings } from "@/services/settings.service";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: settings, isLoading } = useGetSettings();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Configure your application settings</p>
        </div>

        <SettingsForm
          settings={settings}
          loading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
