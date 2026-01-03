import { ProductVariantRepository } from "../repositories/product-variant.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ProductVariant, ProductVariantId } from "../modules/product/product-variant.model";
import { ProductId } from "../modules/product/product.model";

/**
 * Service for Product Variant business logic
 */
export class ProductVariantService {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository
  ) {}

  /**
   * Creates a new product variant
   */
  async createProductVariant(
    productId: ProductId,
    sku: string,
    attributeValues: Record<string, string>
  ): Promise<ProductVariant> {
    // Validate product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error(`Product with ID "${productId}" not found`);
    }

    // Check if SKU already exists
    const existingVariant = await this.productVariantRepository.findBySku(sku);
    if (existingVariant) {
      throw new Error(`Product variant with SKU "${sku}" already exists`);
    }

    // Check if variant with same attributes already exists for this product
    const existingAttributes = await this.productVariantRepository.findByProductAndAttributes(
      productId,
      attributeValues
    );
    if (existingAttributes) {
      throw new Error(
        `Product variant with attributes ${JSON.stringify(attributeValues)} already exists for this product`
      );
    }

    const variant = new ProductVariant(
      crypto.randomUUID(),
      productId,
      sku,
      attributeValues
    );

    return await this.productVariantRepository.create(variant);
  }

  /**
   * Gets a product variant by ID
   */
  async getProductVariantById(id: ProductVariantId): Promise<ProductVariant> {
    const variant = await this.productVariantRepository.findById(id);
    if (!variant) {
      throw new Error(`Product variant with ID "${id}" not found`);
    }
    return variant;
  }

  /**
   * Gets a product variant by SKU
   */
  async getProductVariantBySku(sku: string): Promise<ProductVariant> {
    const variant = await this.productVariantRepository.findBySku(sku);
    if (!variant) {
      throw new Error(`Product variant with SKU "${sku}" not found`);
    }
    return variant;
  }

  /**
   * Gets all variants for a product
   */
  async getVariantsByProduct(productId: ProductId): Promise<ProductVariant[]> {
    return await this.productVariantRepository.findByProduct(productId);
  }

  /**
   * Finds a variant by product and attribute values
   */
  async findVariantByAttributes(
    productId: ProductId,
    attributeValues: Record<string, string>
  ): Promise<ProductVariant | null> {
    return await this.productVariantRepository.findByProductAndAttributes(
      productId,
      attributeValues
    );
  }

  /**
   * Updates a product variant
   */
  async updateProductVariant(
    id: ProductVariantId,
    updates: {
      sku?: string;
      attributeValues?: Record<string, string>;
      isActive?: boolean;
    }
  ): Promise<ProductVariant> {
    const variant = await this.getProductVariantById(id);

    // Check SKU uniqueness if SKU is being updated
    if (updates.sku && updates.sku !== variant.sku) {
      const existingVariant = await this.productVariantRepository.findBySku(updates.sku);
      if (existingVariant) {
        throw new Error(`Product variant with SKU "${updates.sku}" already exists`);
      }
    }

    // Check attribute uniqueness if attributes are being updated
    if (updates.attributeValues) {
      const existingAttributes = await this.productVariantRepository.findByProductAndAttributes(
        variant.productId,
        updates.attributeValues
      );
      if (existingAttributes && existingAttributes.id !== id) {
        throw new Error(
          `Product variant with attributes ${JSON.stringify(updates.attributeValues)} already exists for this product`
        );
      }
    }

    // Apply updates
    if (updates.sku !== undefined) variant.sku = updates.sku;
    if (updates.attributeValues !== undefined) variant.attributeValues = updates.attributeValues;
    if (updates.isActive !== undefined) variant.isActive = updates.isActive;

    return await this.productVariantRepository.update(variant);
  }

  /**
   * Deactivates a product variant
   */
  async deactivateProductVariant(id: ProductVariantId): Promise<ProductVariant> {
    return await this.productVariantRepository.deactivate(id);
  }

  /**
   * Activates a product variant
   */
  async activateProductVariant(id: ProductVariantId): Promise<ProductVariant> {
    return await this.productVariantRepository.activate(id);
  }

  /**
   * Deletes a product variant permanently
   */
  async deleteProductVariant(id: ProductVariantId): Promise<void> {
    const variant = await this.getProductVariantById(id);
    const deleted = await this.productVariantRepository.delete(id);
    if (!deleted) {
      throw new Error(`Failed to delete product variant with ID "${id}"`);
    }
  }
}




