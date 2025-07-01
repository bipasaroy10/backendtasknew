
import { Router } from "express";
import { registerUser,signupUser, signinUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(
    
    registerUser
)

router.route("/signup").post(signupUser)

//secure routes
router.route("/signin").post(verifyJWT, signinUser)

export default router
