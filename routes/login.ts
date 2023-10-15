import {router} from "../loaders/express"
import {
  updateUserPassword,
  updateUserResetToken,
  validateUserResetToken,
} from "../queries/userQueries";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import {passport} from "../index"
import { getProfileByEmail, getProfileById } from "../queries/profileQueries";
import dotenv from "dotenv";
dotenv.config();
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API as string);

const client = new OAuth2Client(process.env.CLIENTID);

router.get("/", async (req: any, res: any) => {
  if (req.session.userId) {
    const user = await getProfileById(req.session.userId);

    return res.status(200).json({ message: "Good to go!", user });
  } else {
    return res.status(401).json({ message: "You arent logged in!" });
  }
});

router.post("/", async (req: any, res: any, next) => {
  passport.authenticate("local", (err: Error, user: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "This user does not exist!" });
    }
    req.logIn(user, async (err: any) => {
      if (err) {
        return next(err);
      }
      req.session.userId = user.id;
      const userAccount = await getProfileById(req.session.userId);
      return res
        .status(200)
        .json({ message: `${user.username} has logged in`, user: userAccount });
    });
  })(req, res, next);
});

router.post("/googleOauth", async (req: any, res: any, next) => {
  if (req.body.credential) {
    try {
      const token = req.body.credential;
      let payload: any;
      async function verify() {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.CLIENTID,
        });
        payload = ticket.getPayload();
      }
      verify().then(async () => {
        const email = payload.email;
        // const picture = payload.picture;
        // const sub = payload.sub;

        const emailExists = await getProfileByEmail(email);

        if (!emailExists) {
          return res.status(400).json({ message: "This user does not exist" });
        }

        const user: any = await getProfileByEmail(email);

        req.logIn(user, async (err: any) => {
          if (err) {
            return next(err);
          }

          req.session.userId = user.id;
          const userAccount = await getProfileById(req.session.userId);
          return res
            .status(200)
            .json({ message: `${email} has logged in`, user: userAccount });
        });
      });
    } catch (e) {
      console.log("Login Google Oauth Error:", e);
      return res.status(401).json({ message: "Google Oauth Failed" });
    }
  } else {
    return res.status(401).json({ message: "Google Oauth Failed" });
  }
});

router.post("/forgot", async (req: any, res: any) => {
  const email = req.body.email;
  const user = await getProfileByEmail(email);

  if (user !== null && user && user.registeredWith !== "google") {
    const resetToken = Math.floor(100000000 + Math.random() * 900000000);
    await updateUserResetToken(user.id, resetToken.toString());
    const msg = {
      to: `${user.email}`,
      from: "lwb@gmail.com",
      subject: "Password Reset",
      text: `Hi, your password reset token is ${resetToken}. It will last for 5 minutes!`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  }
  return res.status(200).json({ message: "Good to go!" });
});

router.post("/forgot/check", async (req: any, res: any) => {
  const email = req.body.email;
  const token = req.body.token;
  const regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");

  if (!regex.test(email)) {
    return res.status(400).json({ valid: false });
  }

  const user = await getProfileByEmail(email);

  if (user !== null && user) {
    const validation = await validateUserResetToken(user.id, token);
    console.log(validation);
    return res.status(200).json({ valid: validation });
  }
  return res.status(400).json({ valid: false });
});

router.post("/forgot/update", async (req: any, res: any) => {
  const email = req.body.email;
  const password: string = req.body.password;
  const regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");

  if (!regex.test(email)) {
    return res.status(400).json({ message: "Not an email!" });
  }

  const user = await getProfileByEmail(email);

  if (user !== null && user) {
    if (!password || password.length < 8 || password.length > 20) {
      return res.status(400).json({ message: "Invalid fields" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await updateUserPassword(user.id, hashedPass);
    return res.status(200).json({ message: "Password Changed!" });
  } else {
    return res.status(400).json({ message: "Invalid User!" });
  }
});

export default router;
