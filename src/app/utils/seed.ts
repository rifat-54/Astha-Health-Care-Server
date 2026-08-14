import { text } from "node:stream/consumers"
import { UserRole } from "../../generated/prisma/enums"
import { envVeriable } from "../config/env"
import { auth } from "../lib/auth"
import { prisma } from "../lib/prisma"

export const seedSuperAdmin=async()=>{
    try {
        const isSuperAdminExist=await prisma.user.findFirst({
            where:{
                role:UserRole.SUPER_ADMIN
            }
        })

        if(isSuperAdminExist){
            console.log("Supper admin already exists.skipping seeding super admin")
            return
        }

        const superAdminUser=await auth.api.signUpEmail({
            body:{
                email:envVeriable.SUPER_ADMIN_EMAIL,
                password:envVeriable.SUPER_ADMIN_PASSWORD,
                name:"Super Admin",
                role:UserRole.SUPER_ADMIN,
                needPasswordChange:false,
                rememberMe:false
            }
        })

        const superAdmin =await prisma.$transaction(async(tx)=>{

            await tx.user.update({
                where:{
                    id:superAdminUser.user.id
                },
                data:{
                    emailVerified:true
                }
            })

          return  await tx.admin.create({
                data:{
                    userId:superAdminUser.user.id,
                    name:"Super Admin",
                    email:envVeriable.SUPER_ADMIN_EMAIL
                }
            })
        })

        console.log("Super Admn Created successfully",superAdmin)

        
    } catch (error) {
        console.error("Error seeding super admin",error)
        await prisma.user.delete({
            where:{
                email:envVeriable.SUPER_ADMIN_EMAIL
            }
        })
    }
}