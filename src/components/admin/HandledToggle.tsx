"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

export function HandledToggle({ handled, onToggle }: { handled: boolean; onToggle: (v: boolean) => Promise<{ ok?: boolean; error?: string }> }) {
  const [value, setValue] = useState(handled);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !value;
        setValue(next);
        start(async () => {
          const res = await onToggle(next);
          if (res?.error) setValue(!next);
        });
      }}
      className={`btn px-4 py-2 ${value ? "bg-teal/15 text-teal-deep" : "border border-line bg-paper"}`}
    >
      <Check className="h-4 w-4" /> {value ? "Replied" : "Mark as replied"}
    </button>
  );
}
