import { OrderDetail } from "./order-detail.model";

// product.model.ts
export interface Order {
  storeId: string;
  createdAt: Date;
  orderDetails: OrderDetail[];
}
