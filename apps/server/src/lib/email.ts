import { render } from "@react-email/render";
import { Resend } from "resend";
import type { ReactElement } from "react";

interface SendEmailOptions {
    apiKey?: string;
    fromEmail?: string;
    to: string | string[];
    subject: string;
    react: ReactElement;
}

export async function sendEmail(options: SendEmailOptions) {
    if (!options.apiKey) {
        return { skipped: true as const };
    }

    const resend = new Resend(options.apiKey);
    const html = await render(options.react);
    const text = await render(options.react, { plainText: true });

    const { data, error } = await resend.emails.send({
        from: options.fromEmail ?? "UniPerks <deals@uni-perks.com>",
        to: options.to,
        subject: options.subject,
        html,
        text,
    });

    if (error) {
        throw new Error(error.message || "Failed to send email");
    }

    return { id: data?.id ?? null };
}
