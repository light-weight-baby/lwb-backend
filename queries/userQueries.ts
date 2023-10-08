import { prisma } from "../index";
import { getProfileByEmail, getProfileById } from "./profileQueries";

export async function createUser(
  username: string,
  email: string,
  password: string,
  registeredWith: string
) {
  try {
    await prisma.user.create({
      data: {
        name: username,
        email,
        password,
        registeredWith,
        pictureUrl:
          "https://vectorified.com/images/no-profile-picture-icon-28.png",
      },
    });
  } catch (error) {
    console.error("create user error", error);
    throw new Error(
      `Username '${username}' or email '${email}' already exists.`
    );
  }
}

export async function updateUser(email: string, newPic: string) {
  const user: any = await getProfileByEmail(email);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { pictureUrl: newPic },
  });

  return updatedUser;
}

export async function updateUserName(email: string, newUsername: string) {
  const user: any = await getProfileByEmail(email);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: newUsername },
  });

  return updatedUser;
}

export async function updateUserPassword(id: string, password: string) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      password,
    },
  });
  return user;
}

export async function updateUserResetToken(id: string, token: string) {
  const expirationDate = new Date(Date.now() + 5 * 60 * 1000);
  const user = await prisma.user.update({
    where: { id },
    data: {
      resetToken: token,
      resetTokenExpiration: expirationDate,
    },
  });
  return user;
}

export async function validateUserResetToken(id: string, token: string) {
  const user: any = await prisma.user.findUnique({
    where: { id },
  });

  if (
    user &&
    user.resetToken == token &&
    Date.now() < user.resetTokenExpiration
  ) {
    await prisma.user.update({
      where: { id },
      data: {
        resetToken: null,
        resetTokenExpiration: null,
      },
    });
    return true;
  } else {
    return false;
  }
}
