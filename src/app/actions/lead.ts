"use server";

import config from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";

const LeadSchema = z.object({
  type: z.enum(["test-drive", "finance", "trade-in", "vehicle", "contact"]),
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  phone: z
    .string()
    .trim()
    .regex(
      /^[+\d][\d\s()-]{8,18}$/,
      "Please enter a valid phone number, for example 082 123 4567.",
    ),
  email: z.union([z.literal(""), z.email("Please enter a valid email address.")]).optional(),
  interest: z.string().trim().max(120).optional(),
  preferredDate: z.string().trim().max(20).optional(),
  message: z.string().trim().max(2000).optional(),
  consent: z.literal("on", { message: "Please agree so we can contact you." }),
  // Honeypot: real people never fill this hidden field.
  company: z.string().max(0).optional(),
});

export type LeadState = { ok: boolean; message: string; errors?: Record<string, string> };

// Simple in-memory rate limit: five submissions per address per ten minutes.
const hits = new Map<string, number[]>();
const limited = (key: string) => {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > 5;
};

export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  const parsed = LeadSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip))
    return { ok: false, message: "Too many requests. Please call us on 012 023 3433 instead." };

  const data = parsed.data;
  const payload = await getPayload({ config });
  const lead = await payload.create({
    collection: "leads",
    overrideAccess: true,
    data: {
      type: data.type,
      status: "new",
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      interest: data.interest,
      preferredDate: data.preferredDate ? new Date(data.preferredDate).toISOString() : undefined,
      message: data.message,
      consent: true,
    },
  });

  const to = process.env.LEADS_TO;
  if (to) {
    try {
      await payload.sendEmail({
        to,
        subject: `New ${data.type.replace("-", " ")} lead: ${data.name}`,
        text: [
          `Name: ${data.name}`,
          `Phone: ${data.phone}`,
          `Email: ${data.email || "-"}`,
          `Interested in: ${data.interest || "-"}`,
          `Preferred date: ${data.preferredDate || "-"}`,
          `Message: ${data.message || "-"}`,
          "",
          `Open in admin: ${process.env.NEXT_PUBLIC_SERVER_URL ?? ""}/admin/collections/leads/${lead.id}`,
        ].join("\n"),
      });
    } catch (error) {
      payload.logger.error({ err: error }, "Lead saved but the notification email failed");
    }
  }

  return {
    ok: true,
    message: `Thanks ${data.name.split(" ")[0]}. We'll call you shortly to confirm.`,
  };
}
