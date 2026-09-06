"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { ORIGINS } from "@/lib/origins";
import { sampleRequestSchema, type SampleRequest } from "@/lib/sampleRequest";
import { DUR, EASE } from "@/lib/motion";
import {
  WHATSAPP_DISPLAY,
  sampleEnquiryMessage,
  whatsappLink,
} from "@/lib/whatsapp";
import Reveal from "@/components/ui/Reveal";

/**
 * Inputs are deliberately compact — 40px rather than the 56px they were.
 * A B2B enquiry form is a chore, not a hero: the faster it reads as "six short
 * questions", the more of them get finished.
 */
const field =
  "w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-fg sm:text-sm " +
  "placeholder:text-faint transition-[border-color,box-shadow] duration-[var(--dur-fast)] " +
  "[transition-timing-function:var(--ease)] hover:border-faint/70 " +
  "focus:border-accent-solid focus:outline-none " +
  "focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-solid)_18%,transparent)]";

const labelClass = "text-[10px] uppercase tracking-[0.16em] text-faint";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.04-.98.22-3.3-.69-2.78-1.1-4.53-3.94-4.67-4.12-.14-.18-1.12-1.49-1.12-2.84s.71-2.02.96-2.29c.25-.28.55-.35.73-.35h.52c.17 0 .4-.06.62.48.24.57.8 1.98.87 2.13.07.14.12.31.02.49-.09.18-.14.29-.28.45l-.42.49c-.14.14-.28.3-.12.58.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.2.7-.81.88-1.09.19-.28.37-.23.62-.14.25.09 1.61.76 1.89.9.28.14.46.21.53.32.07.11.07.62-.17 1.29Z" />
    </svg>
  );
}

/** The ways to reach a person, ordered by how fast they answer. */
const WHATSAPP_HREF = whatsappLink(
  "Hello Vera Coffee — I'd like to talk about Ethiopian green coffee.",
);

const CHANNELS = [
  {
    key: "email",
    label: "Email",
    value: "trade@veracoffeeexport.com",
    href: "mailto:trade@veracoffeeexport.com",
    note: "Offers, contracts and documents",
  },
  {
    key: "office",
    label: "Office",
    value: "Addis Ababa, Ethiopia",
    href: null,
    note: "Samples are couriered from Addis",
  },
] as const;

