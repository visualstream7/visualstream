// Load environment variables from .env file
import * as dotenv from "dotenv";
dotenv.config();
import printfulClient from "./printfulClient";

async function main() {
  let token = process.env.NEXT_PUBLIC_PRINTFUL_TOKEN as string;
  if (!token) {
    throw new Error("Missing Printful Token");
  }
  let client = new printfulClient(token);
  let products = await client.getProductsFromIds([71]);
  console.log(products);
}

main();
