import { InstagramIcon } from "@/components/icons";
import { PageHeader } from "@/components/admin/PageHeader";
import { PasswordForm, SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/data/settings";
import { getInstagramToken } from "@/lib/instagram";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [settings, igToken] = await Promise.all([getSettings(), getInstagramToken()]);
  return (
    <>
      <PageHeader title="Settings" />
      <div className="space-y-6">
        <SettingsForm settings={settings} />
        <div className="card flex items-start gap-4 p-5 sm:p-8">
          <InstagramIcon className="h-6 w-6 shrink-0" />
          <div>
            <h2 className="text-2xl">Instagram feed</h2>
            <p className="mt-1 text-sm text-muted">
              {igToken
                ? "Connected. Your latest posts appear on the home page and refresh every hour."
                : "Not connected yet. The home page shows your paintings instead. See the README section “Instagram feed” to connect it."}
            </p>
          </div>
        </div>
        <PasswordForm />
      </div>
    </>
  );
}
