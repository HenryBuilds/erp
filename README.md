# Commercio [![Documentation](https://img.shields.io/badge/📖_Documentation-View-blue?style=flat-square)](https://commercio-docs.vercel.app/)

A modular ERP (Enterprise Resource Planning) system for Node.js with PostgreSQL and Drizzle ORM.

## Features

- Category management for product organization
- Product management with SKU support (requires category)
- Product variants with attribute support (Size, Color, Material, etc.)
- Variant attribute management
- Customer management with address, contact details, credit limits, and payment terms
- Customer groups with discount percentages
- Order history and statistics tracking
- Warehouse management (multi-warehouse)
- Inventory management with transaction history
- Order management with status workflow
- Stock reservation system
- TypeScript-first with full type safety
- Structured logging with Pino

## Installation

```bash
npm install commercio
```

## Requirements

- Node.js 18+ or Bun
- PostgreSQL 14+
- TypeScript 5+ (recommended)

## Quick Start

### 1. Set up Database

Create a PostgreSQL database:

```sql
CREATE DATABASE my_erp_db;
```

### 2. Configure Database Connection

**Option A: Environment Variable (Recommended)**

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/my_erp_db
```

The package automatically reads the `DATABASE_URL` environment variable.

**Option B: Programmatic Initialization**

```typescript
import { initDatabase } from "commercio";

initDatabase({
  connectionString: "postgresql://user:password@localhost:5432/my_erp_db",
});

// Or with individual parameters
initDatabase({
  host: "localhost",
  port: 5432,
  database: "my_erp_db",
  user: "postgres",
  password: "password",
});
```

### 3. Run Migrations

The package includes pre-built migrations that can be run automatically. You have two options:

**Option A: Automatic Migration (Recommended)**

Run migrations automatically when initializing the database:

```typescript
import { initDatabase } from "commercio";

initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true, // Automatically run migrations
});
```

**Option B: Manual Migration**

Run migrations manually:

```typescript
import { runMigrations } from "commercio";

// Run migrations with a connection string
await runMigrations(process.env.DATABASE_URL);
```

Or if you've already initialized the database:

```typescript
import { initDatabase, runMigrationsWithDb, db } from "commercio";

initDatabase({
  connectionString: process.env.DATABASE_URL,
});

// Run migrations using the initialized connection
await runMigrationsWithDb(db);
```

That's it! No need to configure Drizzle Kit or generate migration files manually. The migrations are included in the package and run automatically.

## Usage

### Basic Setup

**Option A: Using Factory Functions (Recommended)**

The easiest way to get started - no need to manually inject repositories:

```typescript
import { initDatabase, createServices } from "commercio";

// Initialize database connection
initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

// Create all services at once with default repositories
const {
  categoryService,
  productService,
  productVariantService,
  variantAttributeService,
  warehouseService,
  stockService,
  orderService,
  reservationService,
  inventoryTransactionService,
} = createServices();
```

**Option B: Individual Factory Functions**

Create services individually if you only need specific ones:

```typescript
import {
  initDatabase,
  createCategoryService,
  createProductService,
  createProductVariantService,
  createVariantAttributeService,
  createWarehouseService,
  createStockService,
  createOrderService,
} from "commercio";

// Initialize database connection
initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

// Create only the services you need
const categoryService = createCategoryService();
const productService = createProductService();
const productVariantService = createProductVariantService();
const variantAttributeService = createVariantAttributeService();
const warehouseService = createWarehouseService();
const stockService = createStockService();
const orderService = createOrderService();
```

**Option C: Manual Dependency Injection (Advanced)**

For advanced use cases or testing, you can still manually inject repositories:

```typescript
import {
  initDatabase,
  CategoryService,
  ProductService,
  CategoryRepository,
  ProductRepository,
} from "commercio";

// Initialize database connection
initDatabase({
  connectionString: process.env.DATABASE_URL,
});

// Create repositories manually
const categoryRepo = new CategoryRepository();
const productRepo = new ProductRepository();

