export type TCreateRental = {
  gearItemId: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
};

export type TGetMyRentalsQuery = {
  page?: string;
  limit?: string;
  status?: string;
};
