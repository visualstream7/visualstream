"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PrintfulClient {
    constructor(apiKey) {
        // methods
        this.getProducts = async () => {
            return [
                {
                    id: 71,
                },
                {
                    id: 380,
                },
            ];
        };
        this.apiKey = apiKey;
    }
}
exports.default = PrintfulClient;
