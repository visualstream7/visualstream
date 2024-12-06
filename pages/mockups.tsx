import { Printful } from "@/libs/printful-client/printful-sdk";
import { ProductResponseType } from "@/libs/printful-client/types";
import { useEffect, useState } from "react";

export default function Mockups() {
  const [products, setProducts] = useState<ProductResponseType[] | null>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponseType | null>(null);
  const [mockups, setMockups] = useState<string[]>([]);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mockupProgress, setMockupProgress] = useState({
    total: 0,
    completed: 0,
  });

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);
      const { result, error } = await client.getProductsFromIds([
        71, 206, 380, 358, 1, 3, 588, 534, 181, 394, 19, 382, 474, 279, 84,
      ]);
      if (result) setProducts(result);
      if (error) console.error(error);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  function filterUniqueVariantsByColor(
    variants: ProductResponseType["variants"],
  ) {
    const uniqueColors = new Set();
    return variants.filter((variant) => {
      if (!uniqueColors.has(variant.color_code)) {
        uniqueColors.add(variant.color_code);
        return true;
      }
      return false;
    });
  }

  async function selectProduct(product: ProductResponseType) {
    setSelectedProduct(product);
    setMockups([]);
    const filteredVariants = filterUniqueVariantsByColor(product.variants);
    setMockupProgress({ total: filteredVariants.length, completed: 0 });

    for (const variant of filteredVariants) {
      const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);
      try {
        const mockupImage = await client.getMockupImage(
          variant.image,
          overlayImage!,
          product.id,
        );
        setMockups((prev) => [...prev, mockupImage]);
        setMockupProgress((prev) => ({
          ...prev,
          completed: prev.completed + 1,
        }));
      } catch (error) {
        console.error("Error generating mockup:", error);
      }
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Mockup Generator</h1>

      {/* Input for Overlay Image */}
      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">
          Overlay Image URL
        </label>
        <input
          type="text"
          placeholder="Enter overlay image URL"
          value={overlayImage || ""}
          onChange={(e) => setOverlayImage(e.target.value)}
          className="w-full border rounded px-4 py-2"
        />
      </div>

      {/* Loading state for fetching products */}
      {loading && (
        <div className="text-center my-4">
          <p className="text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Product Selection Dropdown */}
      {products && !loading && overlayImage && (
        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">
            Select a Product
          </label>
          <select
            className="w-full border rounded px-4 py-2"
            onChange={(e) => {
              const selectedId = parseInt(e.target.value, 10);
              const product = products.find((p) => p.id === selectedId);
              if (product) selectProduct(product);
            }}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mockup Generation Progress */}
      {mockupProgress.total > 0 && (
        <div className="my-4 text-center">
          <p className="text-gray-600">
            {mockupProgress.completed} / {mockupProgress.total} mockups
            generated
            {mockupProgress.completed < mockupProgress.total && `...`}
          </p>
        </div>
      )}

      {/* Display Mockups */}
      {mockups.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Mockups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {mockups.map((image, index) => (
              <div key={index} className="border rounded overflow-hidden">
                <img
                  className="w-full h-auto"
                  src={image}
                  alt={`Mockup ${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No mockups to display */}
      {!mockups.length && selectedProduct && mockupProgress.completed === 0 && (
        <div className="text-center text-gray-500 mt-4">
          <p>No mockups generated yet. Add an overlay image and try again!</p>
        </div>
      )}
    </div>
  );
}
