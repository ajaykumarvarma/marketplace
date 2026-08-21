import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reviewId, userId, voteType } = req.body;

    if (!reviewId || !userId || !voteType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (voteType !== "up" && voteType !== "down") {
      return res.status(400).json({ error: "Invalid vote type" });
    }

    if (req.method === "DELETE") {
      // Remove existing vote
      const { data: existing } = await supabaseAdmin
        .from("review_votes")
        .select("vote_type")
        .eq("review_id", reviewId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        // Decrement the appropriate counter
        const decrementField = existing.vote_type === "up" ? "helpful_count" : "unhelpful_count";
        await supabaseAdmin.rpc("decrement_review_counter", {
          review_id: reviewId,
          counter_field: decrementField,
        });

        await supabaseAdmin
          .from("review_votes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", userId);
      }

      return res.status(200).json({ removed: true });
    }

    // Check for existing vote
    const { data: existing } = await supabaseAdmin
      .from("review_votes")
      .select("vote_type")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      if (existing.vote_type === voteType) {
        return res.status(200).json({ message: "Already voted" });
      }

      // Switch vote: decrement old, increment new
      const oldField = existing.vote_type === "up" ? "helpful_count" : "unhelpful_count";
      const newField = voteType === "up" ? "helpful_count" : "unhelpful_count";

      await supabaseAdmin.rpc("decrement_review_counter", {
        review_id: reviewId,
        counter_field: oldField,
      });
      await supabaseAdmin.rpc("increment_review_counter", {
        review_id: reviewId,
        counter_field: newField,
      });

      await supabaseAdmin
        .from("review_votes")
        .update({ vote_type: voteType })
        .eq("review_id", reviewId)
        .eq("user_id", userId);
    } else {
      // New vote
      const counterField = voteType === "up" ? "helpful_count" : "unhelpful_count";
      await supabaseAdmin.rpc("increment_review_counter", {
        review_id: reviewId,
        counter_field: counterField,
      });

      await supabaseAdmin.from("review_votes").insert({
        review_id: reviewId,
        user_id: userId,
        vote_type: voteType,
      });
    }

    // Return updated counts
    const { data: review } = await supabaseAdmin
      .from("reviews")
      .select("helpful_count, unhelpful_count")
      .eq("id", reviewId)
      .single();

    return res.status(200).json({
      helpful_count: review?.helpful_count || 0,
      unhelpful_count: review?.unhelpful_count || 0,
      user_vote: voteType,
    });
  } catch (err) {
    console.error("Review vote error:", err);
    return res.status(500).json({ error: "Failed to process vote" });
  }
}