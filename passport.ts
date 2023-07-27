import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

export default function intializePassport(
  passport: any,
  getProfileById: Function,
  getProfileByEmail: any
) {
  const authenticateUser = async (
    email: string,
    password: string,
    done: any
  ) => {
    const regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");

    if (!regex.test(email)) {
      return done(null, false, {
        message: "Not an email, please try again",
      });
    }

    const user = await getProfileByEmail(email);

    if (user == null) {
      return done(null, false, {
        message: "Account or Password is incorrect, please try again",
      });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: "Account or Password is incorrect, please try again",
        });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy(authenticateUser));
  passport.serializeUser((user: User, done: any) => done(null, user.id));
  passport.deserializeUser((id: Number, done: any) => {
    return done(null, getProfileById(id));
  });
}
