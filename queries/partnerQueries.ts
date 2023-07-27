import { prisma } from "../index";

export async function addPartner(userId1: string, userId2: string) {
  try {
    // assume both users exist in our system
    const user1 = await prisma.user.update({
      where: { id: userId1 },
      data: {
        partners: {
          connect: [
            {
              id: userId2,
            },
          ],
        },
      },
    });
    const user2 = await prisma.user.update({
      where: { id: userId2 },
      data: {
        partners: {
          connect: [
            {
              id: userId1,
            },
          ],
        },
      },
    });

    return { user1, user2 };
  } catch (error) {
    throw error;
  }
}

export async function removePartner(userId1: string, userId2: string) {
  try {
    // assume both users exist in our system
    const user1 = await prisma.user.update({
      where: { id: userId1 },
      data: {
        partners: {
          disconnect: [
            {
              id: userId2,
            },
          ],
        },
      },
    });
    const user2 = await prisma.user.update({
      where: { id: userId2 },
      data: {
        partners: {
          disconnect: [
            {
              id: userId1,
            },
          ],
        },
      },
    });

    return { user1, user2 };
  } catch (error) {
    throw error;
  }
}

export async function getPartnersByPartialUsername(
  partialUsername: string,
  userId: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        partners: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
          },
        },
      },
    });

    const matchingFriends = user?.partners.filter((partner) =>
      partner.name.toLowerCase().includes(partialUsername.toLowerCase())
    );
    return matchingFriends;
  } catch (e) {
    console.log(e);
  }
}