export default function SampleForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SampleRequest>({
    resolver: zodResolver(sampleRequestSchema),
    // Errors on blur rather than on submit: a buyer finds out the email is
    // malformed while still looking at that field, not after the send fails.
    mode: "onBlur",
    defaultValues: { regions: [], message: "", website: "" },
  });

  /** Composes the enquiry into an opening WhatsApp message and opens the chat. */
  const openWhatsApp = (v: Partial<SampleRequest>) => {
    const regions = ORIGINS.filter((o) => v.regions?.includes(o.id)).map(
      (o) => o.name,
    );
    window.open(
      whatsappLink(sampleEnquiryMessage({ ...v, regions })),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const onSubmit = async (data: SampleRequest) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/sample-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }

      // The server accepts the enquiry even with no mail or webhook channel
      // configured. Rather than let it stop at a log line, hand the composed
      // message to WhatsApp so it actually reaches someone.
      const body = (await res.json().catch(() => null)) as {
        delivered?: boolean;
      } | null;
      if (body?.delivered === false) openWhatsApp(data);

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-24 border-t border-line bg-bg py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <div className="grid gap-9 sm:gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:pt-2">
            <Reveal>
              <p className="kicker">Next step</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                id="contact-heading"
                className="font-display mt-3 text-[clamp(1.6rem,6.8vw,1.75rem)] leading-[1.12] text-balance text-fg sm:mt-4 sm:text-4xl sm:leading-[1.1]"
              >
                Cup it before we talk price.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
                Tell us roughly what you buy — volume, grades, the profiles
                you are after — and we will courier 300 g samples of whatever
                fits, along with the current offer list. No charge for the
                samples or the freight.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left transition-[border-color,transform] duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] hover:-translate-y-px hover:border-[#25D366] sm:w-auto"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">
                    Chat on WhatsApp
                  </span>
                  <span className="nums block text-xs text-faint">
                    {WHATSAPP_DISPLAY} · Mon–Sat, 8:00–18:00 EAT
                  </span>
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.18}>
              <dl className="mt-8 space-y-4 border-t border-line pt-6">
                {CHANNELS.map((c) => (
                  <div key={c.key}>
                    <dt className={labelClass}>{c.label}</dt>
                    <dd className="mt-1 text-sm text-fg">
                      {c.href ? (
                        <a
                          href={c.href}
                          className="underline decoration-line underline-offset-4 transition-colors hover:decoration-accent-solid"
                        >
                          {c.value}
                        </a>
                      ) : (
                        c.value
                      )}
                      <span className="mt-0.5 block text-xs text-faint">
                        {c.note}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DUR.base, ease: EASE }}
                  className="rounded-2xl border border-accent-solid bg-surface p-6 sm:p-8"
                  role="status"
                >
                  <p className="font-display text-2xl text-fg">
                    Request received.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    We will come back to you within one working day with the
                    offer list and the courier details for the samples.
                  </p>
                  <a
                    href={WHATSAPP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm text-accent underline underline-offset-4"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Need it sooner? Message us on WhatsApp
                  </a>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: DUR.fast, ease: EASE }}
                  className="relative rounded-2xl border border-line bg-surface p-4 shadow-[0_18px_40px_-32px_rgba(23,18,13,0.5)] xs:p-5 sm:p-7"
                >
                  {/* Honeypot: positioned off-screen rather than display:none,
                      because bots skip hidden fields but fill this one. */}
                  <input
                    {...register("website")}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  />

                  <div className="grid gap-3.5 xs:grid-cols-2">
                    <Field label="Name" error={errors.name?.message}>
                      <input
                        {...register("name")}
                        className={field}
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="Company" error={errors.company?.message}>
                      <input
                        {...register("company")}
                        className={field}
                        autoComplete="organization"
                      />
                    </Field>
                    <Field label="Email" error={errors.email?.message}>
                      <input
                        {...register("email")}
                        type="email"
                        inputMode="email"
                        className={field}
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Country" error={errors.country?.message}>
                      <input
                        {...register("country")}
                        className={field}
                        autoComplete="country-name"
                      />
                    </Field>
                  </div>


                  <fieldset className="mt-5">
                    <legend className={labelClass}>Regions of interest</legend>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {ORIGINS.map((o) => (
                        <label
                          key={o.id}
                          className="inline-flex min-h-10 cursor-pointer select-none items-center rounded-full border border-line px-4 text-[13px] text-muted transition-[background-color,border-color,color] duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] hover:border-faint has-[:checked]:border-accent-solid has-[:checked]:bg-accent-solid has-[:checked]:text-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
                        >
                          <input
                            type="checkbox"
                            value={o.id}
                            {...register("regions")}
                            className="sr-only"
                          />
                          {o.name}
                        </label>
                      ))}
                    </div>
                    {errors.regions && (
                      <p className="mt-2 text-xs text-clay">
                        {errors.regions.message}
                      </p>
                    )}
                  </fieldset>

                  <div className="mt-4">
                    <Field label="Message" error={errors.message?.message}>
                      <textarea
                        {...register("message")}
                        rows={3}
                        className={`${field} resize-y`}
                      />
                    </Field>
                  </div>

                  <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                    <a
                      href={WHATSAPP_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-solid px-5 py-3 text-sm font-medium text-fg transition-[background-color,transform] duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] hover:bg-accent-hover active:translate-y-px"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-5 py-3 text-sm text-fg transition-[border-color,color] duration-[var(--dur-fast)] [transition-timing-function:var(--ease)] hover:border-[#25D366] hover:text-[#25D366] disabled:opacity-60"
                    >
                      {isSubmitting ? "Sending…" : "Send message"}
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-faint">
                    We will reply shortly. No newsletter, and we do not pass
                    your details on.
                  </p>

                  {status === "error" && (
                    <p role="alert" className="mt-3 text-sm text-clay">
                      That did not send. Try again, or message us on WhatsApp
                      and we will pick it up there.
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {error && <span className="mt-1 block text-xs text-clay">{error}</span>}
    </label>
  );
}
