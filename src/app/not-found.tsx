import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-10 text-5xl">This page has wandered off</h1>
      <p className="mt-4 text-muted">The painting or page you were looking for isn&apos;t here.</p>
      <Link href="/shop" className="btn-primary mt-8">Back to the gallery</Link>
    </div>
  );
}
