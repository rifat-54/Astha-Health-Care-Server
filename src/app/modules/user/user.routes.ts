import { Router } from "express";
import { userControler } from "./user.controller";

const router=Router()

router.post("/create-doctor",userControler.createDoctor)


export const userRoutes=router