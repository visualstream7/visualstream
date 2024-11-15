export default async function handler(
  req: { method: string; body: { image_url: string } },
  res: any,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  const { image_url } = req.body;

  if (!image_url) {
    return res
      .status(200)
      .json({ result: null, error: "Image URL is required" });
  }

  return res.status(200).json({ result: image_url, error: null });
}
