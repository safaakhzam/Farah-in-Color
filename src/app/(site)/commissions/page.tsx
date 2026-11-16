import type { Metadata } from "next";
import { CommissionForm } from "@/components/forms/CommissionForm";

export const metadata: Metadata = {
  title: "Commission a painting",
  description: "Request a custom original painting from Farah in Color: choose the size, colors and mood, within your budget.",
  alternates: { canonical: "/commissions" },
};

const steps = [
  ["Share your idea", "Tell Farah about the size, colors, room and budget. Add photos if you have them."],
  ["Design & quote", "Farah replies with ideas, a timeline and a price in USD. No commitment until you agree."],
  ["Painting", "Farah paints your piece and shares progress photos along the way."],
  ["Delivery", "Hand-delivered anywhere in Lebanon, cash on delivery."],
];

export default function CommissionsPage() {
  return (
    <div className="container-page grid gap-14 pb-10 pt-10 md:pt-16 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <p className="eyebrow">Commissions</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">
          A painting made <span className="text-color-gradient italic">just for you</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Looking for the perfect piece for a particular wall, or a meaningful gift? Farah creates custom original
          paintings in her signature colorful style.
        </p>
        <ol className="mt-10 space-y-6">
          {steps.map(([title, text], i) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 font-serif text-lg">{i + 1}</span>
              <div>
                <h2 className="font-sans text-base font-medium">{title}</h2>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="lg:col-span-7">
        <div className="card p-6 sm:p-10">
          <h2 className="mb-6 text-3xl">Request a commission</h2>
          <CommissionForm />
        </div>
      </div>
    </div>
  );
}
