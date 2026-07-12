export interface PaginatedResponse<T> {
  docs: T[];
  limit: number;
  page: number;
  totalDocs: number;
  totalPages: number;
}
