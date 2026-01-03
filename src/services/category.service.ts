import { CategoryRepository } from "../repositories/category.repository";
import { Category, CategoryId } from "../modules/category/category.model";

/**
 * Service for Category business logic
 */
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Creates a new category
   */
  async createCategory(
    name: string,
    description?: string
  ): Promise<Category> {
    // Trim name before checking for duplicates
    const trimmedName = name.trim();
    
    // Check if category name already exists
    const existingCategory = await this.categoryRepository.findByName(trimmedName);
    if (existingCategory) {
      throw new Error(`Category with name "${trimmedName}" already exists`);
    }

    const category = new Category(
      crypto.randomUUID(),
      trimmedName,
      description ?? null
    );

    return await this.categoryRepository.create(category);
  }

  /**
   * Gets a category by ID
   */
  async getCategoryById(id: CategoryId): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with ID "${id}" not found`);
    }
    return category;
  }

  /**
   * Gets a category by name
   */
  async getCategoryByName(name: string): Promise<Category> {
    const category = await this.categoryRepository.findByName(name);
    if (!category) {
      throw new Error(`Category with name "${name}" not found`);
    }
    return category;
  }

  /**
   * Gets all categories
   */
  async getAllCategories(activeOnly: boolean = false): Promise<Category[]> {
    if (activeOnly) {
      return await this.categoryRepository.findAllActive();
    }
    return await this.categoryRepository.findAll();
  }

  /**
   * Updates a category
   */
  async updateCategory(
    id: CategoryId,
    updates: Partial<{ name: string; description: string | null }>
  ): Promise<Category> {
    const category = await this.getCategoryById(id);

    if (updates.name !== undefined) {
      // Trim name before checking for duplicates
      const trimmedName = updates.name.trim();
      
      // Check if new name already exists (excluding current category)
      const existingCategory = await this.categoryRepository.findByName(
        trimmedName
      );
      if (existingCategory && existingCategory.id !== id) {
        throw new Error(`Category with name "${trimmedName}" already exists`);
      }
      category.name = trimmedName;
    }

    if (updates.description !== undefined) {
      category.description = updates.description;
    }

    return await this.categoryRepository.update(category);
  }

  /**
   * Deactivates a category
   */
  async deactivateCategory(id: CategoryId): Promise<Category> {
    return await this.categoryRepository.deactivate(id);
  }

  /**
   * Activates a category
   */
  async activateCategory(id: CategoryId): Promise<Category> {
    return await this.categoryRepository.activate(id);
  }
}

