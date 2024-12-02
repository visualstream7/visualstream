export type ProductResponseType = {
  id: number;
  type: string;
  description: string;
  type_name: string;
  title: string;
  variants: {
    id: number;
    price: string;
    product_id: number;
    size: string;
    color_code: string;
    image: string;
    availability_status: { region: string; status: string }[];
  }[];
};

export type ProductType = Omit<ProductResponseType, "variants">;
export type VariantType = ProductResponseType["variants"][0];
