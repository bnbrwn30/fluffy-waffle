import Reveal from "@/components/ui/Reveal";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

/**
 * The questions a first email always asks, answered before it has to be sent.
 *
 * Placed immediately above the sample form on purpose: this section exists to
 * remove the reasons someone stalls before filling it in. Terms, minimums,
 * documents and lead times are what a green buyer needs settled to take an
 * exporter seriously, and making them ask for each one by email is friction
 * that costs enquiries.
 *
 * Native <details>/<summary>, not a JavaScript accordion. It is keyboard
 * operable, findable by the browser's own in-page search even while collapsed,
 * works with no script at all, and ships nothing. An accordion component here
 * would be bundle spent on re-implementing an element that already exists.
 *
 * ---------------------------------------------------------------------------
 * EVERY ANSWER BELOW IS DRAFTED, NOT CONFIRMED.
 *
 * The figures are drawn from what the rest of the site already states — the
 * hero's terms and minimum, the Logistics table's Incoterms, packing and
 * payment, the transit times, the harvest windows in lib/origins.ts — so the
 * page does not contradict itself. Where the site says nothing, the answer
 * follows ordinary specialty green trade practice and is marked VERIFY.
 *
 * Anything a buyer could hold you to — sample cost and lead time, payment
 * terms, who pays freight, EUDR readiness — must be confirmed before this
 * goes in front of anyone. An FAQ is the most quotable content on a trading
 * site precisely because it reads as policy.
 * ---------------------------------------------------------------------------
 */
type Qa = {
  q: string;
  /** Paragraphs. Kept as an array so an answer can breathe. */
  a: string[];
};

const FAQS: Qa[] = [
  {
    q: "What is the minimum order?",
    a: [
      // Consistent with the hero's "Minimum: one 20ft container, 19.2 MT" and
      // the Logistics table's "19.2 MT — 320 × 60 kg jute".
      "One 20ft container — 19.2 MT, or 320 bags of 60 kg. That is the smallest volume that ships economically on its own bill of lading.",
      // VERIFY: whether you will in fact consolidate. It is a real
      // differentiator for small roasters if you can, and a promise you cannot
      // walk back if you cannot.
      "Below a full container we can look at consolidating with another buyer on the same sailing, though that depends on what else is booked at the time. Ask and we will tell you what is moving.",
    ],
  },
  {
    q: "How do samples work, and what do they cost?",
    a: [
      // VERIFY: sample policy, courier cost and who bears it.
      "Tell us the regions, grades and cup profile you are after and we will send pre-shipment samples of whatever fits. Samples themselves are free; courier is at cost, and we will confirm the charge before anything ships.",
      // Consistent with the Quality section's certificate-of-analysis line.
      "Each sample travels with its own certificate of analysis for that lot — moisture, water activity, density and full defect count, against the standard each is measured by.",
      // VERIFY: actual courier lead time from Addis to your main markets.
      "Reckon on a week to ten days by courier to Europe once a lot is selected.",
    ],
  },
  {
    q: "Which Incoterms do you quote?",
    a: [
      // Straight from the Logistics TERMS table.
      "FOB Djibouti as standard. CIF and FCA Addis Ababa on request.",
      "On FOB we handle milling, grading, stuffing, the corridor down to Djibouti and everything up to the ship's rail, along with the documents that follow it.",
    ],
  },
  {
    q: "What are your payment terms?",
    a: [
      // From the Logistics TERMS table: "L/C at sight · CAD".
      // VERIFY: whether anything else is available, and to whom.
      "Letter of credit at sight, or cash against documents.",
      "For a first shipment we will normally work on an L/C. Once there is a history between us, terms are a conversation.",
    ],
  },
  {
    q: "Which documents ship with a container?",
    a: [
      // VERIFY the exact set you issue. These are the standard Ethiopian
      // green coffee export documents; the ICO certificate of origin and the
      // phytosanitary certificate are not optional, the rest vary by buyer
      // and destination.
      "ICO certificate of origin, phytosanitary certificate, commercial invoice, packing list, bill of lading, and the weight and quality certificates from the pre-shipment inspection.",
      "If your customs authority or your own certification scheme needs anything beyond that, tell us early and we will arrange it before the container is sealed.",
    ],
  },
  {
    q: "How long does shipping take?",
    a: [
      // Matches the ROUTES table in Logistics.tsx.
      "From Djibouti, roughly nine days to Jeddah, twenty-one to Hamburg, twenty-eight to Rotterdam and thirty-four to New York, depending on the service and the transhipment.",
      "Add a week or two for milling, grading and the corridor before the vessel, and plan the whole thing from contract to warehouse in about two months.",
    ],
  },
  {
    q: "When can I buy, and when does it ship?",
    a: [
      // Consistent with the harvest and shipping windows in lib/origins.ts.
      "Harvest runs from October to February depending on the region — Jimma picks earliest, Sidama and Guji latest. Export-ready windows follow a couple of months behind, so most lots ship between January and August.",
      "Grade 1 and 2 lots are the top of a crop and are usually spoken for early, so for those it is worth reserving ahead rather than buying spot.",
    ],
  },
  {
    q: "Are you EUDR compliant?",
    a: [
      // VERIFY — and this one matters more than the rest. EU deforestation
      // regulation compliance is a hard gate for European importers, and the
      // honest answer is whatever your geolocation data actually supports.
      // Do not let this go live as a claim you cannot evidence.
      "Talk to us directly about this one. What we can evidence depends on the washing station and the crop year, and we would rather show you the actual data for the lots you are considering than make a blanket claim on a web page.",
    ],
  },
  {
    q: "Can you supply organic or certified lots?",
    a: [
      // VERIFY which certifications you actually hold or can source against.
      "Some, and it depends on the season. Tell us which scheme you need and for what volume, and we will tell you plainly whether we can cover it this crop or not.",
    ],
  },
];

