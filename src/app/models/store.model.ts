import { OrderDetail } from "./order-detail.model";

// product.model.ts
export interface Store {
  id: string;
  code: string;
  name: string;
  city: string;
  responsible: string;
  maxQuantity: number;
}
