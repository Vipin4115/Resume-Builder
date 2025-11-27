import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { getUserById, getUserResumes, loginUser, registerUser } from "../controllers/UserController.js";
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.get('/data',protect,getUserById);
userRouter.get('/resumes',protect,getUserResumes)

export default userRouter;