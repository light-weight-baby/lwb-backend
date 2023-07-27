import { Router } from "express";
import { getProfileByEmail, getProfileById } from "../queries/profileQueries";
import { updateUserPassword } from "../queries/userQueries";
const router = Router();
import bcrypt from "bcryptjs";

router.get("/", async (req: any, res: any) => {
  if (req.session.user) {
    const user = await getProfileById(req.session.user);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ user });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

router.post("/password/update", async (req: any, res: any, next: any) => {
  if (req.session.user) {
    const oldPassword: string = req.body.oldPassword;
    const newPassword: string = req.body.newPassword;
    const tempUser = await getProfileById(req.session.user);
    const user: any = await getProfileByEmail(tempUser.email);
    if (user) {
      bcrypt.compare(
        String(oldPassword),
        user.password,
        async (err, result) => {
          if (err) {
            throw new Error(String(err));
          } else if (result) {
            if (
              !newPassword ||
              newPassword.length < 8 ||
              newPassword.length > 20
            ) {
              return res.status(400).json({ message: "Invalid fields" });
            }

            const hashedPass = await bcrypt.hash(newPassword, 10);

            await updateUserPassword(req.session.user, hashedPass);
            return res.status(200).json({ message: "Password Changed!" });
          } else {
            return res
              .status(400)
              .json({ message: "Old password does not match!" });
          }
        }
      );
    } else {
      return res.status(401).json({ message: "Error" });
    }
  }
});

export default router;
