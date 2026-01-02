import type { CategoryId } from "../category/category.model";

export type ProductId = string;

export class Product {
  constructor(
    public readonly id: ProductId,
    public name: string,
    public sku: string,
    public categoryId: CategoryId,
    public isSellable: boolean = true,
    public isActive: boolean = true
  ) {
    if (!name) {
      throw new Error("Product name must not be empty");
    }

    if (!sku) {
      throw new Error("SKU must not be empty");
    }

    if (!categoryId) {
      throw new Error("Product must have a category");
    }
  }

  /**
   * Factory method: Creates a Product from DB data
   * Alternative to Mapper class for simpler cases
   */
  static fromDb(data: {
    id: ProductId;
    name: string;
    sku: string;
    categoryId: CategoryId;
    isSellable: boolean;
    isActive: boolean;
  }): Product {
    return new Product(
      data.id,
      data.name,
      data.sku,
      data.categoryId,
      data.isSellable,
      data.isActive
    );
  }
}
