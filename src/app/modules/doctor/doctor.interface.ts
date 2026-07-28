import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorSpecialties{
  specialtyId:string
  shouldDelete?:boolean
}

export interface IUpdateDoctor {
  doctor: {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber?: string;
    experience?: number;
    gender?: Gender;
    appointmentFee?: number;
    qualification?: string;
    currentWorkingPlace?: string;
    designation?: string;
  };
  doctorSpecialties?: IUpdateDoctorSpecialties[];
}


