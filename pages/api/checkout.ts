import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { cartItems, returnUrl, taxAmount, shippingAmount } = req.body;

    // Map cart items to the Stripe line_items format
    const line_items = cartItems.map((item: any) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100), // TODO: Price should be retrieved from db
        },
        quantity: item.quantity,
      };
    });

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Shipping",
        },
        unit_amount: Math.round(shippingAmount * 100),
      },
      quantity: 1,
    });

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax",
        },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "BD"],
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}`,
    });

    res.status(200).json({ id: session.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
