import printfulClient from "@/utils/printfulClient";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={async () => {
          const products = await printfulClient.getProductsFromIds([71]);
          console.log(products);
        }}
      >
        Get Products
      </button>
    </div>
  );
}
