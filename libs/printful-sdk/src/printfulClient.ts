class PrintfulClient {
  // states
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // methods
  getProductsFromIds = async (product_ids: number[]) => {
    let queries = product_ids.map((product_id) => {
      return fetch(`https://api.printful.com/products/${product_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
    });

    const responses = await Promise.all(queries);
    console.log(responses);
    const data = await Promise.all(
      responses.map((response) => response.json()),
    );

    //
    let filteredData: {
      id: number;
      type: string;
      description: string;
      type_name: string;
      title: string;
    }[] = data.map(
      (apiResponse: {
        result: {
          product: {
            id: number;
            type: string;
            description: string;
            type_name: string;
            title: string;
          };
        };
      }) => ({
        id: apiResponse.result.product.id,
        type: apiResponse.result.product.type,
        description: apiResponse.result.product.description,
        type_name: apiResponse.result.product.type_name,
        title: apiResponse.result.product.title,
      }),
    );
    return filteredData;
  };
}

export default PrintfulClient;
