import { prisma } from "../lib/prisma";

export const getUserbyEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const getUserbyId = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (userData: any) => {
  return prisma.user.create({
    data: {
      password: userData.password,
      randToken: userData.randToken,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    },
  });
};

export const updateUser = async (id: number, userData: any) => {
  return prisma.user.update({
    where: { id },
    data: userData,
  });
};
