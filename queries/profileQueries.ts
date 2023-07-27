import { prisma } from "../index";

export async function getProfileById(id: string) {
  const userProfile = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      gender: true,
      pictureUrl: true,
      registeredWith: true,
      weightLb: true,
      heightFoot: true,
      heightInch: true,
      squatLb: true,
      deadLiftLb: true,
      benchPressLb: true,
      workoutPattern: true,
      archetype: true,
      yoe: true,
      partners: true,
    },
  });
  if (userProfile) {
    return userProfile;
  } else {
    console.log("Profile not found.");
    throw new Error(`Profile '${id}' doesn't exist.`);
  }
}

export async function getProfilesByPartialUsername(partialUsername: string) {
  try {
    const userProfiles = await prisma.user.findMany({
      where: {
        name: {
          contains: partialUsername,
          mode: "insensitive",
        },
      },
    });
    return userProfiles;
  } catch (e) {
    console.log(e);
  }
}

export async function getProfileByEmail(email: string) {
  try {
    const userProfile = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userProfile) {
      return userProfile;
    }
  } catch (e) {
    console.log(e);
  }
}
