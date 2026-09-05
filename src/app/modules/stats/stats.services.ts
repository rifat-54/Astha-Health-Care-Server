import status from "http-status";
import { PaymentStatus, UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";


const getDashboardStatsData=async(user:IRequestUser)=>{
    let statsData;

    switch(user.role){
        case UserRole.SUPER_ADMIN:
            statsData=getSuperAdminStatsData()
            break;
        case UserRole.ADMIN:
            statsData=getAdminStatsData()
            break;
        case UserRole.DOCTOR:
        case UserRole.PATIENT:
        default:
            throw new AppError(status.BAD_REQUEST,"Invalid user role")
    }

    return statsData;
}


const getSuperAdminStatsData=async()=>{
     const appointmentCount=await prisma.appointment.count()
     const doctorCount=await prisma.doctor.count()
     const patientCount=await prisma.patient.count()
     const superAdminCount=await prisma.admin.count({
        where:{
            user:{
                role:UserRole.SUPER_ADMIN
            }
        }
     })
     const adminCount=await prisma.admin.count({
        where:{
            user:{
                role:UserRole.ADMIN
            }
        }
     })
     const paymentCount=await prisma.payment.count()
     const userCount=await prisma.user.count()

     const totalRevenue=await prisma.payment.aggregate({
        _sum:{
            amount:true
        },
        where:{
            status:PaymentStatus.PAID
        }
     })



}

const getAdminStatsData=async()=>{

}








const getPieChartData=async()=>{
    const appointmentStatusDistribution=await prisma.appointment.groupBy({
        by:["status"],
        _count:{
            id:true
        }
    })

    const formatAppointmentStatusDistribution=appointmentStatusDistribution.map(({_count,status})=>({
        status,
        count:_count.id
    }))

    return formatAppointmentStatusDistribution;
    
}