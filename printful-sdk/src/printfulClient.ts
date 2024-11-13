class PrintfulClient {
  // states
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // methods
  getProducts = async () => {
    return [
      {
        id: 75,
      },
      {
        id: 380,
      },
    ];
  };
}

export default PrintfulClient;
