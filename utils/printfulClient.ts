import PrintfulClient from "@/printful-sdk/src/printfulClient";

let printfulClient = new PrintfulClient(
  process.env.NEXT_PUBLIC_PRINTFUL_TOKEN as string,
);

export default printfulClient;
