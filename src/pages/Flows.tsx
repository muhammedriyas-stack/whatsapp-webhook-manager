import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FlowList } from "@/components/flows/FlowList";
import { Workflow } from "lucide-react";

export default function Flows() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Workflow className="h-6 w-6 text-primary" />
                        Flow Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your WhatsApp Flows, edit them in the builder, and track their status.
                    </p>
                </div>

                <FlowList />
            </div>
        </DashboardLayout>
    );
}
