import { Strategy as LocalStrategy } from "passport-local";
let GoogleStrategy = require('passport-google-oauth20').Strategy;
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import {prisma} from "../loaders/prisma"

export default function intializeLocalPassport(
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

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "/oauth/google/callback"
    },
    async (accessToken:string, refreshToken:string, profile:any, cb:Function) => {
      try{
        let user = await prisma.user.findUnique({
          where: {
            email: profile.email,
          },
        });
        console.log(profile)
        console.log(user)
        return cb(user);
      }catch(err){
        console.error(err)
      }

    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //     return cb(err, user);
    }
));
}
