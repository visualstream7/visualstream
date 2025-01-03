import { SupabaseWrapper } from "@/database/supabase";
import { Ban } from "lucide-react";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

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
        user_id: metadata.userId,
        cart_items: JSON.parse(metadata.cartItems),
        shipping_amount: metadata.shippingAmount,
        tax_amount: metadata.taxAmount,
        total_amount: paymentIntent.amount_received / 100,
      };
      console.log("metadata", metadata);

      const database = new SupabaseWrapper("SERVER", req, res);
      const { result, error } = await database.addOrderToDatabase(orderDetails);

      if (error) {
        break;
      }

      console.log("Order details", orderDetails);
      console.log("Order added to database", result, error);

      const sentFrom = new Sender(
        "MS_axmL5i@trial-pq3enl6oprml2vwr.mlsender.net",
        "VisualStream",
      );
      const recipients = [
        new Recipient(customerDetails.email || "", "Recipient"),
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Your Order Confirmation - VisualStream").setHtml(`
          <html>
            <body>
              <h1>Thank you for your purchase!</h1>
              <p>Hi ${customerDetails.name || "Customer"},</p>
              <p>We are excited to confirm your order. Here are the details:</p>
              <table style="border-collapse: collapse; width: 100%;">
                <thead>
                  <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderDetails.cart_items
                    .map(
                      (item: {
                        name: string;
                        quantity: number;
                        price: number;
                      }) => `
                        <tr>
                          <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">$${item.price.toFixed(2)}</td>
                        </tr>
                      `,
                    )
                    .join("")}
                </tbody>
              </table>
              <p><strong>Shipping Address:</strong> ${customerDetails?.address?.line1}, ${customerDetails?.address?.city}, ${customerDetails?.address?.country}</p>
              <p><strong>Shipping Amount:</strong> $${orderDetails.shipping_amount}</p>
              <p><strong>Tax:</strong> $${orderDetails.tax_amount}</p>
              <p><strong>Total Amount Paid:</strong> $${orderDetails.total_amount}</p>
              <p>We will notify you once your order is on its way!</p>
              <p>Thank you for choosing VisualStream.</p>
              <p>Best regards,<br/>The VisualStream Team</p>
            </body>
          </html>
        `).setText(`
          Thank you for your purchase!const emailParams = new EmailParams()
                  .setFrom(sentFrom)
                  .setTo(recipients)
                  .setSubject("Subject")
                  .setHtml(
                    "Greetings from the team, you got this message through MailerSend.",
                  )
                  .setText(
                    "Greetings from the team, you got this message through MailerSend.",
                  );

          Hi ${customerDetails.name || "Customer"},

          We are excited to confirm your order. Here are the details:

          Shipping Address: ${customerDetails?.address?.line1}, ${customerDetails?.address?.city}, ${customerDetails?.address?.country}
          Shipping Amount: $${orderDetails.shipping_amount}
          Tax: $${orderDetails.tax_amount}
          Total Amount Paid: $${orderDetails.total_amount}

          We will notify you once your order is on its way!

          Thank you for choosing VisualStream.

          Best regards,
          The VisualStream Team
        `);

      const mailData = await mailersend.email.send(emailParams);
      console.log(mailData.body, mailData.statusCode, mailData.headers);

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
