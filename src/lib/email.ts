import "server-only";
import { Resend } from "resend";
import { siteConfig } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import type { Order } from "@/lib/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Farah in Color <onboarding@resend.dev>";

/** Sends an email via Resend. Without an API key it just logs, so nothing breaks in development. */
export async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!opts.to) return;
  if (!resend) {
    console.info(`[email:dev] To: ${opts.to} | ${opts.subject}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, ...opts });
    if (error) console.error("[email] send failed:", error.message);
  } catch (e) {
    console.error("[email] send failed:", e);
  }
}

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Shared, simple email layout (inline styles for email clients). */
function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#FBF8F3;font-family:Helvetica,Arial,sans-serif;color:#1F1D1B">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden" cellpadding="0" cellspacing="0">
    <tr><td style="height:6px;background:linear-gradient(90deg,#E8664F,#E9A93B,#1F8A87)"></td></tr>
    <tr><td style="padding:28px 28px 8px;font-family:Georgia,serif;font-size:26px">Farah in <i style="color:#E8664F">Color</i></td></tr>
    <tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.6">
      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;margin:0 0 16px">${title}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:16px 28px;background:#F4EFE7;font-size:12px;color:#6B655E">
      <a href="${siteConfig.url}" style="color:#6B655E">${siteConfig.url.replace(/^https?:\/\//, "")}</a> ·
      <a href="${siteConfig.instagram.url}" style="color:#6B655E">@${siteConfig.instagram.handle}</a>
    </td></tr>
  </table></td></tr></table></body></html>`;
}

function orderTable(o: Order) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#6B655E;width:40%">${k}</td><td style="padding:6px 0">${v}</td></tr>`;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #eee;margin:16px 0">
    ${row("Order", esc(o.order_number))}
    ${(o.items?.length ? o.items : [{ painting_title: o.painting_title, price_usd: o.subtotal_usd }])
      .map((i) => row(esc(i.painting_title), formatPrice(i.price_usd)))
      .join("")}
    ${row("Delivery", o.delivery_fee_usd ? formatPrice(o.delivery_fee_usd) : "Free")}
    ${row("<b>Total (cash on delivery)</b>", `<b>${formatPrice(o.total_usd)}</b>`)}
    ${row("Deliver to", `${esc(o.address)}, ${esc(o.city)}, ${esc(o.area)}`)}
  </table>`;
}

export async function sendOrderEmails(order: Order, notificationEmail: string) {
  const customerWa = whatsappLink(
    order.phone,
    `Hello ${order.customer_name}, this is Farah from Farah in Color. Thank you for ordering "${order.painting_title}" (${order.order_number}). I'd love to arrange the delivery with you.`,
  );

  const artistBody = `
    <p>You have a new order! ${(o => (o.items?.length ?? 1) > 1 ? "The paintings are" : "The painting is")(order)} now marked <b>Reserved</b>.</p>
    ${orderTable(order)}
    <p><b>Customer:</b> ${esc(order.customer_name)}<br/>
       <b>Phone:</b> ${esc(order.phone)}<br/>
       ${order.email ? `<b>Email:</b> ${esc(order.email)}<br/>` : ""}
       ${order.notes ? `<b>Notes:</b> ${esc(order.notes)}` : ""}</p>
    ${customerWa ? `<p><a href="${customerWa}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">Message the customer on WhatsApp</a></p>` : ""}
    <p><a href="${siteConfig.url}/admin/orders" style="color:#1F8A87">Open the order in your dashboard →</a></p>`;

  const tasks = [
    sendEmail({
      to: notificationEmail,
      subject: `New order ${order.order_number}: ${order.painting_title}`,
      html: layout("New order received", artistBody),
      replyTo: order.email ?? undefined,
    }),
  ];

  if (order.email) {
    const customerBody = `
      <p>Dear ${esc(order.customer_name)},</p>
      <p>Thank you for your order. <b>${esc(order.painting_title)}</b> ${(order.items?.length ?? 1) > 1 ? "are" : "is"} now reserved for you.</p>
      ${orderTable(order)}
      <p>Farah will contact you on <b>${esc(order.phone)}</b> within 1–2 days to confirm the delivery date.
      Payment is <b>cash on delivery</b> in US dollars: nothing to pay now.</p>
      <p>With love and color,<br/>Farah</p>`;
    tasks.push(
      sendEmail({
        to: order.email,
        subject: `Your order ${order.order_number} – ${order.painting_title}`,
        html: layout("Thank you for your order", customerBody),
        replyTo: notificationEmail || undefined,
      }),
    );
  }
  await Promise.all(tasks);
}

export async function sendSimpleNotification(
  to: string,
  subject: string,
  fields: Record<string, string | null | undefined>,
  replyTo?: string,
) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `<p style="margin:0 0 12px"><b>${esc(k)}</b><br/>${esc(v).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  await sendEmail({ to, subject, html: layout(subject, rows), replyTo });
}

export async function sendAutoReply(to: string, name: string, kind: "commission" | "message") {
  const text =
    kind === "commission"
      ? `<p>Dear ${esc(name)},</p><p>Thank you for your commission request! Farah will review your ideas and get back to you within a few days to talk about size, colors and timing.</p><p>With love and color,<br/>Farah</p>`
      : `<p>Dear ${esc(name)},</p><p>Thank you for your message. Farah will get back to you soon.</p><p>With love and color,<br/>Farah</p>`;
  await sendEmail({
    to,
    subject: kind === "commission" ? "We received your commission request" : "Thank you for your message",
    html: layout(kind === "commission" ? "Your commission request" : "Message received", text),
  });
}
