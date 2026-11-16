import type { FormState } from "@/lib/validation";

type Common = {
  name: string;
  label: string;
  state: FormState;
  hint?: string;
  optional?: boolean;
  className?: string;
};

/** Labelled input / textarea / select with inline error message. */
export function Field({
  as = "input",
  name,
  label,
  state,
  hint,
  optional,
  className = "",
  children,
  defaultValue,
  ...rest
}: Common & {
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
  defaultValue?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "defaultValue">) {
  const error = state.fieldErrors?.[name]?.[0];
  const id = `f-${name}`;
  const value = state.values?.[name] ?? defaultValue;
  const shared = {
    id,
    name,
    defaultValue: value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : hint ? `${id}-hint` : undefined,
    className: `field ${error ? "border-coral-deep" : ""}`,
  };
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {as === "textarea" ? (
        <textarea {...shared} rows={4} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : as === "select" ? (
        <select {...shared} {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          {children}
        </select>
      ) : (
        <input {...shared} {...rest} />
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Invisible field that only bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormError({ state }: { state: FormState }) {
  if (!state.error) return null;
  return (
    <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral-deep">
      {state.error}
    </p>
  );
}
