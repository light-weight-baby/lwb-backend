import express from "express";
import morgan from "morgan";
import { router } from "./routes/engineers";
import {
  addFriend,
  createEvent,
  createUser,
  getEventById,
  removeFriend,
  removeFriendReceived,
  removeFriendSent,
  updateFriendRequest,
  updateFriendRequestSent,
  addParticipant,
} from "./userQueries";
import {
  getProfileByUsername,
  getProfileByEmail,
  getProfileById,
  updateUser,
  updateUserName,
  getProfilesByPartialUsername,
  getFriendsByPartialUsername,
  getParticipantById,
} from "./profileQueries";
import bcrypt from "bcryptjs";
import cors from "cors";
import { User } from "@prisma/client";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import { Session, MemoryStore } from "express-session";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { SHA256 } from "crypto-js";

const clientid =
  "951239670358-q89e1msbgovmepbaq4fplqc20qn62ha9.apps.googleusercontent.com";
const client = new OAuth2Client(clientid);

export const app = express();

import intializePassport from "./passport";
intializePassport(passport, getProfileByUsername, getProfileById);

dotenv.config();

app.use(
  session({
    secret: process.env.SECRET as string,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //24 hour
    resave: true,
    saveUninitialized: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("combined"));

//Used in order to let typescript know that req.session.user is a strings
declare module "express-session" {
  interface Session {
    user: string;
    id: string;
  }
}

app.use("/crowdWrap/engineers", router);

app.get("/crowdWrap", (req, res) => {
  res.send("hey guys");
});

app.post("/", (req, res) => {});

app.post("/register/setUsername", async (req, res) => {
  const username = req.body.username;
  const usernameExists = await getProfileByUsername(username);

  if (usernameExists) {
    return res.status(400).json({ message: "user exists" });
  }
});

app.post("/register", async (req, res) => {
  if (req.body.credential) {
    try {
      const token = req.body.credential;
      // console.log(req.body.credential);
      let payload: any;
      async function verify() {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: clientid,
        });
        payload = ticket.getPayload();
        const userid = payload["sub"];
      }
      verify()
        .then(async () => {
          const firstname = payload.given_name;
          const lastname = payload.family_name;
          const email = payload.email;
          const picture = payload.picture;
          const userData = payload.sub;

          console.log(payload);
          //makes sure that the user doesnt exist
          const emailExists = await getProfileByEmail(email);

          if (emailExists) {
            return res.status(400).json({ message: "user exists" });
          }

          createUser(userData, email, "");
          updateUser(email, picture);
          return res.status(200).json({ message: "Registration succesful" });
        })
        .catch((e) => console.log("firstError:", e));
    } catch (e) {
      console.log("secondError:", e);
    }
  } else {
    //normal
    try {
      const { username, email, password } = req.body;

      //makes sure the fields arent blank and pass is > 8
      if (!username || !email || !password || password.length < 8) {
        return res.status(400).json({ message: "invalid fields" });
      }

      //makes sure that the user doesnt exist
      const emailExists = await getProfileByEmail(email);
      const usernameExists = await getProfileByUsername(username);

      if (emailExists || usernameExists) {
        return res.status(400).json({ message: "user exists" });
      }

      //then continues normal process
      const hashedPass = await bcrypt.hash(password, 10);

      //Create user and send to DB
      createUser(username, email, hashedPass);
      return res.status(201).json({ message: "Registration succesful" });
    } catch (e) {
      console.log("thirdError:", e);
      return res.status(401).json({ message: "registration failed" });
    }
  }
});

