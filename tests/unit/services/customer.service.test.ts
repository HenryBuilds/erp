import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { CustomerService } from "../../../src/services/customer.service";
import {
  Customer,
  CustomerGroup,
  PaymentTerms,
} from "../../../src/modules/customer/customer.model";
import { OrderStatus } from "../../../src/modules/order/order.model";
import { TestDbHelper } from "../../helpers/db";

describe("CustomerService", () => {
  let customerService: CustomerService;
  let categoryService: any;
  let productService: any;
  let orderService: any;
  let warehouseService: any;
  let stockService: any;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    customerService = services.customerService;
    categoryService = services.categoryService;
    productService = services.productService;
    orderService = services.orderService;
    warehouseService = services.warehouseService;
    stockService = services.stockService;
  });

  describe("createCustomer", () => {
    it("should create a customer successfully", async () => {
      const customer = await customerService.createCustomer(
        "John Doe",
        {
          street: "123 Main St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        {
          email: `john.doe.${Date.now()}@example.com`,
          phone: "+49 30 12345678",
        },
        {
          creditLimit: 100000, // €1000.00 in cents
          paymentTerms: PaymentTerms.NET_30,
        }
      );

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.name).toBe("John Doe");
      expect(customer.address.street).toBe("123 Main St");
      expect(customer.address.city).toBe("Berlin");
      expect(customer.contact.email).toContain("@example.com");
      expect(customer.creditLimit).toBe(100000);
      expect(customer.paymentTerms).toBe(PaymentTerms.NET_30);
      expect(customer.isActive).toBe(true);
    });

    it("should create customer without optional fields", async () => {
      const customer = await customerService.createCustomer(
        "Jane Smith",
        {
          street: "456 Oak Ave",
          city: "Munich",
          postalCode: "80331",
          country: "Germany",
        },
        {
          email: `jane.smith.${Date.now()}@example.com`,
        }
      );

      expect(customer.contact.phone).toBeUndefined();
      expect(customer.creditLimit).toBe(0);
      expect(customer.paymentTerms).toBe(PaymentTerms.NET_30);
      expect(customer.customerGroupId).toBeNull();
    });

    it("should throw error if email already exists", async () => {
      const email = `duplicate.${Date.now()}@example.com`;
      await customerService.createCustomer(
        "Customer 1",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email }
      );

      await expect(
        customerService.createCustomer(
          "Customer 2",
          {
            street: "456 St",
            city: "Berlin",
            postalCode: "10115",
            country: "Germany",
          },
          { email }
        )
      ).rejects.toThrow("already exists");
    });

    it("should throw error if customer group does not exist", async () => {
      await expect(
        customerService.createCustomer(
          "Customer",
          {
            street: "123 St",
            city: "Berlin",
            postalCode: "10115",
            country: "Germany",
          },
          { email: `test.${Date.now()}@example.com` },
          {
            customerGroupId: crypto.randomUUID(),
          }
        )
      ).rejects.toThrow("not found");
    });
  });

  describe("getCustomerById", () => {
    it("should return customer if exists", async () => {
      const created = await customerService.createCustomer(
        "Test Customer",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `test.${Date.now()}@example.com` }
      );

      const customer = await customerService.getCustomerById(created.id);

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBe(created.id);
    });

    it("should throw error if customer not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        customerService.getCustomerById(nonExistentId)
      ).rejects.toThrow("not found");
    });
  });

  describe("getCustomerByEmail", () => {
    it("should return customer by email", async () => {
      const email = `test.${Date.now()}@example.com`;
      await customerService.createCustomer(
        "Test Customer",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email }
      );

      const customer = await customerService.getCustomerByEmail(email);

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.contact.email).toBe(email);
    });

    it("should throw error if email not found", async () => {
      await expect(
        customerService.getCustomerByEmail(
          `nonexistent.${Date.now()}@example.com`
        )
      ).rejects.toThrow("not found");
    });
  });

  describe("getAllCustomers", () => {
    it("should return all customers", async () => {
      await customerService.createCustomer(
        "Customer 1",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `customer1.${Date.now()}@example.com` }
      );
      await customerService.createCustomer(
        "Customer 2",
        {
          street: "456 St",
          city: "Munich",
          postalCode: "80331",
          country: "Germany",
        },
        { email: `customer2.${Date.now()}@example.com` }
      );

      const customers = await customerService.getAllCustomers();

      expect(customers.length).toBeGreaterThanOrEqual(2);
    });

    it("should return only active customers when activeOnly is true", async () => {
      const activeCustomer = await customerService.createCustomer(
        "Active Customer",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `active.${Date.now()}@example.com` }
      );
      const inactiveCustomer = await customerService.createCustomer(
        "Inactive Customer",
        {
          street: "456 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `inactive.${Date.now()}@example.com` }
      );
      await customerService.deactivateCustomer(inactiveCustomer.id);

      const customers = await customerService.getAllCustomers(true);

      expect(customers.some((c) => c.id === activeCustomer.id)).toBe(true);
      expect(customers.some((c) => c.id === inactiveCustomer.id)).toBe(false);
    });
  });

  describe("updateCustomer", () => {
    it("should update customer successfully", async () => {
      const created = await customerService.createCustomer(
        "Original Name",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `original.${Date.now()}@example.com` }
      );

      const updated = await customerService.updateCustomer(created.id, {
        name: "Updated Name",
        address: {
          city: "Munich",
          postalCode: "80331",
        },
        creditLimit: 50000,
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.address.city).toBe("Munich");
      expect(updated.address.postalCode).toBe("80331");
      expect(updated.creditLimit).toBe(50000);
    });

    it("should throw error if new email already exists", async () => {
      const email1 = `email1.${Date.now()}@example.com`;
      const email2 = `email2.${Date.now()}@example.com`;
      await customerService.createCustomer(
        "Customer 1",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: email1 }
      );
      const customer2 = await customerService.createCustomer(
        "Customer 2",
        {
          street: "456 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: email2 }
      );

      await expect(
        customerService.updateCustomer(customer2.id, {
          contact: { email: email1 },
        })
      ).rejects.toThrow("already exists");
    });
  });

  describe("createCustomerGroup", () => {
    it("should create a customer group successfully", async () => {
      const groupName = `VIP Customers-${Date.now()}`;
      const group = await customerService.createCustomerGroup(
        groupName,
        "Premium customer tier",
        10
      );

      expect(group).toBeInstanceOf(CustomerGroup);
      expect(group.name).toBe(groupName);
      expect(group.description).toBe("Premium customer tier");
      expect(group.discountPercentage).toBe(10);
      expect(group.isActive).toBe(true);
    });

    it("should throw error if group name already exists", async () => {
      const name = `Group-${Date.now()}`;
      await customerService.createCustomerGroup(name);

      await expect(customerService.createCustomerGroup(name)).rejects.toThrow(
        "already exists"
      );
    });
  });

  describe("getCustomersByGroup", () => {
    it("should return all customers in a group", async () => {
      const groupName = `Test Group-${Date.now()}`;
      const group = await customerService.createCustomerGroup(groupName);
      const customer1 = await customerService.createCustomer(
        "Customer 1",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `customer1.${Date.now()}@example.com` },
        { customerGroupId: group.id }
      );
      const customer2 = await customerService.createCustomer(
        "Customer 2",
        {
          street: "456 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `customer2.${Date.now()}@example.com` },
        { customerGroupId: group.id }
      );

      const customers = await customerService.getCustomersByGroup(group.id);

      expect(customers.length).toBe(2);
      expect(customers.some((c) => c.id === customer1.id)).toBe(true);
      expect(customers.some((c) => c.id === customer2.id)).toBe(true);
    });
  });

  describe("getOrderHistory", () => {
    it("should return all orders for a customer", async () => {
      const customer = await customerService.createCustomer(
        "Test Customer",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `test.${Date.now()}@example.com` }
      );

      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const order1 = await orderService.createOrder(customer.id, [
        { productId: product.id, quantity: 2, unitPrice: 10000 },
      ]);
      const order2 = await orderService.createOrder(customer.id, [
        { productId: product.id, quantity: 1, unitPrice: 15000 },
      ]);

      const orderHistory = await customerService.getOrderHistory(customer.id);

      expect(orderHistory.length).toBe(2);
      expect(orderHistory.some((o) => o.id === order1.id)).toBe(true);
      expect(orderHistory.some((o) => o.id === order2.id)).toBe(true);
    });

    it("should throw error if customer not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        customerService.getOrderHistory(nonExistentId)
      ).rejects.toThrow("not found");
    });

    it("should return empty array if customer has no orders", async () => {
      const customer = await customerService.createCustomer(
        "Test Customer",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `test.${Date.now()}@example.com` }
      );

      const orderHistory = await customerService.getOrderHistory(customer.id);

      expect(orderHistory).toEqual([]);
    });
  });

  describe("getOrderHistoryByStatus", () => {
    it("should return orders filtered by status", async () => {
      const customer = await customerService.createCustomer(
        "Test Customer",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `test.${Date.now()}@example.com` }
      );

      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const warehouse = await warehouseService.createWarehouse(
        "Test Warehouse"
      );
      await stockService.setStock(product.id, warehouse.id, 100);

      const order1 = await orderService.createOrder(customer.id, [
        { productId: product.id, quantity: 2, unitPrice: 10000 },
      ]);
      const order2 = await orderService.createOrder(customer.id, [
        { productId: product.id, quantity: 1, unitPrice: 15000 },
      ]);

      await orderService.confirmOrder(order1.id, warehouse.id);

      const createdOrders = await customerService.getOrderHistoryByStatus(
        customer.id,
        OrderStatus.CREATED
      );
      const confirmedOrders = await customerService.getOrderHistoryByStatus(
        customer.id,
        OrderStatus.CONFIRMED
      );

      expect(createdOrders.length).toBe(1);
      expect(createdOrders[0].id).toBe(order2.id);
      expect(confirmedOrders.length).toBe(1);
      expect(confirmedOrders[0].id).toBe(order1.id);
    });
  });

  describe("getCustomerOrderStatistics", () => {
    it("should return correct statistics for customer with orders", async () => {
      const customer = await customerService.createCustomer(
        "Test Customer",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `test.${Date.now()}@example.com` }
      );

      const category = await categoryService.createCategory(
        `Category-${Date.now()}`
      );
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      await orderService.createOrder(customer.id, [
        { productId: product.id, quantity: 2, unitPrice: 10000 }, // €200.00
      ]);
      await orderService.createOrder(customer.id, [
        { productId: product.id, quantity: 1, unitPrice: 15000 }, // €150.00
      ]);

      const stats = await customerService.getCustomerOrderStatistics(
        customer.id
      );

      expect(stats.totalOrders).toBe(2);
      expect(stats.totalSpent).toBe(35000); // €350.00 in cents
      expect(stats.averageOrderValue).toBe(17500); // €175.00 in cents
      expect(stats.ordersByStatus[OrderStatus.CREATED]).toBe(2);
    });

    it("should return zero statistics for customer with no orders", async () => {
      const customer = await customerService.createCustomer(
        "Test Customer",
        {
          street: "123 St",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany",
        },
        { email: `test.${Date.now()}@example.com` }
      );

      const stats = await customerService.getCustomerOrderStatistics(
        customer.id
      );

      expect(stats.totalOrders).toBe(0);
      expect(stats.totalSpent).toBe(0);
      expect(stats.averageOrderValue).toBe(0);
      expect(Object.keys(stats.ordersByStatus).length).toBe(0);
    });
  });
});
