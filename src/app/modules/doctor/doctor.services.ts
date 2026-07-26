import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctor } from "./doctor.interface";

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

  const updatedoctor = await prisma.doctor.update({
    where: {
      id,
    },
    data: doctorData.doctor,
  });

  // if specialties are provided ,update them saparately
  if (doctorSpecialties && doctorSpecialties.length > 0) {
    await prisma.$transaction(async (tx) => {
      // delete old specialties
      await tx.doctorSpecialty.deleteMany({
        where: {
          doctorId: id,
        },
      });

      // new specialties object
      const specialtiesData = doctorSpecialties.map((specialtyId) => ({
        doctorId: id,
        specialtyId,
      }));

      // crate new specialties

      await tx.doctorSpecialty.createMany({
        data: specialtiesData,
      });
    });
  }

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
        where:{id}
    })
    if(!existsDoctor){
        throw new AppError(status.NOT_FOUND,"Doctor not found")
    }

    if(existsDoctor.isDeleted){
        throw new AppError(status.BAD_REQUEST,"Doctor is aleady deletd")
    }
    
    const result=await prisma.doctor.update({
        where:{id},
        data:{
            isDeleted:true,
            deletedAt:new Date()
        }
    })
    return result;
}

export const doctorServices = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor
};
