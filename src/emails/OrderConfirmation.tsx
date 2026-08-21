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
  Row,
  Column,
} from "@react-email/components";

interface OrderConfirmationProps {
  buyerName: string;
  orderId: string;
  productTitle: string;
  amount: string;
  orderUrl: string;
}

export function OrderConfirmation({
  buyerName = "there",
  orderId = "00000000",
  productTitle = "your order",
  amount = "$0.00",
  orderUrl = "https://tradevault.io/orders",
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your TradeVault order has been confirmed</Preview>
      <Body style={{ backgroundColor: "#0B0F14", color: "#E8ECF1", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <Heading style={{ color: "#5B8EC8", fontSize: "24px", margin: "0" }}>TradeVault</Heading>
          </Section>

          <Section style={{ backgroundColor: "#111820", padding: "24px", borderRadius: "8px", border: "1px solid #232D3B" }}>
            <Heading style={{ color: "#5B8EC8", fontSize: "20px", margin: "0 0 16px" }}>Payment Confirmed</Heading>
            <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
              Hi {buyerName},
            </Text>
            <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
              Your payment for <strong>{productTitle}</strong> has been received and is now in escrow.
            </Text>

            <Section style={{ backgroundColor: "#0B0F14", padding: "16px", borderRadius: "6px", margin: "16px 0" }}>
              <Row>
                <Column style={{ width: "50%" }}>
                  <Text style={{ fontSize: "14px", color: "#8B95A5", margin: "4px 0" }}>Order</Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={{ fontSize: "14px", fontFamily: "monospace", margin: "4px 0" }}>#{orderId}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={{ width: "50%" }}>
                  <Text style={{ fontSize: "14px", color: "#8B95A5", margin: "4px 0" }}>Amount</Text>
                </Column>
                <Column style={{ width: "50%" }}>
                  <Text style={{ fontSize: "14px", fontFamily: "monospace", margin: "4px 0" }}>{amount}</Text>
                </Column>
              </Row>
            </Section>

            <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
              The seller has been notified and will deliver your order shortly.
            </Text>

            <Link
              href={orderUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#5B8EC8",
                color: "#ffffff",
                padding: "12px 24px",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              View Order
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

export default OrderConfirmation;