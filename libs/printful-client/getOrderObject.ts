import { Pi, Ratio } from "lucide-react";

const PRODUCTS = {
  PAPER_POSTER: 1,
  CANVAS: 3, // done
  MUG: 19, // done
  T_SHIRT: 71, // done
  TOTE_BAG: 84, // done
  PHONE_CASE: 181, // done
  HAT: 206, // needs thread colors dynamically
  BAGPACK: 279, // done
  STICKERS: 358, // done
  HOODIE: 380, // done
  WATER_BOTTLE: 382, // done
  LAPTOP_SLEEVE: 394, // done
  SPIRAL_NOTEBOOK: 474, // done
  JIGSAW_PUZZLE: 534, // done
  METAL_PRINT: 588, // done
};

const PAPER_POSTER_VARIANT_RATIOS = {
  1: 0.75,
  2: 0.67,
  1349: 0.75,
  3876: 0.67,
  3877: 0.8,
  4463: 0.8,
  4464: 1.0,
  4465: 1.0,
  6240: 1.0,
  6242: 1.0,
  14125: 0.79,
  16364: 0.71,
  16365: 0.67,
  19527: 1.42,
  19528: 0.71,
};

const METAL_PRINT_RATIOS = {
  15134: 0.8,
  15135: 1.0,
  15136: 0.79,
  15137: 0.8,
  15138: 0.67,
  15139: 0.67,
};

const STICKER_VARIANT_RATIOS = {
  10163: 1.0,
  10164: 1.0,
  10165: 1.0,
  16362: 4.0,
};

const CANVAS_VARIANT_RATIOS = {
  5: 0.82,
  6: 0.82,
  7: 0.8,
  823: 1.0,
  824: 1.0,
  825: 0.71,
  19291: 1.0,
  19292: 1.0,
  19293: 1.18,
  19294: 0.73,
  19295: 1.25,
  19296: 1.0,
  19297: 0.57,
  19298: 0.82,
  19299: 1.4,
  19300: 0.56,
  19301: 0.38,
  19302: 1.0,
  19303: 0.7,
  19304: 0.54,
  19305: 0.37,
  19306: 1.0,
  19307: 0.72,
  19308: 1.0,
  19309: 0.85,
  19310: 1.35,
  19311: 1.43,
  19312: 0.53,
  19313: 0.37,
  19314: 1.0,
  19315: 0.82,
  19316: 0.77,
  19317: 0.53,
  19318: 1.0,
  19319: 0.67,
  19320: 1.0,
  19321: 0.72,
  19322: 1.0,
  19323: 0.77,
  19324: 0.52,
  19325: 1.0,
  19326: 0.69,
  19327: 1.0,
  19328: 1.0,
  19329: 0.74,
  19330: 0.68,
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
  } else if (item.product_id === PRODUCTS.HAT) {
    area_width = 2290;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.BAGPACK) {
    area_width = 710;
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.CANVAS) {
    // @ts-ignore
    area_width = 1000 * CANVAS_VARIANT_RATIOS[item.variant_id];
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.STICKERS) {
    // @ts-ignore
    area_width = 1000 * STICKER_VARIANT_RATIOS[item.variant_id];
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.METAL_PRINT) {
    // @ts-ignore
    area_width = 1000 * METAL_PRINT_RATIOS[item.variant_id];
    area_height = 1000;
    image_width = area_width;
    image_height = image_width / aspectRatio;
    height_left = area_height - image_height;
    top = height_left / 2;
  } else if (item.product_id === PRODUCTS.PAPER_POSTER) {
    // @ts-ignore
    area_width = 1000 * PAPER_POSTER_VARIANT_RATIOS[item.variant_id];
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
        options:
          item.product_id === PRODUCTS.HAT
            ? [
                {
                  id: "embroidery_type",
                  value: "flat",
                },
                {
                  id: "full_color",
                  value: true,
                },
              ]
            : undefined,
      },
    ],
  };
}
export { getOrderObject };