app.post("/login", async (req, res, next) => {
  if (req.body.credential) {
    try {
      const token = req.body.credential;
      let payload: any;
      async function verify() {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: clientid,
        });
        payload = ticket.getPayload();
        const userid = payload["sub"];
      }
      verify().then(async () => {
        const email = payload.email;
        const picture = payload.picture;
        const sub = payload.sub;

        const emailExists = await getProfileByEmail(email);

        if (!emailExists) {
          return res.status(400).json({ message: "user doesnt exist" });
        }

        const user: any = await getProfileByEmail(email);

        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          // updateUser(email, picture);
          req.session.user = user.id.toString();

          if (user.username == sub) {
            return res.status(200).json({ message: "Needs username" });
          } else {
            return res
              .status(200)
              .json({ message: "Authentication successful" });
          } //
        });
      });
      //google oauth
    } catch (e) {
      console.log("fourthError:", e);
    }
  } else {
    //normal auhtentication and session
    passport.authenticate("local", (err: Error, user: User) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.session.user = user.id.toString();
        return res.status(200).json({ message: "Authentication successful" });
      });
    })(req, res, next);
  }
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return res.status(401).json({ message: "Logout failed" });
    }
  });
  res.setHeader("Set-Cookie", "");
  res.status(200).json({ message: "Logout successful" });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.status(401).json({ message: "Youre already logged in" });
  } else {
    return res.status(200).json({ message: "Okay log in" });
  }
});

