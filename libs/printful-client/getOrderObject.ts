import { Pi } from "lucide-react";

const PRODUCTS = {
  PAPER_POSTER: 1,
  CANVAS: 3,
  MUG: 19, // done
  T_SHIRT: 71, // done
  TOTE_BAG: 84, // done
  PHONE_CASE: 181, // done
  HAT: 206,
  BAGPACK: 279,
  STICKERS: 358,
  HOODIE: 380, // done
  WATER_BOTTLE: 382, // done
  LAPTOP_SLEEVE: 394, // done
  SPIRAL_NOTEBOOK: 474, // done
  JIGSAW_PUZZLE: 534, // done
  METAL_PRINT: 588,
};

function getOrderObject(item: any, dimensions: any) {
  const aspectRatio = dimensions.width / dimensions.height;
  let area_width = 0;
  let area_height = 0;
  let image_width = 0;
  let image_height = 0;
  let height_left = 0;
  let top = 0;

  if (item.product_id === PRODUCTS.T_SHIRT) {
    area_width = 750;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.HOODIE) {
    area_width = 1000;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.MUG) {
    area_width = 2570;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.WATER_BOTTLE) {
    area_width = 1620;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.LAPTOP_SLEEVE) {
    area_width = 1300;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.SPIRAL_NOTEBOOK) {
    area_width = 660;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.JIGSAW_PUZZLE) {
    area_width = 790;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.TOTE_BAG) {
    area_width = 1030;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.PHONE_CASE) {
    area_width = 480;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  }

  return {
    variant_id: item.variant_id,
    quantity: item.quantity,
    type: "front",
    files: [
      {
        url: item.image,
        position: {
          area_width: area_width,
          area_height: area_height,
          width: image_width,
          height: image_height,
          top: top < 0 ? 0 : top,
          left: 0,
        },
      },
    ],
  };
}
export { getOrderObject };
