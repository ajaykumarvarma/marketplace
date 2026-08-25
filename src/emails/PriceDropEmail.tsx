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
} from "@react-email/components";

interface PriceDropEmailProps {
  buyerName: string;
  productTitle: string;
  currentPrice: string;
  targetPrice: string;
  productUrl: string;
}

export function PriceDropEmail({
  buyerName,
  productTitle,
  currentPrice,
  targetPrice,
  productUrl,
}: PriceDropEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Price drop alert for {productTitle}</Preview>
      <Body style={{ backgroundColor: "#0B0F14", color: "#E8ECF1", fontFamily: "IBM Plex Sans, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Section>
            <Heading style={{ color: "#5B8EC8", fontSize: "24px", marginBottom: "16px" }}>
              Price Drop Alert
            </Heading>
            <Text>Hi {buyerName},</Text>
            <Text>
              Good news! The price for <strong>{productTitle}</strong> has dropped to{" "}
              <strong>{currentPrice}</strong>, which is at or below your target price of {targetPrice}.
            </Text>
            <Button
              href={productUrl}
              style={{
                backgroundColor: "#5B8EC8",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
                marginTop: "16px",
              }}
            >
              View Product
            </Button>
            <Text style={{ color: "#888888", fontSize: "12px", marginTop: "24px" }}>
              You received this email because you set a price alert on TradeVault.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PriceDropEmail;