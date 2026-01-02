export type ProductId = string;

export class Product {
  constructor(
    public readonly id: ProductId,
    public name: string,
    public sku: string,
    public isSellable: boolean = true,
    public isActive: boolean = true
  ) {
    if (!name) {
      throw new Error("Product name must not be empty");
    }

    if (!sku) {
      throw new Error("SKU must not be empty");
    }
  }
}
