export const createCustomer = async ({ email, name }: any) => {
  return await prisma.customer.create({
    data: {
      id: "12345",
      name: name,
      email: email,
    } as any,
  });
};
