import {router} from "../loaders/express"
import {passport} from "../index"

router.get("/google", passport.authenticate("google", {
        scope: ["email", "profile"],
}))

router.get("/google/callback", (req,res)=>{
    console.log('bye')
    return res.send('bye')
})

export default router;