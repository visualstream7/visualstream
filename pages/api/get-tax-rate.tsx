import { Printful } from "@/libs/printful-client/printful-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ result: null, error: "Method not allowed" });
    }

    const { recipient } = req.body;

    if (!recipient) {
        return res
            .status(400)
            .json({ result: null, error: "Missing recipient details" });
    }

    const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);

    let { result, error } = await client.calculateTax({
        country_code: recipient.country_code,
        state_code: recipient.state_code,
        city: recipient.city,
        zip: recipient.zip,
    });

    if (error) {
        return res.status(500).json({ result: null, error });
    }

    res.status(200).json({ result, error: null });
}
