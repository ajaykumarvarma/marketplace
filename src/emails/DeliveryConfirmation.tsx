import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Heading,
  Hr,
} from "@react-email/components";

interface DeliveryConfirmationProps {
  buyerName: string;
  orderId: string;
  productTitle: string;
  orderUrl: string;
}

export function DeliveryConfirmation({
  buyerName = "there",
  orderId = "00000000",
  productTitle = "your order",
  orderUrl = "https://tradevault.io/orders",
}: DeliveryConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your TradeVault order has been delivered</Preview>
      <Body style={{ backgroundColor: "#0B0F14", color: "#E8ECF1", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <Heading style={{ color: "#4ADE80", fontSize: "24px", margin: "0" }}>TradeVault</Heading>
          </Section>

          <Section style={{ backgroundColor: "#111820", padding: "24px", borderRadius: "8px", border: "1px solid #232D3B" }}>
            <Heading style={{ color: "#4ADE80", fontSize: "20px", margin: "0 0 16px" }}>Order Delivered</Heading>
            <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
              Hi {buyerName},
            </Text>
            <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
              Your order <strong>{productTitle}</strong> has been delivered.
            </Text>

            <Section style={{ backgroundColor: "#0B0F14", padding: "16px", borderRadius: "6px", margin: "16px 0" }}>
              <Text style={{ fontSize: "14px", fontFamily: "monospace", margin: "4px 0" }}>
                Order #{orderId}
              </Text>
            </Section>

            <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
              Please confirm delivery and leave a review for the seller.
            </Text>

            <Link
              href={orderUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#4ADE80",
                color: "#0B0F14",
                padding: "12px 24px",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Confirm Delivery
            </Link>
          </Section>

          <Hr style={{ borderColor: "#232D3B", margin: "24px 0" }} />

          <Text style={{ fontSize: "12px", color: "#8B95A5", textAlign: "center" }}>
            TradeVault — Secure Digital Goods Marketplace
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DeliveryConfirmation;