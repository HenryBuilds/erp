import { VariantAttributeRepository } from "../repositories/variant-attribute.repository";
import {
  VariantAttribute,
  VariantAttributeId,
} from "../modules/product/variant-attribute.model";

/**
 * Service for Variant Attribute business logic
 */
export class VariantAttributeService {
  constructor(
    private readonly variantAttributeRepository: VariantAttributeRepository
  ) {}

  /**
   * Creates a new variant attribute
   */
  async createVariantAttribute(name: string): Promise<VariantAttribute> {
    // Trim name before checking for duplicates
    const trimmedName = name.trim();

    // Check if attribute name already exists
    const existing = await this.variantAttributeRepository.findByName(
      trimmedName
    );
    if (existing) {
      throw new Error(
        `Variant attribute with name "${trimmedName}" already exists`
      );
    }

    const attribute = new VariantAttribute(crypto.randomUUID(), trimmedName);

    return await this.variantAttributeRepository.create(attribute);
  }

  /**
   * Gets a variant attribute by ID
   */
  async getVariantAttributeById(
    id: VariantAttributeId
  ): Promise<VariantAttribute> {
    const attribute = await this.variantAttributeRepository.findById(id);
    if (!attribute) {
      throw new Error(`Variant attribute with ID "${id}" not found`);
    }
    return attribute;
  }

  /**
   * Gets a variant attribute by name
   */
  async getVariantAttributeByName(name: string): Promise<VariantAttribute> {
    const attribute = await this.variantAttributeRepository.findByName(name);
    if (!attribute) {
      throw new Error(`Variant attribute with name "${name}" not found`);
    }
    return attribute;
  }

  /**
   * Gets all variant attributes
   */
  async getAllVariantAttributes(
    activeOnly: boolean = false
  ): Promise<VariantAttribute[]> {
    if (activeOnly) {
      return await this.variantAttributeRepository.findAllActive();
    }
    return await this.variantAttributeRepository.findAll();
  }

  /**
   * Updates a variant attribute
   */
  async updateVariantAttribute(
    id: VariantAttributeId,
    updates: Partial<{ name: string }>
  ): Promise<VariantAttribute> {
    const attribute = await this.getVariantAttributeById(id);

    if (updates.name !== undefined) {
      // Trim name before checking for duplicates
      const trimmedName = updates.name.trim();

      // Check if new name already exists (excluding current attribute)
      const existing = await this.variantAttributeRepository.findByName(
        trimmedName
      );
      if (existing && existing.id !== id) {
        throw new Error(
          `Variant attribute with name "${trimmedName}" already exists`
        );
      }
      attribute.name = trimmedName;
    }

    return await this.variantAttributeRepository.update(attribute);
  }

  /**
   * Deactivates a variant attribute
   */
  async deactivateVariantAttribute(
    id: VariantAttributeId
  ): Promise<VariantAttribute> {
    return await this.variantAttributeRepository.deactivate(id);
  }

  /**
   * Activates a variant attribute
   */
  async activateVariantAttribute(
    id: VariantAttributeId
  ): Promise<VariantAttribute> {
    return await this.variantAttributeRepository.activate(id);
  }
}