// Create services with custom repositories
const categoryService = new CategoryService(categoryRepo);
const productService = new ProductService(productRepo);
```

### Category Management

```typescript
// Create category
const category = await categoryService.createCategory(
  "Electronics",
  "Electronic devices and accessories"
);

// Get category
const foundCategory = await categoryService.getCategoryById(category.id);
const categoryByName = await categoryService.getCategoryByName("Electronics");

// Get all categories
const allCategories = await categoryService.getAllCategories();
const activeCategories = await categoryService.getAllCategories(true);

// Update category
await categoryService.updateCategory(category.id, {
  name: "Consumer Electronics",
  description: "Updated description",
});

// Deactivate category
await categoryService.deactivateCategory(category.id);

// Activate category
await categoryService.activateCategory(category.id);
```

### Product Management

**Note:** Products must be assigned to a category. Create a category first.

```typescript
// First, create a category
const category = await categoryService.createCategory("Electronics");

// Create product (categoryId is required)
const product = await productService.createProduct(
  "Laptop Dell XPS 15",
  "SKU-LAPTOP-001",
  category.id
);

// Get product
const foundProduct = await productService.getProductById(product.id);
const productBySku = await productService.getProductBySku("SKU-LAPTOP-001");

// Get products by category
const electronicsProducts = await productService.getProductsByCategory(
  category.id
);

// Update product
await productService.updateProduct(product.id, {
  name: "Laptop Dell XPS 15 (2024)",
  categoryId: category.id, // Can change category
});

// Deactivate product
await productService.deactivateProduct(product.id);
```

### Variant Attribute Management

Variant attributes define the types of variations available (e.g., Size, Color, Material).

```typescript
// Create variant attributes
const sizeAttribute = await variantAttributeService.createVariantAttribute(
  "Size"
);
const colorAttribute = await variantAttributeService.createVariantAttribute(
  "Color"
);

// Get attribute
const foundAttribute = await variantAttributeService.getVariantAttributeById(
  sizeAttribute.id
);
const attributeByName = await variantAttributeService.getVariantAttributeByName(
  "Size"
);

// Get all attributes
const allAttributes = await variantAttributeService.getAllVariantAttributes();
const activeAttributes = await variantAttributeService.getAllVariantAttributes(
  true
);

// Update attribute
await variantAttributeService.updateVariantAttribute(sizeAttribute.id, {
  name: "Product Size",
});

// Deactivate attribute
await variantAttributeService.deactivateVariantAttribute(sizeAttribute.id);

// Activate attribute
await variantAttributeService.activateVariantAttribute(sizeAttribute.id);
```

### Product Variant Management

Product variants allow you to create different variations of a product (e.g., different sizes, colors).

**Note:** Variants require an existing product. Each variant must have a unique SKU globally and unique attribute values per product.

```typescript
// First, create a product
const category = await categoryService.createCategory("Clothing");
const product = await productService.createProduct(
  "Premium T-Shirt",
  "SKU-TSHIRT-BASE",
  category.id
);

// Create variant attributes (optional but recommended)
await variantAttributeService.createVariantAttribute("Size");
await variantAttributeService.createVariantAttribute("Color");

// Create product variant
const variant = await productVariantService.createProductVariant(
  product.id,
  "SKU-TSHIRT-L-RED",
  {
    Size: "L",
    Color: "Red",
  }
);

// Get variant
const foundVariant = await productVariantService.getProductVariantById(
  variant.id
);
const variantBySku = await productVariantService.getProductVariantBySku(
  "SKU-TSHIRT-L-RED"
);

// Find variant by attributes
const redLarge = await productVariantService.findVariantByAttributes(
  product.id,
  { Size: "L", Color: "Red" }
);

// Get all variants for a product
const allVariants = await productVariantService.getVariantsByProduct(
  product.id
);

// Update variant
await productVariantService.updateProductVariant(variant.id, {
  sku: "SKU-TSHIRT-L-RED-NEW",
  attributeValues: { Size: "XL", Color: "Red" },
});

