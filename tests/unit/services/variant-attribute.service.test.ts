import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { createVariantAttributeService } from "../../../src/services/factory";
import { VariantAttributeService } from "../../../src/services/variant-attribute.service";
import { VariantAttribute } from "../../../src/modules/product/variant-attribute.model";
import { TestDbHelper } from "../../helpers/db";

describe("VariantAttributeService", () => {
  let variantAttributeService: VariantAttributeService;

  beforeEach(async () => {
    // Clear database before each test to ensure clean state
    await TestDbHelper.clearAllTables();
    
    // Create services after clearing database
    variantAttributeService = createVariantAttributeService();
  });

  describe("createVariantAttribute", () => {
    it("should create a variant attribute successfully", async () => {
      const name = `Size-${Date.now()}`;
      const attribute = await variantAttributeService.createVariantAttribute(name);

      expect(attribute).toBeInstanceOf(VariantAttribute);
      expect(attribute.name).toBe(name);
      expect(attribute.isActive).toBe(true);
    });

    it("should trim whitespace from attribute name", async () => {
      const name = `  Color-${Date.now()}  `;
      const attribute = await variantAttributeService.createVariantAttribute(name);

      expect(attribute.name).toBe(name.trim());
    });

    it("should throw error if attribute name already exists", async () => {
      const name = `Material-${Date.now()}`;
      await variantAttributeService.createVariantAttribute(name);

      await expect(
        variantAttributeService.createVariantAttribute(name)
      ).rejects.toThrow("already exists");
    });
  });

  describe("getVariantAttributeById", () => {
    it("should return attribute if exists", async () => {
      const name = `Size-${Date.now()}-001`;
      const created = await variantAttributeService.createVariantAttribute(name);

      const attribute = await variantAttributeService.getVariantAttributeById(created.id);

      expect(attribute).toBeInstanceOf(VariantAttribute);
      expect(attribute.id).toBe(created.id);
    });

    it("should throw error if attribute not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        variantAttributeService.getVariantAttributeById(nonExistentId)
      ).rejects.toThrow("not found");
    });
  });

  describe("getVariantAttributeByName", () => {
    it("should return attribute by name", async () => {
      const name = `Color-${Date.now()}-002`;
      await variantAttributeService.createVariantAttribute(name);

      const attribute = await variantAttributeService.getVariantAttributeByName(name);

      expect(attribute).toBeInstanceOf(VariantAttribute);
      expect(attribute.name).toBe(name);
    });

    it("should throw error if name not found", async () => {
      await expect(
        variantAttributeService.getVariantAttributeByName(`NON-EXISTENT-${Date.now()}`)
      ).rejects.toThrow("not found");
    });
  });

  describe("getAllVariantAttributes", () => {
    it("should return all attributes", async () => {
      await variantAttributeService.createVariantAttribute(`Size-${Date.now()}-003`);
      await variantAttributeService.createVariantAttribute(`Color-${Date.now()}-004`);

      const attributes = await variantAttributeService.getAllVariantAttributes();

      expect(attributes.length).toBeGreaterThanOrEqual(2);
    });

    it("should return only active attributes when activeOnly is true", async () => {
      const activeName = `Size-${Date.now()}-005`;
      const inactiveName = `Color-${Date.now()}-006`;

      const activeAttribute = await variantAttributeService.createVariantAttribute(activeName);
      const inactiveAttribute = await variantAttributeService.createVariantAttribute(inactiveName);
      await variantAttributeService.deactivateVariantAttribute(inactiveAttribute.id);

      const attributes = await variantAttributeService.getAllVariantAttributes(true);

      expect(attributes.some((a) => a.id === activeAttribute.id)).toBe(true);
      expect(attributes.some((a) => a.id === inactiveAttribute.id)).toBe(false);
    });
  });

  describe("updateVariantAttribute", () => {
    it("should update attribute successfully", async () => {
      const name = `Size-${Date.now()}-007`;
      const created = await variantAttributeService.createVariantAttribute(name);

      const updated = await variantAttributeService.updateVariantAttribute(created.id, {
        name: "Updated Size",
      });

      expect(updated.name).toBe("Updated Size");
    });

    it("should throw error if new name already exists", async () => {
      const name1 = `Size-${Date.now()}-008`;
      const name2 = `Color-${Date.now()}-009`;
      await variantAttributeService.createVariantAttribute(name1);
      const attribute2 = await variantAttributeService.createVariantAttribute(name2);

      await expect(
        variantAttributeService.updateVariantAttribute(attribute2.id, { name: name1 })
      ).rejects.toThrow("already exists");
    });
  });

  describe("deactivateVariantAttribute", () => {
    it("should deactivate attribute", async () => {
      const name = `Size-${Date.now()}-010`;
      const created = await variantAttributeService.createVariantAttribute(name);

      const deactivated = await variantAttributeService.deactivateVariantAttribute(created.id);

      expect(deactivated.isActive).toBe(false);
    });
  });

  describe("activateVariantAttribute", () => {
    it("should activate attribute", async () => {
      const name = `Size-${Date.now()}-011`;
      const created = await variantAttributeService.createVariantAttribute(name);
      await variantAttributeService.deactivateVariantAttribute(created.id);

      const activated = await variantAttributeService.activateVariantAttribute(created.id);

      expect(activated.isActive).toBe(true);
    });
  });
});



