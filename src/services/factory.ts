/**
 * Factory functions for creating services with default repositories.
 *
 * These factories make it easy to use services without manually injecting repositories.
 * For testing, you can still pass custom repositories.
 */

import { CategoryService } from "./category.service";
import { ProductService } from "./product.service";
import { WarehouseService } from "./warehouse.service";
import { StockService } from "./stock.service";
import { ReservationService } from "./reservation.service";
import { InventoryTransactionService } from "./inventory-transaction.service";
import { OrderService } from "./order.service";
import { VariantAttributeService } from "./variant-attribute.service";
import { ProductVariantService } from "./product-variant.service";
import { CustomerService } from "./customer.service";

import { CategoryRepository } from "../repositories/category.repository";
import { ProductRepository } from "../repositories/product.repository";
import { WarehouseRepository } from "../repositories/warehouse.repository";
import { StockRepository } from "../repositories/stock.repository";
import { ReservationRepository } from "../repositories/reservation.repository";
import { InventoryTransactionRepository } from "../repositories/inventory-transaction.repository";
import { OrderRepository } from "../repositories/order.repository";
import { VariantAttributeRepository } from "../repositories/variant-attribute.repository";
import { ProductVariantRepository } from "../repositories/product-variant.repository";
import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerGroupRepository } from "../repositories/customer-group.repository";

/**
 * Creates a CategoryService with default repository.
 * Pass a custom repository for testing.
 */
export function createCategoryService(
  repository?: CategoryRepository
): CategoryService {
  return new CategoryService(repository || new CategoryRepository());
}

/**
 * Creates a ProductService with default repository.
 * Pass a custom repository for testing.
 */
export function createProductService(
  repository?: ProductRepository
): ProductService {
  return new ProductService(repository || new ProductRepository());
}

/**
 * Creates a WarehouseService with default repository.
 * Pass a custom repository for testing.
 */
export function createWarehouseService(
  repository?: WarehouseRepository
): WarehouseService {
  return new WarehouseService(repository || new WarehouseRepository());
}

/**
 * Creates a StockService with default repositories.
 * Pass custom repositories for testing.
 */
export function createStockService(options?: {
  stockRepository?: StockRepository;
  productRepository?: ProductRepository;
  warehouseRepository?: WarehouseRepository;
}): StockService {
  return new StockService(
    options?.stockRepository || new StockRepository(),
    options?.productRepository || new ProductRepository(),
    options?.warehouseRepository || new WarehouseRepository()
  );
}

/**
 * Creates a ReservationService with default repositories.
 * Pass custom repositories for testing.
 */
export function createReservationService(options?: {
  reservationRepository?: ReservationRepository;
  stockRepository?: StockRepository;
}): ReservationService {
  return new ReservationService(
    options?.reservationRepository || new ReservationRepository(),
    options?.stockRepository || new StockRepository()
  );
}

/**
 * Creates an InventoryTransactionService with default repositories.
 * Pass custom repositories for testing.
 */
export function createInventoryTransactionService(options?: {
  transactionRepository?: InventoryTransactionRepository;
  stockRepository?: StockRepository;
}): InventoryTransactionService {
  return new InventoryTransactionService(
    options?.transactionRepository || new InventoryTransactionRepository(),
    options?.stockRepository || new StockRepository()
  );
}

/**
 * Creates an OrderService with default repositories and services.
 * Pass custom repositories/services for testing.
 */
export function createOrderService(options?: {
  orderRepository?: OrderRepository;
  reservationService?: ReservationService;
  inventoryTransactionService?: InventoryTransactionService;
}): OrderService {
  // Create dependencies if not provided
  const reservationService =
    options?.reservationService ||
    createReservationService({
      reservationRepository: new ReservationRepository(),
      stockRepository: new StockRepository(),
    });

  const inventoryTransactionService =
    options?.inventoryTransactionService ||
    createInventoryTransactionService({
      transactionRepository: new InventoryTransactionRepository(),
      stockRepository: new StockRepository(),
    });

  return new OrderService(
    options?.orderRepository || new OrderRepository(),
    reservationService,
    inventoryTransactionService
  );
}

