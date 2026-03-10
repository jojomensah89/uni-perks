/** @jsxImportSource react */

import { Body, Button, Container, Head, Html, Preview, Text } from "@react-email/components";

interface VerifySubscriptionEmailProps {
    verificationUrl: string;
    unsubscribeUrl: string;
    recipientEmail: string;
}

export function VerifySubscriptionEmail({
    verificationUrl,
    unsubscribeUrl,
    recipientEmail,
}: VerifySubscriptionEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Confirm your UniPerks newsletter subscription</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Text style={titleStyle}>Confirm your subscription</Text>
                    <Text style={paragraphStyle}>
                        You requested newsletter updates for <strong>{recipientEmail}</strong>.
                    </Text>
                    <Text style={paragraphStyle}>
                        Confirm your email to receive weekly student perks. You can unsubscribe anytime.
                    </Text>
                    <Button href={verificationUrl} style={buttonStyle}>
                        Confirm subscription
                    </Button>
                    <Text style={footerStyle}>
                        If this wasn&apos;t you, ignore this email.{" "}
                        <a href={unsubscribeUrl} style={linkStyle}>Unsubscribe</a>
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const bodyStyle = {
    backgroundColor: "#f6f9fc",
    fontFamily: "Inter, Arial, sans-serif",
    padding: "24px 0",
};

const containerStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "24px",
};

const titleStyle = {
    color: "#111827",
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 12px",
};

const paragraphStyle = {
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 12px",
};

const buttonStyle = {
    backgroundColor: "#16a34a",
    borderRadius: "9999px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    margin: "16px 0",
    padding: "12px 20px",
    textDecoration: "none",
};

const footerStyle = {
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "16px 0 0",
};

const linkStyle = {
    color: "#6b7280",
};
