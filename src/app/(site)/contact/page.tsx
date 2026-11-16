import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { getSettings } from "@/lib/data/settings";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Farah in Color by message, WhatsApp or Instagram.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ painting?: string }> }) {
  const [{ painting }, settings] = await Promise.all([searchParams, getSettings()]);
  const wa = whatsappLink(settings.whatsapp_number, "Hello Farah!");
  return (
    <div className="container-page grid gap-14 pb-10 pt-10 md:pt-16 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">
          Let&apos;s <span className="text-color-gradient italic">talk</span>
        </h1>
        <p className="mt-6 text-lg text-muted">
          Questions about a painting, delivery or a collaboration? Send a message, or reach Farah directly.
        </p>
        <div className="mt-10 space-y-3">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full sm:w-auto">
              <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
            </a>
          )}
          <a href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer" className="btn-outline w-full sm:ml-3 sm:w-auto">
            <InstagramIcon className="h-5 w-5" /> @{siteConfig.instagram.handle}
          </a>
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="card p-6 sm:p-10">
          <ContactForm painting={painting?.slice(0, 120)} />
        </div>
      </div>
    </div>
  );
}
