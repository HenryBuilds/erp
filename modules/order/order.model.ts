import type { ProductId } from "../product/product.model";

export type OrderId = string;
export type OrderItemId = string;

export enum OrderStatus {
  CREATED = "CREATED",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export class OrderItem {
  constructor(
    public readonly id: OrderItemId,
    public readonly productId: ProductId,
    public readonly quantity: number,
    public readonly unitPrice: number
  ) {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    if (unitPrice < 0) {
      throw new Error("Unit price must not be negative");
    }
  }

  get total(): number {
    return this.quantity * this.unitPrice;
  }
}

export class Order {
  constructor(
    public readonly id: OrderId,
    public readonly customerId: string,
    public items: OrderItem[],
    public status: OrderStatus = OrderStatus.CREATED,
    public readonly createdAt: Date = new Date()
  ) {
    if (items.length === 0) {
      throw new Error("Order must contain at least one item");
    }
  }

  get totalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }
}
