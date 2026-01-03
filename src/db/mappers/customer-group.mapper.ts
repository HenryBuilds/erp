import { customerGroups } from "../schema/customer-groups";
import { CustomerGroup } from "../../modules/customer/customer.model";

/**
 * Mapper for CustomerGroup transformations between DB and Domain
 */
export class CustomerGroupMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof customerGroups.$inferSelect): CustomerGroup {
    return CustomerGroup.fromDb({
      id: row.id,
      name: row.name,
      description: row.description,
      discountPercentage: row.discountPercentage,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    group: CustomerGroup
  ): Omit<typeof customerGroups.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: group.id,
      name: group.name,
      description: group.description ?? null,
      discountPercentage: group.discountPercentage,
      isActive: group.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof customerGroups.$inferSelect)[]
  ): CustomerGroup[] {
    return rows.map((row) => this.toDomain(row));
  }
}

