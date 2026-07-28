import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctor } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllDoctors = async () => {
  const doctor = await prisma.doctor.findMany({
    include: {
      user: true,
      doctorSpecilaties: {
        include: {
          specialty: true,
        },
      },
    },
  });

  return doctor;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      doctorSpecilaties: {
        select: {
          specialty: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found.Provide right id");
  }

  return doctor;
};

const updateDoctor = async (id: string, payload: IUpdateDoctor) => {
  console.log("payload->", payload);

  const existingDoctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });

  if (!existingDoctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  // separate specialties from doctor data
  const { doctorSpecialties, ...doctorData } = payload;


  await prisma.$transaction(async(tx)=>{
    if(doctorData){
         await tx.doctor.update({
          where: {
                 id,
              },
          data: doctorData.doctor,
        });
    }

      if (doctorSpecialties && doctorSpecialties.length > 0) {

      for(const specialty of doctorSpecialties){
        const {specialtyId,shouldDelete}=specialty

        if(shouldDelete){
          await tx.doctorSpecialty.delete({
            where:{
              doctorId_specialtyId:{
                doctorId:id,
                specialtyId
              }
            }
          })
        }else{
          await tx.doctorSpecialty.upsert({
           where:{
              doctorId_specialtyId:{
                doctorId:id,
                specialtyId
              }
            },
            create:{
              doctorId:id,
              specialtyId
            },
            update:{}
          })
        }



      }


  }

  })




  // if specialties are provided ,update them saparately


  // fetch data
  const result = await prisma.doctor.findUnique({
    where: { id },
    include: {
      doctorSpecilaties: {
        select: {
          specialty: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const softDeleteDoctor=async(id:string)=>{

    const existsDoctor=await prisma.doctor.findUnique({
        where:{id},
        include:{
          user:true
        }
    })
    if(!existsDoctor){
        throw new AppError(status.NOT_FOUND,"Doctor not found")
    }

    if(existsDoctor.isDeleted){
        throw new AppError(status.BAD_REQUEST,"Doctor is aleady deletd")
    }
    

    await prisma.$transaction(async(tx)=>{
      
      await tx.doctor.update({
        where:{id},
        data:{
            isDeleted:true,
            deletedAt:new Date()
        }
      })

      await tx.user.update({
        where:{
          id:existsDoctor.userId
        },
        data:{
          isDeleted:true,
          deletedAt:new Date(),
          status:UserStatus.DELETED
        }
      })

      // delete all session

      await tx.session.deleteMany({
        where:{
          userId:existsDoctor.userId
        }
      })

      // delete all doctor specialteis

      await tx.doctorSpecialty.deleteMany({
        where:{
          doctorId:id
        }
      })

    })


    return {message:"Doctor deleted successfully"};
}

export const doctorServices = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor
};
