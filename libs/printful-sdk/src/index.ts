import printfulClient from "./printfulClient";

async function main() {
  let client = new printfulClient("api");

  let products = await client.getProducts();
  console.log(products);
}

main();