/**
 * Creates a VariantAttributeService with default repository.
 * Pass a custom repository for testing.
 */
export function createVariantAttributeService(
  repository?: VariantAttributeRepository
): VariantAttributeService {
  return new VariantAttributeService(
    repository || new VariantAttributeRepository()
  );
}

/**
 * Creates a ProductVariantService with default repositories.
 * Pass custom repositories for testing.
 */
export function createProductVariantService(options?: {
  productVariantRepository?: ProductVariantRepository;
  productRepository?: ProductRepository;
}): ProductVariantService {
  return new ProductVariantService(
    options?.productVariantRepository || new ProductVariantRepository(),
    options?.productRepository || new ProductRepository()
  );
}

/**
 * Creates a CustomerService with default repositories.
 * Pass custom repositories for testing.
 */
export function createCustomerService(options?: {
  customerRepository?: CustomerRepository;
  customerGroupRepository?: CustomerGroupRepository;
  orderRepository?: OrderRepository;
}): CustomerService {
  return new CustomerService(
    options?.customerRepository || new CustomerRepository(),
    options?.customerGroupRepository || new CustomerGroupRepository(),
    options?.orderRepository || new OrderRepository()
  );
}

/**
 * Creates all services at once with default repositories.
 * This is convenient for most use cases.
 *
 * For testing, you can pass custom repositories/services.
 */
export function createServices(options?: {
  categoryRepository?: CategoryRepository;
  productRepository?: ProductRepository;
  warehouseRepository?: WarehouseRepository;
  stockRepository?: StockRepository;
  reservationRepository?: ReservationRepository;
  transactionRepository?: InventoryTransactionRepository;
  orderRepository?: OrderRepository;
  variantAttributeRepository?: VariantAttributeRepository;
  productVariantRepository?: ProductVariantRepository;
  customerRepository?: CustomerRepository;
  customerGroupRepository?: CustomerGroupRepository;
}) {
  // Note: orderRepository is shared between OrderService and CustomerService
  // Create repositories (shared instances)
  const categoryRepo = options?.categoryRepository || new CategoryRepository();
  const productRepo = options?.productRepository || new ProductRepository();
  const warehouseRepo =
    options?.warehouseRepository || new WarehouseRepository();
  const stockRepo = options?.stockRepository || new StockRepository();
  const reservationRepo =
    options?.reservationRepository || new ReservationRepository();
  const transactionRepo =
    options?.transactionRepository || new InventoryTransactionRepository();
  const orderRepo = options?.orderRepository || new OrderRepository();
  const variantAttributeRepo =
    options?.variantAttributeRepository || new VariantAttributeRepository();
  const productVariantRepo =
    options?.productVariantRepository || new ProductVariantRepository();
  const customerRepo =
    options?.customerRepository || new CustomerRepository();
  const customerGroupRepo =
    options?.customerGroupRepository || new CustomerGroupRepository();
  const orderRepoForCustomer = options?.orderRepository || new OrderRepository();

  // Create services
  const categoryService = new CategoryService(categoryRepo);
  const productService = new ProductService(productRepo);
  const warehouseService = new WarehouseService(warehouseRepo);
  const stockService = new StockService(stockRepo, productRepo, warehouseRepo);
  const reservationService = new ReservationService(reservationRepo, stockRepo);
  const inventoryTransactionService = new InventoryTransactionService(
    transactionRepo,
    stockRepo
  );
  const orderService = new OrderService(
    orderRepo,
    reservationService,
    inventoryTransactionService
  );
  const variantAttributeService = new VariantAttributeService(
    variantAttributeRepo
  );
  const productVariantService = new ProductVariantService(
    productVariantRepo,
    productRepo
  );
  const customerService = new CustomerService(
    customerRepo,
    customerGroupRepo,
    orderRepoForCustomer
  );

  return {
    categoryService,
    productService,
    warehouseService,
    stockService,
    reservationService,
    inventoryTransactionService,
    orderService,
    variantAttributeService,
    productVariantService,
    customerService,
  };
}
