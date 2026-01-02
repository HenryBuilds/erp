export type CategoryId = string;

export class Category {
  constructor(
    public readonly id: CategoryId,
    public name: string,
    public description: string | null = null,
    public isActive: boolean = true
  ) {
    if (!name) {
      throw new Error("Category name must not be empty");
    }
  }

  /**
   * Factory method: Creates a Category from DB data
   */
  static fromDb(data: {
    id: CategoryId;
    name: string;
    description: string | null;
    isActive: boolean;
  }): Category {
    return new Category(data.id, data.name, data.description, data.isActive);
  }
}
