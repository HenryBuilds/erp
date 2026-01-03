import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerGroupRepository } from "../repositories/customer-group.repository";
import { OrderRepository } from "../repositories/order.repository";
import {
  Customer,
  CustomerId,
  CustomerAddress,
  CustomerContact,
  PaymentTerms,
  CustomerGroup,
  CustomerGroupId,
} from "../modules/customer/customer.model";
import { Order } from "../modules/order/order.model";

/**
 * Service for Customer business logic
 */
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerGroupRepository: CustomerGroupRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  /**
   * Creates a new customer
   */
  async createCustomer(
    name: string,
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
      state?: string;
    },
    contact: {
      email: string;
      phone?: string;
    },
    options?: {
      creditLimit?: number;
      paymentTerms?: PaymentTerms;
      customerGroupId?: CustomerGroupId;
    }
  ): Promise<Customer> {
    // Trim name before checking for duplicates
    const trimmedName = name.trim();

    // Check if email already exists
    const existingCustomer = await this.customerRepository.findByEmail(contact.email);
    if (existingCustomer) {
      throw new Error(`Customer with email "${contact.email}" already exists`);
    }

    // Validate customer group if provided
    if (options?.customerGroupId) {
      const group = await this.customerGroupRepository.findById(options.customerGroupId);
      if (!group) {
        throw new Error(`Customer group with ID "${options.customerGroupId}" not found`);
      }
    }

    const customerAddress = new CustomerAddress(
      address.street,
      address.city,
      address.postalCode,
      address.country,
      address.state
    );

    const customerContact = new CustomerContact(contact.email, contact.phone);

    const customer = new Customer(
      crypto.randomUUID(),
      trimmedName,
      customerAddress,
      customerContact,
      options?.creditLimit ?? 0,
      options?.paymentTerms ?? PaymentTerms.NET_30,
      options?.customerGroupId ?? null
    );

    return await this.customerRepository.create(customer);
  }

  /**
   * Gets a customer by ID
   */
  async getCustomerById(id: CustomerId): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new Error(`Customer with ID "${id}" not found`);
    }
    return customer;
  }

  /**
   * Gets a customer by email
   */
  async getCustomerByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new Error(`Customer with email "${email}" not found`);
    }
    return customer;
  }

  /**
   * Gets all customers
   */
  async getAllCustomers(activeOnly: boolean = false): Promise<Customer[]> {
    if (activeOnly) {
      return await this.customerRepository.findAllActive();
    }
    return await this.customerRepository.findAll();
  }

  /**
   * Gets all customers in a group
   */
  async getCustomersByGroup(customerGroupId: CustomerGroupId): Promise<Customer[]> {
    // Validate group exists
    await this.getCustomerGroupById(customerGroupId);
    return await this.customerRepository.findByGroup(customerGroupId);
  }

  /**
   * Updates a customer
   */
  async updateCustomer(
    id: CustomerId,
    updates: Partial<{
      name: string;
      address: {
        street?: string;
        city?: string;
        postalCode?: string;
        country?: string;
        state?: string;
      };
      contact: {
        email?: string;
        phone?: string;
      };
      creditLimit: number;
      paymentTerms: PaymentTerms;
      customerGroupId: CustomerGroupId | null;
    }>
  ): Promise<Customer> {
    const customer = await this.getCustomerById(id);

    if (updates.name !== undefined) {
      customer.name = updates.name.trim();
    }

    if (updates.address !== undefined) {
      const addressUpdates = updates.address;
      if (addressUpdates.street !== undefined) customer.address.street = addressUpdates.street;
      if (addressUpdates.city !== undefined) customer.address.city = addressUpdates.city;
      if (addressUpdates.postalCode !== undefined)
        customer.address.postalCode = addressUpdates.postalCode;
      if (addressUpdates.country !== undefined) customer.address.country = addressUpdates.country;
      if (addressUpdates.state !== undefined) customer.address.state = addressUpdates.state;
    }

    if (updates.contact !== undefined) {
      const contactUpdates = updates.contact;
      if (contactUpdates.email !== undefined) {
        // Check if email already exists (excluding current customer)
        const existingCustomer = await this.customerRepository.findByEmail(contactUpdates.email);
        if (existingCustomer && existingCustomer.id !== id) {
          throw new Error(`Customer with email "${contactUpdates.email}" already exists`);
        }
        customer.contact.email = contactUpdates.email;
      }
      if (contactUpdates.phone !== undefined) customer.contact.phone = contactUpdates.phone;
    }

    if (updates.creditLimit !== undefined) {
      if (updates.creditLimit < 0) {
        throw new Error("Credit limit must not be negative");
      }
      customer.creditLimit = updates.creditLimit;
    }

    if (updates.paymentTerms !== undefined) {
      customer.paymentTerms = updates.paymentTerms;
    }

    if (updates.customerGroupId !== undefined) {
      if (updates.customerGroupId !== null) {
        // Validate group exists
        await this.getCustomerGroupById(updates.customerGroupId);
      }
      customer.customerGroupId = updates.customerGroupId;
    }

    customer.updatedAt = new Date();
    return await this.customerRepository.update(customer);
  }

  /**
   * Deactivates a customer
   */
  async deactivateCustomer(id: CustomerId): Promise<Customer> {
    return await this.customerRepository.deactivate(id);
  }

  /**
   * Activates a customer
   */
  async activateCustomer(id: CustomerId): Promise<Customer> {
    return await this.customerRepository.activate(id);
  }

  /**
   * Creates a new customer group
   */
  async createCustomerGroup(
    name: string,
    description?: string,
    discountPercentage: number = 0
  ): Promise<CustomerGroup> {
    const trimmedName = name.trim();

    // Check if group name already exists
    const existingGroup = await this.customerGroupRepository.findByName(trimmedName);
    if (existingGroup) {
      throw new Error(`Customer group with name "${trimmedName}" already exists`);
    }

    const group = new CustomerGroup(
      crypto.randomUUID(),
      trimmedName,
      description ?? null,
      discountPercentage
    );

    return await this.customerGroupRepository.create(group);
  }

  /**
   * Gets a customer group by ID
   */
  async getCustomerGroupById(id: CustomerGroupId): Promise<CustomerGroup> {
    const group = await this.customerGroupRepository.findById(id);
    if (!group) {
      throw new Error(`Customer group with ID "${id}" not found`);
    }
    return group;
  }

  /**
   * Gets a customer group by name
   */
  async getCustomerGroupByName(name: string): Promise<CustomerGroup> {
    const group = await this.customerGroupRepository.findByName(name);
    if (!group) {
      throw new Error(`Customer group with name "${name}" not found`);
    }
    return group;
  }

  /**
   * Gets all customer groups
   */
  async getAllCustomerGroups(activeOnly: boolean = false): Promise<CustomerGroup[]> {
    if (activeOnly) {
      return await this.customerGroupRepository.findAllActive();
    }
    return await this.customerGroupRepository.findAll();
  }

  /**
   * Updates a customer group
   */
  async updateCustomerGroup(
    id: CustomerGroupId,
    updates: Partial<{
      name: string;
      description: string | null;
      discountPercentage: number;
    }>
  ): Promise<CustomerGroup> {
    const group = await this.getCustomerGroupById(id);

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      // Check if new name already exists (excluding current group)
      const existingGroup = await this.customerGroupRepository.findByName(trimmedName);
      if (existingGroup && existingGroup.id !== id) {
        throw new Error(`Customer group with name "${trimmedName}" already exists`);
      }
      group.name = trimmedName;
    }

    if (updates.description !== undefined) {
      group.description = updates.description;
    }

    if (updates.discountPercentage !== undefined) {
      if (updates.discountPercentage < 0 || updates.discountPercentage > 100) {
        throw new Error("Discount percentage must be between 0 and 100");
      }
      group.discountPercentage = updates.discountPercentage;
    }

    group.updatedAt = new Date();
    return await this.customerGroupRepository.update(group);
  }

  /**
   * Deactivates a customer group
   */
  async deactivateCustomerGroup(id: CustomerGroupId): Promise<CustomerGroup> {
    return await this.customerGroupRepository.deactivate(id);
  }

  /**
   * Activates a customer group
   */
  async activateCustomerGroup(id: CustomerGroupId): Promise<CustomerGroup> {
    return await this.customerGroupRepository.activate(id);
  }

  /**
   * Gets order history for a customer
   */
  async getOrderHistory(customerId: CustomerId): Promise<Order[]> {
    // Validate customer exists
    await this.getCustomerById(customerId);
    return await this.orderRepository.findByCustomer(customerId);
  }

  /**
   * Gets order history for a customer with optional status filter
   */
  async getOrderHistoryByStatus(
    customerId: CustomerId,
    status?: string
  ): Promise<Order[]> {
    const orders = await this.getOrderHistory(customerId);
    if (status) {
      return orders.filter((order) => order.status === status);
    }
    return orders;
  }

  /**
   * Gets customer order statistics
   */
  async getCustomerOrderStatistics(customerId: CustomerId): Promise<{
    totalOrders: number;
    totalSpent: number; // in cents
    averageOrderValue: number; // in cents
    ordersByStatus: Record<string, number>;
  }> {
    const orders = await this.getOrderHistory(customerId);

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const ordersByStatus: Record<string, number> = {};
    orders.forEach((order) => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    return {
      totalOrders,
      totalSpent,
      averageOrderValue: Math.round(averageOrderValue),
      ordersByStatus,
    };
  }
}

