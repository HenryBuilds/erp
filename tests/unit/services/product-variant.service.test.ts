import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { createServices } from "../../../src/services/factory";
import { ProductVariantService } from "../../../src/services/product-variant.service";
import { ProductVariant } from "../../../src/modules/product/product-variant.model";
import { TestDbHelper } from "../../helpers/db";

describe("ProductVariantService", () => {
  let productVariantService: ProductVariantService;
  let categoryService: any;
  let productService: any;
  let variantAttributeService: any;

  beforeEach(async () => {
    // Clear database before each test to ensure clean state
    await TestDbHelper.clearAllTables();
    
    // Create services after clearing database
    const services = createServices();
    productVariantService = services.productVariantService;
    categoryService = services.categoryService;
    productService = services.productService;
    variantAttributeService = services.variantAttributeService;
  });

  describe("createProductVariant", () => {
    it("should create a product variant successfully", async () => {
      const category = await categoryService.createCategory(`Category-${Date.now()}-001`);
      // Verify category exists before creating product
      await categoryService.getCategoryById(category.id);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}-001`,
        category.id
      );
      await variantAttributeService.createVariantAttribute("Size");
      await variantAttributeService.createVariantAttribute("Color");

      const sku = `SKU-VARIANT-${Date.now()}-001`;
      const variant = await productVariantService.createProductVariant(
        product.id,
        sku,
        { Size: "L", Color: "Red" }
      );

      expect(variant).toBeInstanceOf(ProductVariant);
      expect(variant.productId).toBe(product.id);
      expect(variant.sku).toBe(sku);
      expect(variant.attributeValues).toEqual({ Size: "L", Color: "Red" });
    });

    it("should throw error if product does not exist", async () => {
      const nonExistentProductId = crypto.randomUUID();

      await expect(
        productVariantService.createProductVariant(
          nonExistentProductId,
          `SKU-VARIANT-${Date.now()}-002`,
          { Size: "L" }
        )
      ).rejects.toThrow("not found");
    });

    it("should throw error if SKU already exists", async () => {
      const category = await categoryService.createCategory(`Category-${Date.now()}-002`);
      // Verify category exists before creating product
      await categoryService.getCategoryById(category.id);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}-002`,
        category.id
      );
      const sku = `SKU-DUPLICATE-${Date.now()}`;
      await productVariantService.createProductVariant(product.id, sku, { Size: "L" });

      await expect(
        productVariantService.createProductVariant(product.id, sku, { Size: "M" })
      ).rejects.toThrow("already exists");
    });

    it("should throw error if variant with same attributes already exists", async () => {
      const category = await categoryService.createCategory(`Category-${Date.now()}-003`);
      // Verify category exists before creating product
      await categoryService.getCategoryById(category.id);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}-003`,
        category.id
      );
      await productVariantService.createProductVariant(
        product.id,
        `SKU-VARIANT-${Date.now()}-003`,
        { Size: "L", Color: "Red" }
      );

      await expect(
        productVariantService.createProductVariant(
          product.id,
          `SKU-VARIANT-${Date.now()}-004`,
          { Size: "L", Color: "Red" }
        )
      ).rejects.toThrow("already exists");
    });
  });

  describe("getProductVariantById", () => {
    it("should return variant if exists", async () => {
      const category = await categoryService.createCategory(`Category-${Date.now()}-004`);
      // Verify category exists before creating product
      await categoryService.getCategoryById(category.id);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}-004`,
        category.id
      );
      const created = await productVariantService.createProductVariant(
        product.id,
        `SKU-VARIANT-${Date.now()}-005`,
        { Size: "L" }
      );

      const variant = await productVariantService.getProductVariantById(created.id);

      expect(variant).toBeInstanceOf(ProductVariant);
      expect(variant.id).toBe(created.id);
    });

    it("should throw error if variant not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        productVariantService.getProductVariantById(nonExistentId)
      ).rejects.toThrow("not found");
    });
  });

  describe("getVariantsByProduct", () => {
    it("should return all variants for a product", async () => {
      const category = await categoryService.createCategory(`Category-${Date.now()}-005`);
      // Verify category exists before creating product
      await categoryService.getCategoryById(category.id);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}-005`,
        category.id
      );
      await productVariantService.createProductVariant(
        product.id,
        `SKU-VARIANT-${Date.now()}-006`,
        { Size: "L" }
      );
      await productVariantService.createProductVariant(
        product.id,
        `SKU-VARIANT-${Date.now()}-007`,
        { Size: "M" }
      );

      const variants = await productVariantService.getVariantsByProduct(product.id);

      expect(variants.length).toBe(2);
    });
  });

  describe("updateProductVariant", () => {
    it("should update variant successfully", async () => {
      const category = await categoryService.createCategory(`Category-${Date.now()}-006`);
      // Verify category exists before creating product
      await categoryService.getCategoryById(category.id);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}-006`,
        category.id
      );
      const created = await productVariantService.createProductVariant(
        product.id,
        `SKU-VARIANT-${Date.now()}-008`,
        { Size: "L" }
      );

      const newSku = `SKU-UPDATED-${Date.now()}`;
      const updated = await productVariantService.updateProductVariant(created.id, {
        sku: newSku,
        attributeValues: { Size: "XL" },
      });

      expect(updated.sku).toBe(newSku);
      expect(updated.attributeValues).toEqual({ Size: "XL" });
    });
  });

  describe("deactivateProductVariant", () => {
    it("should deactivate variant", async () => {
      const category = await categoryService.createCategory(`Category-${Date.now()}-007`);
      // Verify category exists before creating product
      await categoryService.getCategoryById(category.id);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}-007`,
        category.id
      );
      const created = await productVariantService.createProductVariant(
        product.id,
        `SKU-VARIANT-${Date.now()}-009`,
        { Size: "L" }
      );

      const deactivated = await productVariantService.deactivateProductVariant(created.id);

      expect(deactivated.isActive).toBe(false);
    });
  });
});

