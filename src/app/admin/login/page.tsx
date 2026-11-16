import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Artist login" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Logo />
          <p className="mt-3 text-sm text-muted">Artist dashboard</p>
        </div>
        <div className="card mt-8 p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
