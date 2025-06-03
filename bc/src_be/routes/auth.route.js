import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.get("/me", authController.getCurrentUser);
authRouter.get("/is-phone-registered", authController.isPhoneRegistered);
authRouter.get("/is-email-registered", authController.isEmailRegistered);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-verification", authController.resendVerificationCode);

export default authRouter;
