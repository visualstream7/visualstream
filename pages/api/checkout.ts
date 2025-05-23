import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { SupabaseWrapper } from "@/database/supabase";
import { Printful } from "@/libs/printful-client/printful-sdk";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { cartItems, returnUrl, userId, shippingAmount, recipient, taxRate } =
      req.body;

    console.log("cartItems", cartItems);

    // Map cart items to the Stripe line_items format
    const line_items = cartItems.map((item: any) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    let totalWithoutShipping = cartItems.reduce((acc: number, item: any) => {
      return acc + item.price * item.quantity;
    }, 0);

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

    const taxAmount = Math.round(taxRate * 100);

    if (taxAmount > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(taxAmount * totalWithoutShipping),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      payment_intent_data: {},
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}`,
    });

    let database = new SupabaseWrapper("SERVER", req, res);

    // Save the session id to the database
    await database.saveMetadata(session.id, {
      cartItems: cartItems,
      shippingAmount: shippingAmount,
      taxAmount: Math.round(taxAmount * totalWithoutShipping) / 100,
      userId: userId,
      recipient,
    });

    res.status(200).json({ id: session.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
