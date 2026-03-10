/** @jsxImportSource react */

import { Body, Container, Head, Html, Preview, Text, Link, Section } from "@react-email/components";

interface Deal {
    id: string;
    slug: string;
    title: string;
    discountLabel: string;
    shortDescription: string;
    brandName: string;
}

interface WeeklyDigestEmailProps {
    deals: Deal[];
    introText?: string;
    unsubscribeUrl: string;
}

export function WeeklyDigestEmail({
    deals,
    introText,
    unsubscribeUrl,
}: WeeklyDigestEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your UniPerks Student Deals for this Week</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Text style={titleStyle}>UniPerks Weekly Deals</Text>

                    {introText && (
                        <Text style={paragraphStyle}>
                            {introText}
                        </Text>
                    )}

                    <Section style={dealsSectionStyle}>
                        {deals.map(deal => (
                            <div key={deal.id} style={dealCardStyle}>
                                <Text style={brandNameStyle}>{deal.brandName}</Text>
                                <Text style={dealTitleStyle}>{deal.title} - <strong style={{ color: "#16a34a" }}>{deal.discountLabel}</strong></Text>
                                <Text style={dealDescriptionStyle}>{deal.shortDescription}</Text>
                            </div>
                        ))}
                    </Section>

                    <Text style={footerStyle}>
                        You are receiving this email because you subscribed to UniPerks.{" "}
                        <Link href={unsubscribeUrl} style={linkStyle}>Unsubscribe</Link>
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
    maxWidth: "600px",
    padding: "24px",
};

const titleStyle = {
    color: "#111827",
    fontSize: "24px",
    fontWeight: "800",
    margin: "0 0 20px",
    textAlign: "center" as const,
};

const paragraphStyle = {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 24px",
};

const dealsSectionStyle = {
    margin: "24px 0",
};

const dealCardStyle = {
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "16px",
    marginBottom: "16px",
};

const brandNameStyle = {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    margin: "0 0 4px",
};

const dealTitleStyle = {
    color: "#111827",
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 8px",
};

const dealDescriptionStyle = {
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0",
};

const footerStyle = {
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "32px 0 0",
    textAlign: "center" as const,
};

const linkStyle = {
    color: "#9ca3af",
    textDecoration: "underline",
};
