import dotenv from "dotenv";
import express from "express";
import { getProfileByEmail, getProfileById } from "./queries/profileQueries";
import cors from "cors";
import passport from "passport";
import intializePassport from "./services/passport";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import {prisma} from "./loaders/prisma"
import expressSession from "express-session";
import registerRouter from "./routes/register";
import loginRouter from "./routes/login";
import logoutRouter from "./routes/logout";
import profileRouter from "./routes/profile";
import partnersRouter from "./routes/partners";
import oauthRouter from "./routes/oauth";

const morgan = require("morgan");
dotenv.config();
const app = express();

const sessionMiddleware = expressSession({
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, //24 hour
  secret: process.env.SECRET as string,
  resave: true,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, //ms
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
});

app.use(sessionMiddleware);

app.use(express.json());
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("dev"));

intializePassport(passport, getProfileById, getProfileByEmail);

app.use("/api/register", registerRouter);

app.use("/api/oauth", oauthRouter)

app.use("/api/login", loginRouter);

app.use("/api/logout", logoutRouter);

app.use("/api/profile", profileRouter);

app.use("/api/partners", partnersRouter);

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is listening `);
});

export {passport}
