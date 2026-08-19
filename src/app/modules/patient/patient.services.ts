import { deleteFileFromCloudinary } from "../../config/cloudinary.config"
import { IRequestUser } from "../../interface/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { IUpdatePatientHealthDataPayload, IUpdatePatientProfilePayload } from "./patient.interface"
import { convertToDateTime } from "./patient.utils"


const updatePatientProfile=async(user:IRequestUser,payload:IUpdatePatientProfilePayload)=>{

    // throw new Error("This error intensionally for check backend issue")


    const patientData=await prisma.patient.findFirstOrThrow({
        where:{
            email:user.email
        },
        include:{
            patientHealthData:true,
            medicalReports:true
        }
    })

    await prisma.$transaction(async(tx)=>{

        if(payload.patientInfo){
            await tx.patient.update({
                where:{
                    id:patientData.id
                },
                data:{
                    ...payload.patientInfo
                }
            })

            if(payload.patientInfo.name || payload.patientInfo.profilePhoto){
                const userData={
                    name:payload.patientInfo.name ? payload.patientInfo.name : patientData.name,
                    image:payload.patientInfo.profilePhoto ? payload.patientInfo.profilePhoto : patientData.profilePhoto
                }

                await tx.user.update({
                    where:{
                        id:patientData.userId
                    },
                    data:{
                        ...userData
                    }
                })

            }
        }

        if(payload.patientHealthData){
            const healthDataToSave:IUpdatePatientHealthDataPayload={
                ...payload.patientHealthData
            }

            if(payload.patientHealthData.dateOfBirth){
                healthDataToSave.dateOfBirth=convertToDateTime(typeof healthDataToSave.dateOfBirth==="string"?healthDataToSave.dateOfBirth : undefined) as Date
            }

            await tx.patientHealthData.upsert({
                where:{
                    patientId:patientData.id
                },
                update:healthDataToSave,
                create:{
                    patientId:patientData.id,
                    ...healthDataToSave
                }
            })
        }

        console.log("called",payload)
        if(payload.medicalReports && Array.isArray(payload.medicalReports) && payload.medicalReports.length>0){
            
            for(const report of payload.medicalReports){
                console.log("medical report->",report.reportName ,report.reportLink)
                if(report?.shouldDelete && report?.reportId){
                    const reportData=await tx.medicalReport.findFirstOrThrow({
                        where:{
                            reportLink:report.reportId
                        }
                    })
                    const deleteReport=await tx.medicalReport.delete({
                        where:{
                            id:reportData.id
                        }
                    }) 

                    console.log("delete report _>",deleteReport)

                    //! delete from cloudinary also
                    if(deleteReport.reportLink){
                        await deleteFileFromCloudinary(deleteReport.reportLink)
                    }

                }else if(report.reportName && report.reportLink){
                    await tx.medicalReport.create({
                        data:{
                            patientId:patientData.id,
                            reportName:report.reportName,
                            reportLink:report.reportLink
                        }
                    })
                }


            }
        }

    })


    const result=await prisma.patient.findUnique({
        where:{
            id:patientData.id
        },
        include:{
            user:true,
            patientHealthData:true,
            medicalReports:true
        }
    })

    return result;

}


export const patientServices={
    updatePatientProfile
}