export default function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative border-t border-line bg-bg py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-10">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="kicker">Before you ask</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                id="faq-heading"
                className="font-display mt-3 max-w-md text-[clamp(1.75rem,7vw,2rem)] leading-[1.08] text-balance text-fg sm:mt-4 sm:text-[2.5rem] sm:leading-[1.05]"
              >
                Terms, minimums and paperwork.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-muted sm:text-base">
                The things a first email always asks. If yours is not here,{" "}
                <a
                  href={whatsappLink("Hello — a question about your green coffee.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-wipe text-accent"
                >
                  message us on WhatsApp
                </a>{" "}
                and you will get a straight answer.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.14}>
              {/* A hairline between rows rather than a bordered card each:
                  nine boxes down a page reads as a form to be filled in, and
                  this is meant to read as a list to be skimmed. */}
              <dl className="border-t border-line">
                {FAQS.map((item) => (
                  <div key={item.q} className="border-b border-line">
                    <details className="group">
                      <summary
                        className={[
                          "flex cursor-pointer list-none items-start justify-between gap-6",
                          "py-4 text-left transition-colors sm:py-5",
                          "duration-[var(--dur-fast)] [transition-timing-function:var(--ease)]",
                          "text-fg hover:text-accent",
                          // Safari still paints a disclosure triangle without
                          // this, on top of `list-none`.
                          "[&::-webkit-details-marker]:hidden",
                        ].join(" ")}
                      >
                        <dt className="text-[0.9375rem] leading-snug font-medium sm:text-base">
                          {item.q}
                        </dt>
                        {/* A plus that becomes a minus. Two lines, one of which
                            rotates out — no icon font, no swap. */}
                        <span
                          aria-hidden
                          className="relative mt-1.5 block size-3 shrink-0"
                        >
                          <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-current" />
                          <span
                            className={[
                              "absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-current",
                              "origin-center transition-transform duration-[var(--dur-fast)]",
                              "[transition-timing-function:var(--ease)]",
                              "group-open:rotate-90",
                            ].join(" ")}
                          />
                        </span>
                      </summary>
                      <dd className="pr-8 pb-5 text-sm leading-relaxed text-muted">
                        {item.a.map((p, i) => (
                          <p key={p} className={i ? "mt-3" : undefined}>
                            {p}
                          </p>
                        ))}
                      </dd>
                    </details>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-5 text-xs text-faint">
                Terms above are how we normally work, not a quotation. Anything
                on a contract is confirmed in writing against the specific lot
                and sailing. WhatsApp {WHATSAPP_DISPLAY}.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
