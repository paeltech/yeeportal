type SendDocumentEmailParams = {
  to: string;
  documentTitle: string;
  groupName: string;
  downloadUrl: string;
};

export async function sendDocumentDownloadEmail(
  params: SendDocumentEmailParams,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "YEE Portal <documents@yee.or.tz>";

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [params.to],
      subject: `Your download: ${params.documentTitle}`,
      html: `
        <p>Hello,</p>
        <p>Thank you for your interest in <strong>${params.groupName}</strong>.</p>
        <p>You requested: <strong>${params.documentTitle}</strong></p>
        <p><a href="${params.downloadUrl}">Click here to download your document</a></p>
        <p>This link expires in 24 hours.</p>
        <p>— YEE Tanzania</p>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false, reason: body || response.statusText };
  }

  return { sent: true };
}

export function buildDownloadUrl(token: string, baseUrl?: string): string {
  const origin =
    baseUrl ?? process.env.PUBLIC_APP_URL ?? process.env.VITE_APP_URL ?? "http://localhost:5173";
  return `${origin.replace(/\/$/, "")}/api/documents/download?token=${encodeURIComponent(token)}`;
}
