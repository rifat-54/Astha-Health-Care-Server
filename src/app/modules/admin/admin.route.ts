import { Router } from "express";
import { adminController } from "./admin.controller";
import { adminZodValidation } from "./admin.validation";
import { validateRequest } from "../../middleware/validateRequest";

const router=Router()

router.get("/",adminController.getAllAdmin)
router.get("/:id",adminController.getAdminById)
router.patch("/:id",validateRequest(adminZodValidation.updateAdminZodSchema),adminController.updateAdmin)


export const  adminRoutes=router;