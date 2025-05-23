import { NextApiRequest, NextApiResponse } from "next";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailersend = new MailerSend({
  apiKey:
    "mlsn.f66a77a55d229b34ae3afd0bb45e0152d33e7729969ed0cee155e36e713c9e22",
  // "mlsn.8030be6531b6af03ab34eb0b36ef20c2799ed39e445dedba5c8f001ef55b7d1d",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const sentFrom = new Sender("MS_d4vwjL@visualstream.ai", "visualstream");
    const recipients = [
      new Recipient("visualstream709@gmail.com", "Support Team"),
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`New Contact Message from ${name}`).setHtml(`
        <h1>Contact Message</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `).setText(`
        Contact Message:
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `);

    await mailersend.email.send(emailParams);

    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("MailerSend Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
