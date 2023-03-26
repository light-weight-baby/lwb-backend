import { PrismaClient } from "@prisma/client";
import { getProfileById, getProfileByUsername } from "./profileQueries";

export const prisma = new PrismaClient();

export async function createUser(
  username: string,
  email: string,
  password: string
) {
  try {
    await prisma.user.create({
      data: {
        username,
        email,
        password,
        picture:
          "https://vectorified.com/images/no-profile-picture-icon-28.png",
        friends: {
          connect: [],
        },
        friendRequests: {
          connect: [],
        },
      },
    });
  } catch (error) {
    console.error("create user error", error);
    throw new Error(
      `Username '${username}' or email '${email}' already exists.`
    );
  }
}

export async function updateFriendRequest(username: string, id: number) {
  try {
    const sentUser = await getProfileById(id);
    const updatedUser = await prisma.user.update({
      where: { username: username },
      data: {
        friendRequests: {
          connect: [
            {
              username: sentUser?.username,
            },
          ],
        },
      },
    });
    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

//so to remove friendRequest received you would not only have to remove the person from the current user
//friendrequest you would also have to go to the one that sent it and remove the sent one

export async function updateFriendRequestSent(username: string, id: number) {
  try {
    const receivingUser = await getProfileByUsername(username);
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        friendRequestsSent: {
          connect: [
            {
              username: receivingUser?.username,
            },
          ],
        },
      },
    });
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

export async function removeFriendSent(username: string, id: number) {
  try {
    //username = the person that sent, and the id = the current user.
    const sentUser = await getProfileByUsername(username);
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        friendRequestsSent: {
          disconnect: [
            {
              id: sentUser?.id,
            },
          ],
        },
      },
    });
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

export async function removeFriendReceived(username: string, id: number) {
  try {
    //username = user to remove friend received from, id = user who sent the request and who to remove
    const sentUser = await getProfileById(id);
    const updatedUser = await prisma.user.update({
      where: { username: username },
      data: {
        friendRequests: {
          disconnect: [
            {
              id: sentUser.id,
            },
          ],
        },
      },
    });
    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function addFriend(username: string, id: number) {
  try {
    //username = the person who sent it, and the id =  the current user
    const receivingUser = await getProfileById(id);
    const sentUser = await getProfileByUsername(username);
    const updatedCurrentUser = await prisma.user.update({
      where: { id: id },
      data: {
        friends: {
          connect: [
            {
              username: sentUser?.username,
            },
          ],
        },
      },
    });
    const updatedOppositeUser = await prisma.user.update({
      where: { id: sentUser?.id },
      data: {
        friends: {
          connect: [
            {
              username: receivingUser?.username,
            },
          ],
        },
      },
    });

    return { updatedCurrentUser, updatedOppositeUser };
  } catch (error) {
    throw error;
  }
}

export async function removeFriend(username: string, id: number) {
  try {
    //username = the person who sent it, and the id =  the current user
    const receivingUser = await getProfileById(id);
    const sentUser = await getProfileByUsername(username);
    const updatedCurrentUser = await prisma.user.update({
      where: { id: id },
      data: {
        friends: {
          disconnect: [
            {
              username: sentUser?.username,
            },
          ],
        },
      },
    });
    const updatedOppositeUser = await prisma.user.update({
      where: { id: sentUser?.id },
      data: {
        friends: {
          disconnect: [
            {
              username: receivingUser?.username,
            },
          ],
        },
      },
    });

    return { updatedCurrentUser, updatedOppositeUser };
  } catch (error) {
    throw error;
  }
}
