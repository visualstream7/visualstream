import { SupabaseWrapper } from "@/database/supabase";
import { Ban } from "lucide-react";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { Printful } from "@/libs/printful-client/printful-sdk";

const mailersend = new MailerSend({
  apiKey:
    "mlsn.8030be6531b6af03ab34eb0b36ef20c2799ed39e445dedba5c8f001ef55b7d1d",
});

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

  console.log("event.type", event.type);
  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      let payment_status = session.payment_status;
      let customerDetails = session.customer_details;

      if (payment_status !== "paid" || !customerDetails) {
        break;
      }

      const database = new SupabaseWrapper("SERVER", req, res);

      let paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
      );

      let { result: metadataResult, error: metadataError } =
        await database.getMetadata(session.id);

      let metadata = metadataResult.metadata;
      let recipient = metadata?.recipient;

      if (metadataError || !metadata || !metadata.recipient) {
        break;
      }

      let orderDetails = {
        status: "paid",
        email: customerDetails.email,
        address: recipient.address1,
        user_id: metadata.userId,
        cart_items: metadata.cartItems,
        shipping_amount: metadata.shippingAmount,
        tax_amount: metadata.taxAmount,
        total_amount: paymentIntent.amount_received / 100,
      };

      const { result, error: orderAddError } =
        await database.addOrderToDatabase(orderDetails);

      if (orderAddError) {
        console.error("Error adding order to database:", orderAddError);
        break;
      }

      const { error: cartClearError } = await database.clearCart(
        metadata.userId,
      );

      if (cartClearError) {
        console.error("Error clearing cart:", cartClearError);
      }

      const printful = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);

      if (!metadata.cartItems?.length) {
        console.error("Missing customer details or cart items");
        break;
      }

      const orderPayload = {
        recipient: recipient,
        items: metadata.cartItems.map((item: any) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          image: item.original_image,
          product_id: item.product_id,
        })),
      };

      const { result: createOrderResult, error: createOrderError } =
        await printful.makeOrder(orderPayload);

      if (createOrderError) {
        console.error("Error creating order with Printful:", createOrderError);
        break;
      }

      console.log("Order created with Printful:", createOrderResult);

      const sentFrom = new Sender("MS_d4vwjL@visualstream.ai", "visualstream");
      const recipients = [
        new Recipient(customerDetails.email || "", "Recipient"),
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Your Order Confirmation - VisualStream").setHtml(`
    <html>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- Gradient Header -->
      <div style="background: linear-gradient(135deg, #2a4365 0%, #4299e1 100%); padding: 40px 20px; text-align: center; margin: -20px -20px 30px -20px; border-radius: 0 0 8px 8px;">
        <h1 style="color: white; font-size: 28px; margin: 0; letter-spacing: 0.5px;">Thank You For Your Purchase!</h1>
      </div>

      <p style="margin-bottom: 16px;">Hi ${recipient.name || "Customer"},</p>
      <p style="margin-bottom: 24px;">We are excited to confirm your order. Here are the details:</p>

      <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead>
          <tr>
            <th style="background-color: #2a4365; color: white; padding: 12px; text-align: left;">Item</th>
            <th style="background-color: #2a4365; color: white; padding: 12px; text-align: left;">Quantity</th>
            <th style="background-color: #2a4365; color: white; padding: 12px; text-align: left;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetails.cart_items
            .map(
              (item: { name: string; quantity: number; price: number }) => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">$${item.price.toFixed(2)}</td>
              </tr>
            `,
            )
            .join("")}
        </tbody>
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #2a4365; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Shipping Address:</strong><br>
        ${recipient?.address1}, ${recipient.country_code}, ${recipient?.city}</p>

        <p style="margin: 8px 0;"><strong>Shipping Amount:</strong> $${orderDetails.shipping_amount}</p>
        <p style="margin: 8px 0;"><strong>Tax:</strong> $${orderDetails.tax_amount}</p>
        <p style="margin: 8px 0;"><strong>Total Amount Paid:</strong> $${orderDetails.total_amount}</p>
      </div>

      <p style="margin-bottom: 16px;">We will notify you once your order is on its way!</p>
      <p style="margin-bottom: 24px;">Thank you for choosing VisualStream.</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
        <p style="margin: 0;">Best regards,<br>The VisualStream Team</p>
      </div>
    </body>
    </html>
  `).setText(`
    Thank you for your purchase!

    Hi ${recipient.name || "Customer"},

    We are excited to confirm your order. Here are the details:

    Order Items:
    ${orderDetails.cart_items
      .map(
        (item: { name: string; quantity: number; price: number }) => `
    - ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`,
      )
      .join("")}

    Shipping Address: ${recipient?.address1}, ${recipient.country_code}, ${recipient?.city}
    Shipping Amount: $${orderDetails.shipping_amount}
    Tax: $${orderDetails.tax_amount}
    Total Amount Paid: $${orderDetails.total_amount}

    We will notify you once your order is on its way!

    Thank you for choosing VisualStream.

    Best regards,
    The VisualStream Team
  `);

      const mailData = await mailersend.email.send(emailParams);

      await database.updateCartItems(metadata.userId, []);

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
