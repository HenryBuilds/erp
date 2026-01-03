import type { ProductId } from "./product.model";

export type ProductVariantId = string;

/**
 * Product Variant represents a specific variation of a product
 * Each variant has attribute values (e.g., Size: "L", Color: "Red")
 * Variants can have their own SKU and stock levels
 */
export class ProductVariant {
  constructor(
    public readonly id: ProductVariantId,
    public readonly productId: ProductId,
    public sku: string,
    public attributeValues: Record<string, string>, // e.g., { "Size": "L", "Color": "Red" }
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!productId) {
      throw new Error("Product variant must have a productId");
    }
    if (!sku || sku.trim().length === 0) {
      throw new Error("Product variant SKU must not be empty");
    }
    if (!attributeValues || Object.keys(attributeValues).length === 0) {
      throw new Error("Product variant must have at least one attribute value");
    }
  }

  /**
   * Gets a formatted string representation of the variant
   * Example: "Size: L, Color: Red"
   */
  getDisplayName(): string {
    return Object.entries(this.attributeValues)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }

  /**
   * Checks if this variant matches the given attribute values
   */
  matchesAttributes(attributes: Record<string, string>): boolean {
    const variantKeys = Object.keys(this.attributeValues).sort();
    const searchKeys = Object.keys(attributes).sort();
    
    if (variantKeys.length !== searchKeys.length) {
      return false;
    }

    return variantKeys.every(
      (key) => this.attributeValues[key] === attributes[key]
    );
  }

  static fromDb(data: {
    id: ProductVariantId;
    productId: ProductId;
    sku: string;
    attributeValues: Record<string, string>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ProductVariant {
    return new ProductVariant(
      data.id,
      data.productId,
      data.sku,
      data.attributeValues,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}




