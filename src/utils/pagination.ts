export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  page: number;
  limit: number;
  offset: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export const getPagination = (params: PaginationParams): PaginationResult => {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 25;
  const offset = (page - 1) * limit;
  const sortBy = params.sortBy ? params.sortBy : 'created_at';
  const sortOrder = params.sortOrder && params.sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  return { page, limit, offset, sortBy, sortOrder };
};
