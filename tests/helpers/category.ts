import { CategoryService } from "../../src/services/category.service";
import { CategoryRepository } from "../../src/repositories/category.repository";

let categoryServiceInstance: CategoryService | null = null;

/**
 * Helper function to get or create a test category
 * This ensures we have a category available for product creation in tests
 */
export async function getOrCreateTestCategory(name?: string): Promise<string> {
  if (!categoryServiceInstance) {
    const categoryRepo = new CategoryRepository();
    categoryServiceInstance = new CategoryService(categoryRepo);
  }

  const categoryName = name || `Test-Category-${Date.now()}`;
  
  try {
    const category = await categoryServiceInstance.getCategoryByName(categoryName);
    return category.id;
  } catch {
    // Category doesn't exist, create it
    const category = await categoryServiceInstance.createCategory(categoryName);
    return category.id;
  }
}

