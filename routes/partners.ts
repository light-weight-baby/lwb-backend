import { Router } from "express";
//import { onlineUsers } from "../index";
import {
  addPartner,
  removePartner,
  getPartnersByPartialUsername,
} from "../queries/partnerQueries";
import { getProfileById } from "../queries/profileQueries";
const router = Router();

router.get("/", async (req: any, res: any) => {
  let partnerAccounts;
  if (req.session.userId) {
    const user = await getProfileById(req.session.userId);
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
  const user = await getProfileById(req.session.userId);
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
