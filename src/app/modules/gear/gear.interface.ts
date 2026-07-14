export type TCreateGear = {
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock: number;
  categoryId: string;
  images: string[];
};

export type TUpdateGear = Partial<TCreateGear>;
