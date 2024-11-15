import { Printful } from "./printful-sdk";

const printfulClient = new Printful(
  process.env.NEXT_PUBLIC_PRINTFUL_TOKEN as string,
);

export { printfulClient };