// Deactivate variant
await productVariantService.deactivateProductVariant(variant.id);

// Activate variant
await productVariantService.activateProductVariant(variant.id);

// Delete variant permanently
await productVariantService.deleteProductVariant(variant.id);
```

### Customer Management

```typescript
// Create customer
const customer = await customerService.createCustomer(
  "John Doe",
  {
    street: "123 Main St",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
    state: "Berlin",
  },
  {
    email: "john.doe@example.com",
    phone: "+49 30 12345678",
  },
  {
    creditLimit: 100000, // €1000.00 in cents
    paymentTerms: PaymentTerms.NET_30,
  }
);

// Get customer
const foundCustomer = await customerService.getCustomerById(customer.id);
const customerByEmail = await customerService.getCustomerByEmail(
  "john.doe@example.com"
);

// Get all customers
const allCustomers = await customerService.getAllCustomers();
const activeCustomers = await customerService.getAllCustomers(true);

// Update customer
await customerService.updateCustomer(customer.id, {
  name: "John Smith",
  address: {
    city: "Munich",
    postalCode: "80331",
  },
  creditLimit: 200000,
});

// Get customer order history
const orderHistory = await customerService.getOrderHistory(customer.id);

// Get order history filtered by status
const completedOrders = await customerService.getOrderHistoryByStatus(
  customer.id,
  OrderStatus.COMPLETED
);

// Get customer order statistics
const stats = await customerService.getCustomerOrderStatistics(customer.id);
console.log(`Total orders: ${stats.totalOrders}`);
console.log(`Total spent: €${(stats.totalSpent / 100).toFixed(2)}`);
console.log(
  `Average order value: €${(stats.averageOrderValue / 100).toFixed(2)}`
);

// Deactivate customer
await customerService.deactivateCustomer(customer.id);

// Activate customer
await customerService.activateCustomer(customer.id);
```

### Customer Groups

```typescript
// Create customer group
const vipGroup = await customerService.createCustomerGroup(
  "VIP Customers",
  "Premium customer tier",
  10 // 10% discount
);

// Get customer group
const foundGroup = await customerService.getCustomerGroupById(vipGroup.id);
const groupByName = await customerService.getCustomerGroupByName(
  "VIP Customers"
);

// Get all customer groups
const allGroups = await customerService.getAllCustomerGroups();
const activeGroups = await customerService.getAllCustomerGroups(true);

// Get customers in a group
const vipCustomers = await customerService.getCustomersByGroup(vipGroup.id);

// Update customer group
await customerService.updateCustomerGroup(vipGroup.id, {
  name: "Premium VIP",
  discountPercentage: 15,
});

// Assign customer to group
await customerService.updateCustomer(customer.id, {
  customerGroupId: vipGroup.id,
});

// Deactivate customer group
await customerService.deactivateCustomerGroup(vipGroup.id);
```

### Warehouse Management

```typescript
// Create warehouse
const warehouse = await warehouseService.createWarehouse(
  "Main Warehouse Berlin"
);

// Get warehouse
const foundWarehouse = await warehouseService.getWarehouseById(warehouse.id);

// Update warehouse
await warehouseService.updateWarehouse(warehouse.id, {
  name: "Main Warehouse Berlin - Location 2",
});

// Deactivate warehouse
await warehouseService.deactivateWarehouse(warehouse.id);
```

### Inventory Management

```typescript
// Set stock
await stockService.setStock(product.id, warehouse.id, 100);

// Get stock
const stock = await stockService.getStock(product.id, warehouse.id);
console.log(`Current stock: ${stock?.quantity}`);

// Increase stock
await stockService.increaseStock(product.id, warehouse.id, 50);

// Decrease stock
await stockService.decreaseStock(product.id, warehouse.id, 25);

// Adjust stock (positive or negative)
await stockService.adjustStock(product.id, warehouse.id, -10);

