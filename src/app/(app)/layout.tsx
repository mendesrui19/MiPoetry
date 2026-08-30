import { AuthGuard } from "@/components/providers/store-provider";
import { NavShell } from "@/components/layout/nav-shell";
import { OfflineIndicator } from "@/components/layout/offline-indicator";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <OfflineIndicator />
      {children}
      <NavShell />
    </AuthGuard>
  );
}
