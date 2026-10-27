export type SellerProduct = {
  product_id: string;
  license: string;
  delivery_url: string;
};

const DEFAULT_MONALISA_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg";

export const sellerProducts: SellerProduct[] = [
  {
    product_id: "prod-abc123",
    license:
      "Non-exclusive digital usage license for the quoted impression count.",
    delivery_url: DEFAULT_MONALISA_IMAGE_URL,
  },
];
