function getOrderObject(item: any, dimensions: any) {
  const aspectRatio = dimensions.width / dimensions.height;
  const area_width = 750;
  const area_height = 1000;
  const image_width = area_width;
  const image_height = image_width / aspectRatio;
  const height_left = area_height - image_height;
  const top = height_left / 2;

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
          top: top,
          left: 0,
        },
      },
    ],
  };
}
export { getOrderObject };
