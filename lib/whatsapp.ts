/**
 * WhatsApp click-to-chat.
 *
 * wa.me wants the number in full international form with no punctuation, so the
 * local 09... is normalised here rather than at every call site.
 */
export const WHATSAPP_NUMBER = "251913199168";
/** Display form, for anywhere the number is shown rather than dialled. */
export const WHATSAPP_DISPLAY = "+251 913 199 168";

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Composes whatever the buyer has already typed into the sample form into an
 * opening message — so switching to WhatsApp mid-form doesn't start from a
 * blank chat.
 */
export function sampleEnquiryMessage(v: {
  name?: string;
  company?: string;
  country?: string;
  regions?: string[];
}): string {
  const lines = [
    "Hello Vera Coffee — I'd like to request green coffee samples.",
    "",
    v.name && `Name: ${v.name}`,
    v.company && `Company: ${v.company}`,
    v.country && `Country: ${v.country}`,
    v.regions?.length && `Regions: ${v.regions.join(", ")}`,
  ].filter(Boolean);
  return lines.join("\n");
}
