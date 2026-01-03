export type VariantAttributeId = string;

/**
 * Variant Attribute represents a type of attribute that can be used for product variants
 * Examples: "Size", "Color", "Material"
 */
export class VariantAttribute {
  constructor(
    public readonly id: VariantAttributeId,
    public name: string,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error("Variant attribute name must not be empty");
    }
  }

  static fromDb(data: {
    id: VariantAttributeId;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): VariantAttribute {
    return new VariantAttribute(
      data.id,
      data.name,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}




