import { Router } from "express";
//import { onlineUsers } from "../index";
import {
  addPartner,
  removePartner,
  getPartnersByPartialUsername,
} from "../queries/partnerQueries";
import { getProfileById } from "../queries/profileQueries";
const router = Router();

// A lot of scalablity problems with the friendlist, for example the notificatins. There would be a problem if there were too many active users (Redis could solve)
// Another problem would be how friends are displayed, they are all. So if someone has 100s of friends their browser would likely crash trying to display
// all of those. This can easily be fixed though by capping the shown amount, and having it lazy load.
//Same problem when adding a friend, itll show every single user that that has letters that they are searching for, should probably cap it too

router.get("/", async (req: any, res: any) => {
  let partnerAccounts;
  if (req.session.user) {
    const user = await getProfileById(req.session.user);
    const partners = user.partners;

    if (partners) {
      partnerAccounts = partners.map((partner) => {
        // let isOnline = "offline";
        // if (onlineUsers[partner.id] && onlineUsers[partner.id][1] == "online") {
        //   isOnline = "online";
        // }

        return {
          username: partner.name,
          profilePic: partner.pictureUrl,
          userId: partner.id,
          // status: isOnline,
        };
      });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.send(partnerAccounts);
});

router.get("/list-search", async (req: any, res: any) => {
  const userSearch: any = req.query.user_search;
  const user = await getProfileById(req.session.user);
  const searchedPartners = await getPartnersByPartialUsername(
    userSearch,
    user.id
  );
  res.send(searchedPartners);
});

router.post("/add", async (req: any, res: any) => {
  const userId1: string = req.body.userId1;
  const userId2: string = req.body.userId2;

  try {
    addPartner(userId1, userId2);
  } catch (e) {
    return res.status(500).json({ error: e });
  }

  return res.status(200).json({ message: "complete" });
});

router.delete("/remove", async (req: any, res: any) => {
  const userId1: string = req.body.userId1;
  const userId2: string = req.body.userId2;

  try {
    removePartner(userId1, userId2);
  } catch (e) {
    return res.status(500).json({ error: e });
  }

  return res.status(200).json({ message: "complete" });
});

export default router;
