import { Router } from "express";
import { adminController } from "./admin.controller";
import { adminZodValidation } from "./admin.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router=Router()

router.get("/",adminController.getAllAdmin)
router.get("/:id",adminController.getAdminById)
router.patch("/change-user-status",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),adminController.changeUserStatus)
router.patch("/change-user-role",checkAuth(UserRole.SUPER_ADMIN),adminController.changeUserRole)
router.delete("/:id",checkAuth(UserRole.ADMIN,UserRole.SUPER_ADMIN),adminController.deleteAdmin)
router.patch("/:id",validateRequest(adminZodValidation.updateAdminZodSchema),adminController.updateAdmin)


export const  adminRoutes=router;