// Get total stock across all warehouses
const totalStock = await stockService.getTotalStock(product.id);
console.log(`Total stock: ${totalStock}`);

// Get all stock entries for a product
const allStock = await stockService.getStockByProduct(product.id);

// Get all stock entries for a warehouse
const warehouseStock = await stockService.getStockByWarehouse(warehouse.id);
```

### Order Management

**Note:** Orders require a customer. Create a customer first using `customerService.createCustomer()`.

```typescript
// First, create a customer
const customer = await customerService.createCustomer(
  "John Doe",
  {
    street: "123 Main St",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
  },
  { email: "john.doe@example.com" }
);

// Create order (customerId is required)
const order = await orderService.createOrder(customer.id, [
  {
    productId: product.id,
    quantity: 5,
    unitPrice: 1999, // €19.99 in cents
  },
]);

console.log(`Order created: ${order.id}`);
console.log(`Total amount: €${(order.totalAmount / 100).toFixed(2)}`);

// Confirm order (creates reservations)
const confirmedOrder = await orderService.confirmOrder(order.id, warehouse.id);

// Mark as paid
const paidOrder = await orderService.markOrderAsPaid(order.id);

// Ship order (consumes reservations, creates transactions)
const shippedOrder = await orderService.shipOrder(order.id, warehouse.id);

// Complete order
const completedOrder = await orderService.completeOrder(order.id);

// Cancel order (releases reservations)
const cancelledOrder = await orderService.cancelOrder(order.id);

// Return items
await orderService.returnOrderItems(
  order.id,
  [{ productId: product.id, quantity: 2 }],
  warehouse.id
);
```

### Inventory Transactions

```typescript
import { InventoryTransactionType } from "commercio";

// Receipt
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  100,
  InventoryTransactionType.RECEIPT,
  "supplier-order-123"
);

// Shipment
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  50,
  InventoryTransactionType.SHIPMENT,
  "order-456"
);

// Return
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  10,
  InventoryTransactionType.RETURN,
  "order-456"
);

// Adjustment
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  -5,
  InventoryTransactionType.ADJUSTMENT,
  "inventory-audit-789"
);

// Get transaction
const transaction = await transactionService.getTransactionById(transactionId);

// Get all transactions for a product
const transactions = await transactionService.getTransactionsByProduct(
  product.id
);
```

### Reservations

```typescript
// Create reservation
const reservation = await reservationService.createReservation(
  product.id,
  warehouse.id,
  10,
  order.id
);

// Consume reservation
await reservationService.consumeReservation(reservation.id);

// Release reservation
await reservationService.releaseReservation(reservation.id);

// Get all reservations for an order
const reservations = await reservationService.getReservationsByReference(
  order.id
);