app.get("/profile", async (req, res) => {
  //are they  able to bypass the setusername part if they go to /profile? should i leave it or is there a resolution?
  if (req.session.user) {
    const user = await getProfileById(Number(req.session.user));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ user });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

app.get("/register/setUsername", async (req, res) => {
  if (req.session.user) {
    const user = await getProfileById(Number(req.session.user));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ message: "authorized" });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

app.post("/setUsername", async (req, res) => {
  if (req.session.user) {
    const user = await getProfileById(Number(req.session.user));
    res.setHeader("Content-Type", "application/json");

    const usernameExists = await getProfileByUsername(req.body.username);
    if (usernameExists) {
      return res.status(400).json({ message: "user exists" });
    }

    updateUserName(user.email, req.body.username);

    return res.status(200).json({ message: "complete" });
  } else {
    console.log("not");
    return res.status(401).json({ message: "not authorized" });
  }
});

app.get("/profilePicRequest", async (req, res) => {
  if (req.session.user) {
    const user = await getProfileById(Number(req.session.user));
    res.send(user.picture);
  }
});

app.get("/friendSearch", async (req, res) => {
  const userSearch: any = req.query.user_search;
  const user = await getProfileById(Number(req.session.user));
  const profiles = await getProfilesByPartialUsername(userSearch);
  let accounts;
  if (profiles) {
    accounts = profiles
      .filter((item) => item.username != user.username)
      .filter(
        (item) =>
          !user.friendRequestsSent.some((el) => el.username === item.username)
      )
      .filter(
        (item) => !user.friends.some((el) => el.username === item.username)
      )
      .map((item) => {
        return { username: item.username, profilePic: item.picture };
      });
  }
  res.send(accounts);
});

app.get("/friendsListSearch", async (req, res) => {
  const userSearch: any = req.query.user_search;
  const user = await getProfileById(Number(req.session.user));
  const friends = await getFriendsByPartialUsername(userSearch, user.id);

  let accounts;
  if (friends) {
    accounts = friends.map((item) => {
      console.log("item: ", item.username, item.picture);
      return { username: item.username, profilePic: item.picture };
    });
  }
  res.send(accounts);
});

app.get("/sendFriendRequest", async (req, res) => {
  if (req.session.user) {
    const userToSendFriendRequest: any = req.query.user_name;
    const currentUserID: number = Number(req.session.user);
    if (userToSendFriendRequest) {
      await updateFriendRequestSent(userToSendFriendRequest, currentUserID);
      return res.status(200).json({ message: "complete" });
    }
  }
});

app.get("/friendReceived", async (req, res) => {
  let accounts;
  if (req.session.user) {
    const user = await getProfileById(Number(req.session.user));
    const friendRequests = user.friendRequests;

    if (friendRequests) {
      accounts = friendRequests.map((item) => {
        return { username: item.username, profilePic: item.picture };
      });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.send(accounts);
});

app.get("/friendSent", async (req, res) => {
  let accounts;
  if (req.session.user) {
    const user = await getProfileById(Number(req.session.user));
    const friendRequestsSent = user.friendRequestsSent;

    if (friendRequestsSent) {
      accounts = friendRequestsSent.map((item) => {
        return { username: item.username, profilePic: item.picture };
      });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.send(accounts);
});

app.get("/friends", async (req, res) => {
  let accounts;
  if (req.session.user) {
    const user = await getProfileById(Number(req.session.user));
    const friends = user.friends;

    if (friends) {
      accounts = friends.map((item) => {
        return {
          username: item.username,
          profilePic: item.picture,
          userId: item.id,
        };
      });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.send(accounts);
});

app.get("/addFriend", async (req, res) => {
  if (req.session.user) {
    const usertoRemoveUsername: any = req.query.user_name;
    const currentUserID: number = Number(req.session.user);
    //
    const userToRemove: any = await getProfileByUsername(usertoRemoveUsername);
    const user = await getProfileById(Number(req.session.user));
    addFriend(usertoRemoveUsername, currentUserID);
    //add them adn then remove the sent, and received
    removeFriendReceived(user.username, userToRemove.id);
    removeFriendSent(user.username, userToRemove.id);
    return res.status(200).json({ message: "complete" });
  }
});

app.get("/removeFriend", async (req, res) => {
  if (req.session.user) {
    const usertoRemoveUsername: any = req.query.user_name;
    const currentUserID: number = Number(req.session.user);
    removeFriend(usertoRemoveUsername, currentUserID);
    return res.status(200).json({ message: "complete" });
  }
});
//when they click the button, just add them as a friend

app.get("/removeFriendSent", async (req, res) => {
  if (req.session.user) {
    const usertoRemoveUsername: any = req.query.user_name;
    const currentUserID: number = Number(req.session.user);
    const userToRemove: any = await getProfileByUsername(usertoRemoveUsername);
    const user = await getProfileById(Number(currentUserID));
    //removing from current users sent
    removeFriendSent(usertoRemoveUsername, currentUserID);
    //removing from the received users received
    removeFriendReceived(usertoRemoveUsername, currentUserID);
    return res.status(200).json({ message: "complete" });
  }
});

app.get("/removeFriendReceived", async (req, res) => {
  if (req.session.user) {
    const usertoRemoveUsername: any = req.query.user_name;
    const userToRemove: any = await getProfileByUsername(usertoRemoveUsername);
    const user = await getProfileById(Number(req.session.user));
    //removing the received from current user
    removeFriendReceived(user.username, userToRemove.id);
    //removing user from userToRemoves sent
    removeFriendSent(user.username, userToRemove.id);
    return res.status(200).json({ message: "complete" });
  }
});

app.post("/events", async (req, res) => {
  if (req.session.user) {
    const { title, description, img, moneyGoal, time, date } = req.body;
    const eventString = `${title}${description}${moneyGoal}${date}${time}${img}`;
    const inviteLink = SHA256(eventString).toString();

    await createEvent(
      Number(req.session.user),
      req.body,
      `http://localhost:3000/events${inviteLink}`
    );
    const user = await getProfileById(Number(req.session.user));
    //need to test participants
    //then inner event
    //see if when u create an event on the events page it gets updated
    //style
    console.log(user);
  }
});

app.get("/events/participants", async (req, res) => {
  if (req.session.user) {
    const participantId: any = req.query.participantId;
    const participant = await getParticipantById(Number(participantId));
    const user = await getProfileById(Number(participantId));
    // console.log(await getParticipantById(Number(participantId)));
    res.send({ pic: participant.pic, name: user.username });
  }
});

app.get("/events/participants/add", async (req, res) => {
  if (req.session.user) {
    const username: any = req.query.username;
    const user: any = await getProfileByUsername(username);
    const eventId: any = req.query.eventId;
    // console.log(eventId);
    // console.log("id: ", , "eventid: ", );
    addParticipant(Number(user.id), Number(eventId));
  }
});

app.get("/events/participants/remove", async (req, res) => {
  if (req.session.user) {
  }
});

app.get("/events/retrieve", async (req, res) => {
  if (req.session.user) {
    const user = await getProfileById(Number(req.session.user));
    const allEvents = await Promise.all(
      user.events.map(async (e) => {
        return await getEventById(e.eventId);
      })
    );
    res.send(allEvents);
  }
});

app.listen(8000, () => {
  console.log(`Server is listening on port 8000`);
});
