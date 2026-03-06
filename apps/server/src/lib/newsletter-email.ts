interface EmailSendOptions {
    apiKey?: string;
    fromEmail?: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmailWithResend(options: EmailSendOptions) {
    if (!options.apiKey || !options.fromEmail) {
        return { skipped: true };
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: options.fromEmail,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        }),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Resend API error: ${response.status} ${details}`);
    }

    return await response.json() as { id: string };
}

export function renderVerificationEmail(email: string, verificationUrl: string, unsubscribeUrl: string) {
    const subject = "Confirm your UniPerks newsletter subscription";
    const html = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 24px; margin-bottom: 12px;">Confirm your subscription</h1>
            <p style="font-size: 14px; line-height: 1.5;">
                You requested newsletter updates for <strong>${email}</strong>. Confirm to start receiving verified student deals.
            </p>
            <p style="margin: 24px 0;">
                <a href="${verificationUrl}" style="background:#111827;color:#ffffff;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:600;">
                    Confirm subscription
                </a>
            </p>
            <p style="font-size:12px;color:#6b7280;line-height:1.5;">
                If this wasn’t you, ignore this email.\n
                <a href="${unsubscribeUrl}" style="color:#6b7280;">Unsubscribe</a>
            </p>
        </div>
    `;
    const text = `Confirm your UniPerks subscription for ${email}: ${verificationUrl}\nUnsubscribe: ${unsubscribeUrl}`;

    return { subject, html, text };
}

export function renderNewsletterEmail(args: {
    subject: string;
    title?: string;
    body: string;
    unsubscribeUrl: string;
}) {
    const title = args.title || args.subject;
    const bodyHtml = args.body
        .split("\n")
        .map((line) => `<p style="margin:0 0 12px 0;line-height:1.6;">${line}</p>`)
        .join("");

    const html = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 28px; margin-bottom: 16px;">${title}</h1>
            ${bodyHtml}
            <hr style="margin: 24px 0; border: 0; border-top: 1px solid #e5e7eb;" />
            <p style="font-size:12px;color:#6b7280;line-height:1.5;">
                You received this because you subscribed to UniPerks updates.\n
                <a href="${args.unsubscribeUrl}" style="color:#6b7280;">Unsubscribe</a>
            </p>
        </div>
    `;

    return {
        html,
        text: `${title}\n\n${args.body}\n\nUnsubscribe: ${args.unsubscribeUrl}`,
    };
}
