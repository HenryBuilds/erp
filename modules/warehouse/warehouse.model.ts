export type WarehouseId = string;

export class Warehouse {
  constructor(
    public readonly id: WarehouseId,
    public name: string,
    public shippingEnabled: boolean = true,
    public isActive: boolean = true
  ) {
    if (!name) {
      throw new Error("Warehouse name must not be empty");
    }
  }
}
