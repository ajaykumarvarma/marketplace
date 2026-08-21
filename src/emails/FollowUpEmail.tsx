import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Link,
} from "@react-email/components";

interface FollowUpEmailProps {
  buyerName: string;
  orderId: string;
  productTitle: string;
  reviewUrl: string;
}

export function FollowUpEmail({ buyerName, orderId, productTitle, reviewUrl }: FollowUpEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>How was your {productTitle}? Leave a review on TradeVault</Preview>
      <Body style={{ backgroundColor: "#0B0F14", color: "#E8ECF1", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <Heading as="h1" style={{ color: "#5B8EC8", fontSize: "24px", margin: "0" }}>
              TradeVault
            </Heading>
          </Section>

          <Section style={{ backgroundColor: "#111820", border: "1px solid #232D3B", borderRadius: "8px", padding: "24px" }}>
            <Heading as="h2" style={{ color: "#E8ECF1", fontSize: "20px", margin: "0 0 16px" }}>
              How was your order?
            </Heading>

            <Text style={{ color: "#A0AEC0", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
              Hi {buyerName},
            </Text>

            <Text style={{ color: "#A0AEC0", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
              It has been 3 days since your order <strong style={{ color: "#E8ECF1" }}>#{orderId}</strong> for <strong style={{ color: "#E8ECF1" }}>{productTitle}</strong> was delivered.
            </Text>

            <Text style={{ color: "#A0AEC0", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px" }}>
              We would love to hear about your experience. Your feedback helps other buyers make informed decisions and helps sellers improve their service.
            </Text>

            <Button
              href={reviewUrl}
              style={{
                backgroundColor: "#5B8EC8",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-block",
              }}
            >
              Leave a Review
            </Button>
          </Section>

          <Section style={{ marginTop: "24px", textAlign: "center" }}>
            <Text style={{ color: "#4A5568", fontSize: "12px", margin: "0" }}>
              TradeVault — Secure Digital Goods Marketplace
            </Text>
            <Text style={{ color: "#4A5568", fontSize: "12px", margin: "4px 0 0" }}>
              <Link href="https://tradevault.io" style={{ color: "#5B8EC8", textDecoration: "none" }}>
                tradevault.io
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default FollowUpEmail;