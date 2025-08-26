export interface PaggedRequestQuery {
  pageIndex: number; // 0-based
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  filter?: string;
}