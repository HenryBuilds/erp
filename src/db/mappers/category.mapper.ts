import { categories } from "../schema/index";
import { Category } from "../../modules/category/category.model";

/**
 * Mapper for Category transformations between DB and Domain
 */
export class CategoryMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof categories.$inferSelect): Category {
    return new Category(
      row.id,
      row.name,
      row.description ?? null,
      row.isActive
    );
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    category: Category
  ): Omit<typeof categories.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: category.id,
      name: category.name,
      description: category.description ?? null,
      isActive: category.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof categories.$inferSelect)[]
  ): Category[] {
    return rows.map((row) => this.toDomain(row));
  }
}

