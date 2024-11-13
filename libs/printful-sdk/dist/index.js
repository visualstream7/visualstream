"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const printfulClient_1 = __importDefault(require("../src/printfulClient"));
async function main() {
    let client = new printfulClient_1.default("api");
    let products = await client.getProducts();
    console.log(products);
}
main();
