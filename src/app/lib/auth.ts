import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import ms, { StringValue } from "ms";
import { envVeriable } from "../config/env";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  baseURL:envVeriable.BETTER_AUTH_URL,
  secret:envVeriable.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification:true
  },
  socialProviders:{
    google:{
      clientId:envVeriable.GOOGLE_CLIENT_ID,
      clientSecret:envVeriable.GOOGLE_CLIENT_SECRET,

      mapProfileToUser:()=>{
        return{
          role:UserRole.PATIENT,
          status:UserStatus.ACTIVE,
          needPasswordChange:false,
          emailVerified:true,
          isDeleted:false,
          deletedAt:null,
        }
      }
    }
  },
  emailVerification:{
    sendOnSignUp:true,
    sendOnSignIn:true,
    autoSignInAfterVerification:true
  },
  plugins:[bearer(),
    emailOTP({
      overrideDefaultEmailVerification:true,
      async sendVerificationOTP({email,type,otp}){
        // console.log("otp=> ",otp,type,email)
        if(type==="email-verification"){
          const user=await prisma.user.findUnique({
            where:{
              email
            }
          })

          if(user && !user.emailVerified){
            sendEmail({
              to:email,
              subject:"Verify your email",
              templateName:"otp",
              templateData:{
                name:user.name,
                otp
              }
            })
          }
        }else if(type==="forget-password"){
          const user=await prisma.user.findUnique({
            where:{
              email
            }
          })

          if(user){
            sendEmail({
              to:email,
              subject:"Password Reset OTP",
              templateName:"otp",
              templateData:{
                name:user.name,
                otp
              }
            })
          }
        }

      },
      expiresIn:2*60,    // 2 minute in second
      otpLength:6
    })
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.PATIENT,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 *7,
    updateAge: 60 * 60 * 24 *1,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 *1,
    },
  },

  //  advanced: {
  //       // disableCSRFCheck: true,
  //       useSecureCookies : false,
  //       cookies:{
  //           state:{
  //               attributes:{
  //                   sameSite: "none",
  //                   secure: true,
  //                   httpOnly: true,
  //                   path: "/",
  //               }
  //           },
  //           sessionToken:{
  //               attributes:{
  //                   sameSite: "none",
  //                   secure: true,
  //                   httpOnly: true,
  //                   path: "/",
  //               }
  //           }
  //       }
  //   }
});
