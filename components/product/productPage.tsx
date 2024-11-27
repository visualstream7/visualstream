interface ProductPageProps {
  id: string;
  image_id: string;
}

export default function ProductPage({
  id,
  image_id,
}: ProductPageProps): JSX.Element {
  return (
    <div>
      <h1>Product Page</h1>
      <p>ID: {id}</p>
      <p>Image ID: {image_id}</p>
    </div>
  );
}
