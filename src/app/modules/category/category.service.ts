import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";
import generateSlug from "../../utils/generateSlug";

const createCategory = async (payload: {
  name: string;
  description?: string;
}) => {
  // Generate slug
  const slug = generateSlug(payload.name);

  // Check duplicate name
  const isNameExists = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (isNameExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Category already exists with this name",
    );
  }

  // Check duplicate slug
  const isSlugExists = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (isSlugExists) {
    throw new AppError(httpStatus.CONFLICT, "Category slug already exists");
  }

  const category = await prisma.category.create({
    data: {
      ...payload,
      slug,
    },
  });

  return category;
};

const getAllCategories = async (_query: Record<string, unknown>) => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories;
};

const getSingleCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return category;
};

const updateCategory = async (
  id: string,
  payload: {
    name?: string;
    description?: string;
  },
) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  const updateData: {
    name?: string;
    slug?: string;
    description?: string;
  } = {
    description: payload.description,
  };

  if (payload.name) {
    const duplicateName = await prisma.category.findFirst({
      where: {
        name: payload.name,
        NOT: {
          id,
        },
      },
    });

    if (duplicateName) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Category already exists with this name",
      );
    }

    const slug = generateSlug(payload.name);

    const duplicateSlug = await prisma.category.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
    });

    if (duplicateSlug) {
      throw new AppError(httpStatus.CONFLICT, "Category slug already exists");
    }

    updateData.name = payload.name;
    updateData.slug = slug;
  }

  return prisma.category.update({
    where: { id },
    data: updateData,
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      gearItems: true,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (category.gearItems.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category because it contains gear items",
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  return null;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
