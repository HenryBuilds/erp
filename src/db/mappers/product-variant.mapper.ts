import { ProductVariant } from "../../modules/product/product-variant.model";
import type { productVariants } from "../schema/product-variants";

type ProductVariantRow = typeof productVariants.$inferSelect;
type ProductVariantInsert = typeof productVariants.$inferInsert;

export class ProductVariantMapper {
  static toDomain(row: ProductVariantRow): ProductVariant {
    return ProductVariant.fromDb({
      id: row.id,
      productId: row.productId,
      sku: row.sku,
      attributeValues: row.attributeValues as Record<string, string>,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(
    variant: ProductVariant
  ): Omit<ProductVariantInsert, "createdAt" | "updatedAt"> {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      attributeValues: variant.attributeValues,
      isActive: variant.isActive,
    };
  }

  static toDomainMany(rows: ProductVariantRow[]): ProductVariant[] {
    return rows.map((row) => this.toDomain(row));
  }
}




