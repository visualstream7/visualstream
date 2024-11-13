import PrintfulClient from "@/libs/printful-sdk/src/printfulClient";

const printfulClient = new PrintfulClient(
  process.env.NEXT_PUBLIC_PRINTFUL_TOKEN as string,
);

export default printfulClient;
