import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { StockService } from "../../../src/services/stock.service";
import { StockRepository } from "../../../src/repositories/stock.repository";
import { ProductRepository } from "../../../src/repositories/product.repository";
import { WarehouseRepository } from "../../../src/repositories/warehouse.repository";
import { ProductService } from "../../../src/services/product.service";
import { WarehouseService } from "../../../src/services/warehouse.service";
import { CategoryService } from "../../../src/services/category.service";
import { CategoryRepository } from "../../../src/repositories/category.repository";
import { TestDbHelper } from "../../helpers/db";

describe("StockService", () => {
  let stockService: StockService;
  let stockRepository: StockRepository;
  let productRepository: ProductRepository;
  let warehouseRepository: WarehouseRepository;
  let productService: ProductService;
  let warehouseService: WarehouseService;
  let categoryService: CategoryService;

  beforeAll(async () => {
    // Clear database once before all tests in this file
    await TestDbHelper.clearAllTables();
  });

  beforeEach(() => {
    stockRepository = new StockRepository();
    productRepository = new ProductRepository();
    warehouseRepository = new WarehouseRepository();
    const categoryRepository = new CategoryRepository();
    stockService = new StockService(
      stockRepository,
      productRepository,
      warehouseRepository
    );
    productService = new ProductService(productRepository);
    warehouseService = new WarehouseService(warehouseRepository);
    categoryService = new CategoryService(categoryRepository);
  });

  describe("setStock", () => {
    it("should set stock successfully", async () => {
      const category = await categoryService.createCategory(`Category-STOCK-${Date.now()}-001`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-STOCK-${Date.now()}-001`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");

      const stock = await stockService.setStock(
        product.id,
        warehouse.id,
        100
      );

      expect(stock.quantity).toBe(100);
      expect(stock.productId).toBe(product.id);
      expect(stock.warehouseId).toBe(warehouse.id);
    });

    it("should throw error if product does not exist", async () => {
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");
      const nonExistentId = crypto.randomUUID();

      await expect(
        stockService.setStock(nonExistentId, warehouse.id, 100)
      ).rejects.toThrow("not found");
    });

    it("should throw error if warehouse does not exist", async () => {
      const category = await categoryService.createCategory(`Category-STOCK-${Date.now()}-002`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-STOCK-${Date.now()}-002`,
        category.id
      );
      const nonExistentId = crypto.randomUUID();

      await expect(
        stockService.setStock(product.id, nonExistentId, 100)
      ).rejects.toThrow("not found");
    });
  });

  describe("adjustStock", () => {
    it("should increase stock", async () => {
      const category = await categoryService.createCategory(`Category-STOCK-${Date.now()}-003`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-STOCK-${Date.now()}-003`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");

      await stockService.setStock(product.id, warehouse.id, 100);
      const adjusted = await stockService.adjustStock(
        product.id,
        warehouse.id,
        50
      );

      expect(adjusted.quantity).toBe(150);
    });

    it("should decrease stock", async () => {
      const category = await categoryService.createCategory(`Category-STOCK-${Date.now()}-004`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-STOCK-${Date.now()}-004`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");

      await stockService.setStock(product.id, warehouse.id, 100);
      const adjusted = await stockService.adjustStock(
        product.id,
        warehouse.id,
        -30
      );

      expect(adjusted.quantity).toBe(70);
    });

    it("should throw error if stock would go negative", async () => {
      const category = await categoryService.createCategory(`Category-STOCK-${Date.now()}-005`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-STOCK-${Date.now()}-005`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");

      await stockService.setStock(product.id, warehouse.id, 50);

      await expect(
        stockService.adjustStock(product.id, warehouse.id, -100)
      ).rejects.toThrow("Insufficient stock");
    });
  });

  describe("getTotalStock", () => {
    it("should calculate total stock across warehouses", async () => {
      const category = await categoryService.createCategory(`Category-STOCK-${Date.now()}-006`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-STOCK-${Date.now()}-006`,
        category.id
      );
      const warehouse1 = await warehouseService.createWarehouse("Warehouse 1");
      const warehouse2 = await warehouseService.createWarehouse("Warehouse 2");

      await stockService.setStock(product.id, warehouse1.id, 100);
      await stockService.setStock(product.id, warehouse2.id, 50);

      const total = await stockService.getTotalStock(product.id);

      expect(total).toBe(150);
    });

    it("should return 0 if no stock exists", async () => {
      const category = await categoryService.createCategory(`Category-STOCK-${Date.now()}-007`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-STOCK-${Date.now()}-007`,
        category.id
      );

      const total = await stockService.getTotalStock(product.id);

      expect(total).toBe(0);
    });
  });
});

