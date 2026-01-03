import { customers } from "../schema/customers";
import { Customer } from "../../modules/customer/customer.model";

/**
 * Mapper for Customer transformations between DB and Domain
 */
export class CustomerMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof customers.$inferSelect): Customer {
    return Customer.fromDb({
      id: row.id,
      name: row.name,
      street: row.street,
      city: row.city,
      postalCode: row.postalCode,
      country: row.country,
      state: row.state,
      email: row.email,
      phone: row.phone,
      creditLimit: row.creditLimit,
      paymentTerms: row.paymentTerms as any,
      customerGroupId: row.customerGroupId,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    customer: Customer
  ): Omit<typeof customers.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: customer.id,
      name: customer.name,
      street: customer.address.street,
      city: customer.address.city,
      postalCode: customer.address.postalCode,
      country: customer.address.country,
      state: customer.address.state ?? null,
      email: customer.contact.email,
      phone: customer.contact.phone ?? null,
      creditLimit: customer.creditLimit,
      paymentTerms: customer.paymentTerms,
      customerGroupId: customer.customerGroupId,
      isActive: customer.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof customers.$inferSelect)[]
  ): Customer[] {
    return rows.map((row) => this.toDomain(row));
  }
}

