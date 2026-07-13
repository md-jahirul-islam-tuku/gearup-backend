export const calculatePagination = (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
