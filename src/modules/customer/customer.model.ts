export type CustomerId = string;
export type CustomerGroupId = string;

export enum PaymentTerms {
  NET_15 = "NET_15", // Payment due 15 days after invoice
  NET_30 = "NET_30", // Payment due 30 days after invoice
  NET_60 = "NET_60", // Payment due 60 days after invoice
  DUE_ON_RECEIPT = "DUE_ON_RECEIPT", // Payment due immediately
  PREPAID = "PREPAID", // Payment required before shipment
}

export class CustomerAddress {
  constructor(
    public street: string,
    public city: string,
    public postalCode: string,
    public country: string,
    public state?: string
  ) {
    if (!street || !city || !postalCode || !country) {
      throw new Error("Address fields (street, city, postalCode, country) are required");
    }
  }

  static fromDb(data: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string | null;
  }): CustomerAddress {
    return new CustomerAddress(
      data.street,
      data.city,
      data.postalCode,
      data.country,
      data.state ?? undefined
    );
  }

  toDb(): {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    state: string | null;
  } {
    return {
      street: this.street,
      city: this.city,
      postalCode: this.postalCode,
      country: this.country,
      state: this.state ?? null,
    };
  }
}

export class CustomerContact {
  constructor(
    public email: string,
    public phone?: string
  ) {
    if (!email || !email.trim()) {
      throw new Error("Email is required");
    }
    // Basic email validation
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }
  }

  static fromDb(data: {
    email: string;
    phone: string | null;
  }): CustomerContact {
    return new CustomerContact(data.email, data.phone ?? undefined);
  }

  toDb(): {
    email: string;
    phone: string | null;
  } {
    return {
      email: this.email,
      phone: this.phone ?? null,
    };
  }
}

export class Customer {
  constructor(
    public readonly id: CustomerId,
    public name: string,
    public address: CustomerAddress,
    public contact: CustomerContact,
    public creditLimit: number = 0, // in cents
    public paymentTerms: PaymentTerms = PaymentTerms.NET_30,
    public customerGroupId: CustomerGroupId | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error("Customer name must not be empty");
    }
    if (creditLimit < 0) {
      throw new Error("Credit limit must not be negative");
    }
  }

  /**
   * Factory method: Creates a Customer from DB data
   */
  static fromDb(data: {
    id: CustomerId;
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    state: string | null;
    email: string;
    phone: string | null;
    creditLimit: number;
    paymentTerms: PaymentTerms;
    customerGroupId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Customer {
    const address = CustomerAddress.fromDb({
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
      state: data.state,
    });

    const contact = CustomerContact.fromDb({
      email: data.email,
      phone: data.phone,
    });

    return new Customer(
      data.id,
      data.name,
      address,
      contact,
      data.creditLimit,
      data.paymentTerms,
      data.customerGroupId,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}

export class CustomerGroup {
  constructor(
    public readonly id: CustomerGroupId,
    public name: string,
    public description: string | null = null,
    public discountPercentage: number = 0, // 0-100
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error("Customer group name must not be empty");
    }
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error("Discount percentage must be between 0 and 100");
    }
  }

  /**
   * Factory method: Creates a CustomerGroup from DB data
   */
  static fromDb(data: {
    id: CustomerGroupId;
    name: string;
    description: string | null;
    discountPercentage: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CustomerGroup {
    return new CustomerGroup(
      data.id,
      data.name,
      data.description,
      data.discountPercentage,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}

