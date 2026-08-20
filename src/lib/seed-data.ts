import { supabase } from "@/integrations/supabase/client";

// Seed data for testing the marketplace platform
// Run this in browser console or a test page to populate sample data

export async function seedCategories() {
  const categories = [
    { id: "game-keys", name: "Game Keys", slug: "game-keys" },
    { id: "accounts", name: "Accounts", slug: "accounts" },
    { id: "design-assets", name: "Design Assets", slug: "design-assets" },
    { id: "software", name: "Software", slug: "software" },
    { id: "marketing", name: "Marketing", slug: "marketing" },
    { id: "courses", name: "Courses", slug: "courses" },
    { id: "premium", name: "Premium", slug: "premium" },
    { id: "services", name: "Services", slug: "services" },
  ];

  const { error } = await supabase.from("categories").upsert(categories, { onConflict: "id" });
  return { success: !error, error };
}

export function seedTestUsers() {
  // Note: These would normally be created via auth.signUp
  // This is for documenting the test user structure
  const testUsers = [
    {
      email: "buyer@tradevault.test",
      password: "TestPass123!",
      role: "buyer" as const,
      full_name: "Test Buyer",
    },
    {
      email: "seller@tradevault.test",
      password: "TestPass123!",
      role: "seller" as const,
      full_name: "Test Seller",
    },
    {
      email: "admin@tradevault.test",
      password: "TestPass123!",
      role: "admin" as const,
      full_name: "Test Admin",
    },
  ];

  console.log("Test users for manual registration:", testUsers);
  return testUsers;
}

export async function seedSampleProducts(sellerId: string) {
  const products = [
    {
      title: "Adobe Creative Suite 2024 License",
      description: "Full access to Photoshop, Illustrator, Premiere Pro, After Effects, and more. One-year license with all updates included.",
      price: 299.99,
      original_price: 599.99,
      category_id: "software",
      delivery_time: "Instant",
      stock: 50,
      status: "active",
      seller_id: sellerId,
      tags: ["adobe", "creative", "license", "design"],
      image_url: "/generated/adobe-suite.png",
    },
    {
      title: "Netflix Premium 4K Subscription",
      description: "12-month Netflix Premium subscription. 4K UHD streaming on 4 devices simultaneously. Global access.",
      price: 89.99,
      original_price: 179.99,
      category_id: "premium",
      delivery_time: "Instant",
      stock: 200,
      status: "active",
      seller_id: sellerId,
      tags: ["netflix", "streaming", "subscription", "4k"],
      image_url: "/generated/spotify-sub.png",
    },
    {
      title: "Discord Nitro Annual",
      description: "Full Discord Nitro for 12 months. Animated avatars, custom emojis, boosted upload limits, HD video streaming.",
      price: 49.99,
      original_price: 99.99,
      category_id: "premium",
      delivery_time: "Instant",
      stock: 100,
      status: "active",
      seller_id: sellerId,
      tags: ["discord", "nitro", "gaming", "subscription"],
      image_url: "/generated/discord-nitro.png",
    },
    {
      title: "Fortnite Full Access Account",
      description: "OG Fortnite account with 200+ skins, including rare battle pass items from Seasons 1-10. Email changeable.",
      price: 149.99,
      original_price: 299.99,
      category_id: "accounts",
      delivery_time: "1-2 hours",
      stock: 5,
      status: "active",
      seller_id: sellerId,
      tags: ["fortnite", "gaming", "account", "rare"],
      image_url: "/generated/fortnite-account.png",
    },
    {
      title: "Canva Pro Team License",
      description: "Canva Pro for teams up to 5 members. Brand kit, premium templates, background remover, 100GB cloud storage.",
      price: 39.99,
      original_price: 79.99,
      category_id: "design-assets",
      delivery_time: "Instant",
      stock: 75,
      status: "active",
      seller_id: sellerId,
      tags: ["canva", "design", "team", "license"],
      image_url: "/generated/canva-pro.png",
    },
    {
      title: "Steam Game Key Bundle",
      description: "Bundle of 10 premium Steam game keys. Includes AAA titles and indie gems. Keys are unused and region-free.",
      price: 29.99,
      original_price: 199.99,
      category_id: "game-keys",
      delivery_time: "Instant",
      stock: 25,
      status: "active",
      seller_id: sellerId,
      tags: ["steam", "games", "keys", "bundle"],
      image_url: "/generated/game-keys-bundle.png",
    },
  ];

  const { data, error } = await supabase.from("products").insert(products).select();
  return { success: !error, data, error };
}

export async function seedSampleOrders(buyerId: string, sellerId: string, productIds: string[]) {
  const orders = productIds.slice(0, 3).map((productId, i) => ({
    buyer_id: buyerId,
    seller_id: sellerId,
    product_id: productId,
    quantity: 1,
    total_amount: [299.99, 89.99, 49.99][i],
    delivery_method: "digital",
    payment_method: "card",
    status: ["completed", "pending", "processing"][i],
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { data, error } = await supabase.from("orders").insert(orders).select();
  return { success: !error, data, error };
}

export async function seedSampleReviews(buyerId: string, sellerId: string, productIds: string[], orderIds: string[]) {
  const reviews = [
    {
      order_id: orderIds[0],
      product_id: productIds[0],
      reviewer_id: buyerId,
      seller_id: sellerId,
      rating: 5,
      comment: "Excellent product! License activated instantly. Seller was very responsive and helpful.",
    },
    {
      order_id: orderIds[0],
      product_id: productIds[1],
      reviewer_id: buyerId,
      seller_id: sellerId,
      rating: 4,
      comment: "Great value for money. Delivery was within 10 minutes. Would recommend.",
    },
  ];

  const { error } = await supabase.from("reviews").insert(reviews);
  return { success: !error, error };
}

export async function runFullSeed() {
  console.log("🌱 Starting TradeVault seed...");

  const catResult = await seedCategories();
  console.log("Categories:", catResult.success ? "✅" : "❌", catResult.error);

  // Note: Users must be created manually via auth UI for security
  const users = seedTestUsers();

  console.log("\n📋 Next steps:");
  console.log("1. Register test users via /auth/register:");
  users.forEach((u) => console.log(`   ${u.email} / ${u.password} (${u.role})`));
  console.log("2. Get seller UUID from profiles table");
  console.log("3. Run: await seedSampleProducts(sellerId)");
  console.log("4. Run: await seedSampleOrders(buyerId, sellerId, productIds)");
  console.log("5. Run: await seedSampleReviews(buyerId, sellerId, productIds, orderIds)");

  return { categories: catResult, users };
}