// Get all reservations for a product
const productReservations = await reservationService.getReservationsByProduct(
  product.id
);
```

## API Reference

### CategoryService

- `createCategory(name: string, description?: string): Promise<Category>`
- `getCategoryById(id: CategoryId): Promise<Category>`
- `getCategoryByName(name: string): Promise<Category>`
- `getAllCategories(activeOnly?: boolean): Promise<Category[]>`
- `updateCategory(id: CategoryId, updates: Partial<{ name: string; description: string | null }>): Promise<Category>`
- `deactivateCategory(id: CategoryId): Promise<Category>`
- `activateCategory(id: CategoryId): Promise<Category>`

### ProductService

- `createProduct(name: string, sku: string, categoryId: CategoryId): Promise<Product>`
- `getProductById(id: ProductId): Promise<Product>`
- `getProductBySku(sku: string): Promise<Product>`
- `getProductsByCategory(categoryId: CategoryId): Promise<Product[]>`
- `updateProduct(id: ProductId, updates: Partial<{ name: string; sku: string; categoryId: CategoryId; isSellable: boolean; isActive: boolean }>): Promise<Product>`
- `deactivateProduct(id: ProductId): Promise<Product>`
- `activateProduct(id: ProductId): Promise<Product>`

### VariantAttributeService

- `createVariantAttribute(name: string): Promise<VariantAttribute>`
- `getVariantAttributeById(id: VariantAttributeId): Promise<VariantAttribute>`
- `getVariantAttributeByName(name: string): Promise<VariantAttribute>`
- `getAllVariantAttributes(activeOnly?: boolean): Promise<VariantAttribute[]>`
- `updateVariantAttribute(id: VariantAttributeId, updates: Partial<{ name: string }>): Promise<VariantAttribute>`
- `deactivateVariantAttribute(id: VariantAttributeId): Promise<VariantAttribute>`
- `activateVariantAttribute(id: VariantAttributeId): Promise<VariantAttribute>`

### ProductVariantService

- `createProductVariant(productId: ProductId, sku: string, attributeValues: Record<string, string>): Promise<ProductVariant>`
- `getProductVariantById(id: ProductVariantId): Promise<ProductVariant>`
- `getProductVariantBySku(sku: string): Promise<ProductVariant>`
- `getVariantsByProduct(productId: ProductId): Promise<ProductVariant[]>`
- `findVariantByAttributes(productId: ProductId, attributeValues: Record<string, string>): Promise<ProductVariant | null>`
- `updateProductVariant(id: ProductVariantId, updates: Partial<{ sku: string; attributeValues: Record<string, string>; isActive: boolean }>): Promise<ProductVariant>`
- `deactivateProductVariant(id: ProductVariantId): Promise<ProductVariant>`
- `activateProductVariant(id: ProductVariantId): Promise<ProductVariant>`
- `deleteProductVariant(id: ProductVariantId): Promise<void>`

### CustomerService

- `createCustomer(name: string, address: {...}, contact: {...}, options?: {...}): Promise<Customer>`
- `getCustomerById(id: CustomerId): Promise<Customer>`
- `getCustomerByEmail(email: string): Promise<Customer>`
- `getAllCustomers(activeOnly?: boolean): Promise<Customer[]>`
- `getCustomersByGroup(customerGroupId: CustomerGroupId): Promise<Customer[]>`
- `updateCustomer(id: CustomerId, updates: Partial<{...}>): Promise<Customer>`
- `deactivateCustomer(id: CustomerId): Promise<Customer>`
- `activateCustomer(id: CustomerId): Promise<Customer>`
- `getOrderHistory(customerId: CustomerId): Promise<Order[]>`
- `getOrderHistoryByStatus(customerId: CustomerId, status?: string): Promise<Order[]>`
- `getCustomerOrderStatistics(customerId: CustomerId): Promise<{totalOrders, totalSpent, averageOrderValue, ordersByStatus}>`
- `createCustomerGroup(name: string, description?: string, discountPercentage?: number): Promise<CustomerGroup>`
- `getCustomerGroupById(id: CustomerGroupId): Promise<CustomerGroup>`
- `getCustomerGroupByName(name: string): Promise<CustomerGroup>`
- `getAllCustomerGroups(activeOnly?: boolean): Promise<CustomerGroup[]>`
- `updateCustomerGroup(id: CustomerGroupId, updates: Partial<{...}>): Promise<CustomerGroup>`
- `deactivateCustomerGroup(id: CustomerGroupId): Promise<CustomerGroup>`
- `activateCustomerGroup(id: CustomerGroupId): Promise<CustomerGroup>`

### WarehouseService

- `createWarehouse(name: string): Promise<Warehouse>`
- `getWarehouseById(id: WarehouseId): Promise<Warehouse | null>`
- `updateWarehouse(id: WarehouseId, updates: Partial<Warehouse>): Promise<Warehouse>`
- `deactivateWarehouse(id: WarehouseId): Promise<Warehouse>`

### StockService

- `setStock(productId: ProductId, warehouseId: WarehouseId, quantity: number): Promise<Stock>`
- `getStock(productId: ProductId, warehouseId: WarehouseId): Promise<Stock | null>`
- `adjustStock(productId: ProductId, warehouseId: WarehouseId, adjustment: number): Promise<Stock>`
- `increaseStock(productId: ProductId, warehouseId: WarehouseId, quantity: number): Promise<Stock>`
- `decreaseStock(productId: ProductId, warehouseId: WarehouseId, quantity: number): Promise<Stock>`
- `getTotalStock(productId: ProductId): Promise<number>`
- `getStockByProduct(productId: ProductId): Promise<Stock[]>`
- `getStockByWarehouse(warehouseId: WarehouseId): Promise<Stock[]>`

### OrderService

- `createOrder(customerId: string, items: OrderItemInput[]): Promise<Order>`
- `getOrderById(id: OrderId): Promise<Order>`
- `confirmOrder(id: OrderId, warehouseId: WarehouseId): Promise<Order>`
- `markOrderAsPaid(id: OrderId): Promise<Order>`
- `shipOrder(id: OrderId, warehouseId: WarehouseId): Promise<Order>`
- `completeOrder(id: OrderId): Promise<Order>`
- `cancelOrder(id: OrderId): Promise<Order>`
- `returnOrderItems(id: OrderId, items: ReturnItemInput[], warehouseId: WarehouseId): Promise<Order>`

### InventoryTransactionService

- `createTransaction(productId: ProductId, warehouseId: WarehouseId, quantity: number, type: InventoryTransactionType, referenceId?: string): Promise<InventoryTransaction>`
- `getTransactionById(id: InventoryTransactionId): Promise<InventoryTransaction>`
- `getTransactionsByProduct(productId: ProductId): Promise<InventoryTransaction[]>`

### ReservationService

- `createReservation(productId: ProductId, warehouseId: WarehouseId, quantity: number, referenceId: string): Promise<Reservation>`
- `consumeReservation(id: ReservationId): Promise<Reservation>`
- `releaseReservation(id: ReservationId): Promise<Reservation>`
- `getReservationsByReference(referenceId: string): Promise<Reservation[]>`
- `getReservationsByProduct(productId: ProductId): Promise<Reservation[]>`

## Database Schema

The package uses the following tables:

- `categories` - Product categories
- `products` - Products (requires category_id)
- `variant_attributes` - Variant attribute types (Size, Color, etc.)
- `product_variants` - Product variants with attribute values
- `customer_groups` - Customer groups with discount percentages
- `customers` - Customers with address, contact, credit limit, and payment terms
- `warehouses` - Warehouses
- `stock` - Stock levels (Product × Warehouse)
- `inventory_transactions` - Inventory transactions
- `reservations` - Stock reservations
- `orders` - Orders (references customers)
- `order_items` - Order items

**Relationships:**

- Products must belong to a category (`products.category_id` → `categories.id`)
- Product variants belong to products (`product_variants.product_id` → `products.id`)
- Variants store attribute values as JSON (e.g., `{ "Size": "L", "Color": "Red" }`)
- Customers can belong to a customer group (`customers.customer_group_id` → `customer_groups.id`)
- Orders belong to customers (`orders.customer_id` → `customers.id`)
- Stock entries reference products and warehouses
- Orders contain order items that reference products
- Reservations reference products and warehouses
- Inventory transactions reference products and warehouses

## Logging

The package uses Pino for structured logging:

```typescript
import { logger } from "commercio";

// Simple logging
logger.info("Operation started");

// Structured logging
logger.info({ orderId: "123", status: "created" }, "Order created");

// Error logging
logger.error({ error }, "Operation failed");

// Child logger with context
const orderLogger = logger.child({ orderId: "123" });
orderLogger.info("Processing order");
```

Log level can be configured via the `LOG_LEVEL` environment variable:

```env
LOG_LEVEL=debug
```

Available levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

## Development

### Running Tests

```bash
npm run test          # All tests
npm run test:unit     # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # With coverage
```

### Database Migrations

```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

### Build

```bash
npm run build
```

## License

MIT
