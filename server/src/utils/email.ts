import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type EmailRecipient = string | string[];

interface SendEmailParams {
  to: EmailRecipient;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailParams) {
  if (!resend || !env.FROM_EMAIL) {
    console.warn("Email delivery is disabled. Set RESEND_API_KEY and FROM_EMAIL to enable it.");
    return {
      ok: false,
      id: null,
      message: "EMAIL_NOT_CONFIGURED",
      details: "Missing RESEND_API_KEY or FROM_EMAIL in the server environment.",
    };
  }

  try {
    const result = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      replyTo,
      subject,
      html,
      text,
    });

    if (result.error) {
      throw new Error(result.error.message || "Unknown Resend error");
    }

    return {
      ok: true,
      id: result.data?.id ?? null,
      message: "EMAIL_SENT",
      details: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email delivery error";
    console.error("Resend email send failed:", message);
    return {
      ok: false,
      id: null,
      message: "EMAIL_SEND_FAILED",
      details: message,
    };
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getOrderStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export async function sendContactUsEmail({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const adminEmail = env.ADMIN_EMAIL || "hello@beejveda.com";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">New contact form message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    replyTo: email,
    subject: `[Contact Us] ${subject}`,
    html,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nSubject: ${subject}\n\nMessage:\n${message}`,
  });
}

export async function sendOrderPlacedEmail(order: {
  _id?: string;
  user?: { name?: string; email?: string } | null;
  shippingAddress?: { email?: string; firstName?: string; lastName?: string };
  items?: Array<{ name: string; quantity: number; lineTotal: number }>;
  grandTotal?: number;
}) {
  const customerEmail = order.user?.email || order.shippingAddress?.email;
  const adminEmail = env.ADMIN_EMAIL || "hello@beejveda.com";

  if (!customerEmail) return { ok: false, id: null, message: "NO_CUSTOMER_EMAIL" };

  const orderNumber = order._id ? String(order._id).slice(-6).toUpperCase() : "NEW";
  const itemList = (order.items || [])
    .map(
      (item) => `- ${item.name} x ${item.quantity} (${formatCurrency(item.lineTotal)})`
    )
    .join("<br />");

  const customerMessage = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Thank you for your order, ${order.user?.name || order.shippingAddress?.firstName || "Customer"}!</h2>
      <p>Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
      <p><strong>Total:</strong> ${formatCurrency(order.grandTotal || 0)}</p>
      <p><strong>Items:</strong></p>
      <div>${itemList || "No items listed"}</div>
      <p>We will keep you updated as your order moves through processing and delivery.</p>
    </div>
  `;

  const adminMessage = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">A new order has been placed</h2>
      <p><strong>Order #:</strong> ${orderNumber}</p>
      <p><strong>Customer:</strong> ${order.user?.name || "Customer"}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Total:</strong> ${formatCurrency(order.grandTotal || 0)}</p>
      <div>${itemList || "No items listed"}</div>
    </div>
  `;

  const customerResult = await sendEmail({
    to: customerEmail,
    subject: `Your BeejVeda order #${orderNumber} is confirmed`,
    html: customerMessage,
    text: `Thank you for your order #${orderNumber}. Total: ${formatCurrency(order.grandTotal || 0)}.`,
  });

  const adminResult = await sendEmail({
    to: adminEmail,
    subject: `New order received #${orderNumber}`,
    html: adminMessage,
    text: `New order #${orderNumber} received for ${customerEmail}. Total: ${formatCurrency(order.grandTotal || 0)}`,
  });

  return {
    ok: customerResult.ok || adminResult.ok,
    customer: customerResult,
    admin: adminResult,
  };
}

export async function sendOrderStatusEmail(
  order: {
    _id?: string;
    user?: { name?: string; email?: string } | null;
    shippingAddress?: { email?: string };
    status?: string;
    grandTotal?: number;
  },
  statusOverride?: string
) {
  const customerEmail = order.user?.email || order.shippingAddress?.email;
  if (!customerEmail) return { ok: false, id: null, message: "NO_CUSTOMER_EMAIL" };

  const currentStatus = statusOverride || order.status || "updated";
  const orderNumber = order._id ? String(order._id).slice(-6).toUpperCase() : "NEW";

  return sendEmail({
    to: customerEmail,
    subject: `BeejVeda order #${orderNumber} status: ${getOrderStatusLabel(currentStatus)}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Order update</h2>
        <p>Your order <strong>#${orderNumber}</strong> is now marked as <strong>${getOrderStatusLabel(currentStatus)}</strong>.</p>
        <p>Thank you for shopping with BeejVeda.</p>
        <p><strong>Total:</strong> ${formatCurrency(order.grandTotal || 0)}</p>
      </div>
    `,
    text: `Your order #${orderNumber} is now ${getOrderStatusLabel(currentStatus)}. Thank you for shopping with BeejVeda.`,
  });
}

export async function sendOfferEmail({
  to,
  name,
  title,
  message,
}: {
  to: string;
  name?: string;
  title: string;
  message: string;
}) {
  return sendEmail({
    to,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Hi ${name || "there"},</h2>
        <p>${message}</p>
      </div>
    `,
    text: `${name || "Hi"},\n\n${message}`,
  });
}

export async function sendOfferCampaign({
  to,
  subject,
  message,
}: {
  to: string[];
  subject: string;
  message: string;
}) {
  const recipients = [...new Set(to.map((email) => email.trim().toLowerCase()).filter(Boolean))];

  if (recipients.length === 0) {
    return { ok: false, failed: [], details: [] };
  }

  const details: Array<{ email: string; ok: boolean; id: string | null }> = [];

  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin-bottom: 12px;">Exclusive offer from BeejVeda</h2>
          <p>${message.replace(/\n/g, "<br />")}</p>
        </div>
      `,
      text: `Exclusive offer from BeejVeda\n\n${message}`,
    });

    details.push({ email: recipient, ok: result.ok, id: result.id });
  }

  const failed = details.filter((item) => !item.ok).map((item) => item.email);

  return {
    ok: details.some((item) => item.ok) && failed.length < recipients.length,
    failed,
    details,
  };
}
