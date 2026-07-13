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

export const CategoryServices = {
  createCategory,
};
