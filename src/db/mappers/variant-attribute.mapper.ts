import { VariantAttribute } from "../../modules/product/variant-attribute.model";
import type { variantAttributes } from "../schema/variant-attributes";

type VariantAttributeRow = typeof variantAttributes.$inferSelect;
type VariantAttributeInsert = typeof variantAttributes.$inferInsert;

export class VariantAttributeMapper {
  static toDomain(row: VariantAttributeRow): VariantAttribute {
    return VariantAttribute.fromDb({
      id: row.id,
      name: row.name,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(
    attribute: VariantAttribute
  ): Omit<VariantAttributeInsert, "createdAt" | "updatedAt"> {
    return {
      id: attribute.id,
      name: attribute.name,
      isActive: attribute.isActive,
    };
  }

  static toDomainMany(rows: VariantAttributeRow[]): VariantAttribute[] {
    return rows.map((row) => this.toDomain(row));
  }
}




