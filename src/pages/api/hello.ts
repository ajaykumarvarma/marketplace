// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>,
) {
  res.status(200).json({
    status: "ok",
    service: "tradevault-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
