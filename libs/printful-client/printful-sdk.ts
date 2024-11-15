class Printful {
  apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Missing Printful Token");
    }
    this.apiKey = apiKey;
  }

  getProductsFromIds = async (product_ids: number[]) => {
    console.log("product_ids", product_ids);
    const query = fetch("/api/get-products-from-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: this.apiKey,
        product_ids: product_ids,
      }),
    });

    const response = await query;
    const data = (await response.json()) as {
      result: any[] | null;
      error: string | null;
    };

    return {
      result: data.result,
      error: data.error,
    };
  };
}

export { Printful };
