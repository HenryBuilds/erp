import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { variantAttributes } from "../db/schema/index";
import { VariantAttribute, VariantAttributeId } from "../modules/product/variant-attribute.model";
import { VariantAttributeMapper } from "../db/mappers/variant-attribute.mapper";

export class VariantAttributeRepository {
  async create(attribute: VariantAttribute): Promise<VariantAttribute> {
    const [created] = await db
      .insert(variantAttributes)
      .values(VariantAttributeMapper.toPersistence(attribute))
      .returning();

    if (!created) {
      throw new Error("Failed to create variant attribute");
    }

    return VariantAttributeMapper.toDomain(created);
  }

  async findById(id: VariantAttributeId): Promise<VariantAttribute | null> {
    const [result] = await db
      .select()
      .from(variantAttributes)
      .where(eq(variantAttributes.id, id))
      .limit(1);

    return result ? VariantAttributeMapper.toDomain(result) : null;
  }

  async findByName(name: string): Promise<VariantAttribute | null> {
    const [result] = await db
      .select()
      .from(variantAttributes)
      .where(eq(variantAttributes.name, name))
      .limit(1);

    return result ? VariantAttributeMapper.toDomain(result) : null;
  }

  async findAll(): Promise<VariantAttribute[]> {
    const results = await db.select().from(variantAttributes);
    return VariantAttributeMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<VariantAttribute[]> {
    const results = await db
      .select()
      .from(variantAttributes)
      .where(eq(variantAttributes.isActive, true));
    return VariantAttributeMapper.toDomainMany(results);
  }

  async update(attribute: VariantAttribute): Promise<VariantAttribute> {
    const [updated] = await db
      .update(variantAttributes)
      .set(VariantAttributeMapper.toPersistence(attribute))
      .where(eq(variantAttributes.id, attribute.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update variant attribute");
    }

    return VariantAttributeMapper.toDomain(updated);
  }

  async deactivate(id: VariantAttributeId): Promise<VariantAttribute> {
    const attribute = await this.findById(id);
    if (!attribute) {
      throw new Error(`Variant attribute with ID "${id}" not found`);
    }

    attribute.isActive = false;
    return await this.update(attribute);
  }

  async activate(id: VariantAttributeId): Promise<VariantAttribute> {
    const attribute = await this.findById(id);
    if (!attribute) {
      throw new Error(`Variant attribute with ID "${id}" not found`);
    }

    attribute.isActive = true;
    return await this.update(attribute);
  }
}




