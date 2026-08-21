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

interface SellerNotificationProps {
  sellerName: string;
  orderId: string;
  productTitle: string;
  amount: string;
  dashboardUrl: string;
}

export function SellerNotification({
  sellerName = "there",
  orderId = "00000000",
  productTitle = "your product",
  amount = "$0.00",
  dashboardUrl = "https://tradevault.io/seller/dashboard",
}: SellerNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New order on TradeVault</Preview>
      <Body style={{ backgroundColor: "#0B0F14", color: "#E8ECF1", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <Heading style={{ color: "#3DD6D0", fontSize: "24px", margin: "0" }}>TradeVault</Heading>
          </Section>

          <Section style={{ backgroundColor: "#111820", padding: "24px", borderRadius: "8px", border: "1px solid #232D3B" }}>
            <Heading style={{ color: "#3DD6D0", fontSize: "20px", margin: "0 0 16px" }}>New Order Received</Heading>
            <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
              Hi {sellerName},
            </Text>
            <Text style={{ fontSize: "16px", lineHeight: "1.5", margin: "0 0 16px" }}>
              You have a new order for <strong>{productTitle}</strong>.
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
              Please deliver the order as soon as possible.
            </Text>

            <Link
              href={dashboardUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#3DD6D0",
                color: "#0B0F14",
                padding: "12px 24px",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Go to Dashboard
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

export default SellerNotification;