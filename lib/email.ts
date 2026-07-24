import { Resend } from "resend";

// No Resend account is configured yet (RESEND_API_KEY unset) — every call
// through here degrades to a logged no-op instead of throwing, so the rest
// of the app (notifications, future auth emails) can be built and tested
// end-to-end right now, and starts actually sending the moment the key is
// added to the environment. No code change needed at that point.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? "MONARQ <noreply@monarq.club>";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean }> {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipped "${params.subject}" to ${params.to}`
    );
    return { sent: false };
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    console.error("[email] send failed:", error.message);
    return { sent: false };
  }

  return { sent: true };
}
