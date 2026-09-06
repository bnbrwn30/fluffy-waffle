import { z } from "zod";
import { ORIGIN_IDS } from "./origins";

/**
 * Shared between the form and the route handler so client and server can never
 * disagree about what a valid enquiry is.
 */
export const sampleRequestSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  company: z.string().trim().min(2, "Please enter your company."),
  email: z.string().trim().email("Please enter a valid email address."),
  country: z.string().trim().min(2, "Please enter your country."),
  regions: z
    .array(z.enum(ORIGIN_IDS as [string, ...string[]]))
    .min(1, "Choose at least one region."),
  message: z.string().trim().max(1200).optional().or(z.literal("")),
  /**
   * Honeypot: real people leave this empty.
   *
   * Deliberately NOT constrained to empty here. Rejecting it in the schema
   * produced a 422 that named this field in `issues`, which tells a bot
   * precisely which input to skip next time. The route accepts a filled
   * honeypot with a normal 200 instead, and simply drops it.
   */
  website: z.string().max(200).optional().or(z.literal("")),
});

export type SampleRequest = z.infer<typeof sampleRequestSchema>;
