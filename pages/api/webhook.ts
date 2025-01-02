import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const sig = req.headers["stripe-signature"] as string | undefined;

  if (!sig) {
    return res.status(400).json({ error: "No stripe-signature header found" });
  }

  let event: Stripe.Event;

  try {
    const body = await buffer(req);
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // console.log("PaymentIntent was successful!", event.data);
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed!", session);
      let payment_status = session.payment_status;
      let customerDetails = session.customer_details;

      if (payment_status !== "paid" || !customerDetails) {
        break;
      }

      let paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
      );
      let metadata = paymentIntent.metadata;

      let orderDetails = {
        status: "paid",
        email: customerDetails.email,
        address: customerDetails.address,
        userID: metadata.userID,
        cartItems: metadata.cartItems,
        shippingAmount: metadata.shippingAmount,
        taxAmount: metadata.taxAmount,
        totalAmount: paymentIntent.amount_received / 100,
      };
      console.log("metadata", metadata);

      break;
    }

    // ... handle other event types
    default: {
      break;
    }
  }

  res.status(200).json({ received: true });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const buffer = (req: NextApiRequest) => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
};

export default handler;
