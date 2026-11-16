"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

/**
 * Dropdown that saves immediately when changed. `onChange` is a server action
 * bound to the record (e.g. updateOrderStatus.bind(null, id)).
 */
export function StatusSelect<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => Promise<{ ok?: boolean; error?: string } | undefined | void>;
  label: string;
}) {
  const [current, setCurrent] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      <label className="flex items-center gap-2">
        <span className="sr-only">{label}</span>
        <select
          value={current}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as T;
            const prev = current;
            setCurrent(next);
            setError(null);
            start(async () => {
              const res = await onChange(next);
              if (res && "error" in res && res.error) {
                setError(res.error);
                setCurrent(prev);
              }
            });
          }}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
      </label>
      {error && <p className="mt-1 max-w-56 text-xs text-coral-deep">{error}</p>}
    </div>
  );
}
