import { addMinutesWithOptions } from "date-fns/fp";
import { ICreateShedulePayload } from "./schedule.interface"
import { addHours, addMinutes, format } from "date-fns";
import { convertDateTime } from "./schedule.utils";
import { prisma } from "../../lib/prisma";

const createSchedule=async(payload:ICreateShedulePayload)=>{

console.log("Payload-> ",payload)

const{startDate,endDate,startTime,endTime}=payload


const interval=30;

const currentDate=new Date(startDate)
const lastDate=new Date(endDate)

console.log(format(currentDate,"yyyy-MM-dd"))

const shedule:any=[]

while(currentDate<=lastDate){

    const startDateTime=new Date(
        addMinutes(
            addHours(
                `${format(currentDate,"yyyy-MM-dd")}`,
                Number(startTime.split(":")[0])
            ),
            Number(startTime.split(":")[1])
        )
    )

    const endDateTime=new Date(
        addMinutes(
            addHours(
                `${format(currentDate,"yyyy-MM-dd")}`,
                Number(endTime.split(":")[0])
            ),
            Number(endTime.split(":")[1])
        )
    )

    while(startDateTime<endDateTime){

        const s=await convertDateTime(startDateTime)
        const e=await convertDateTime(addMinutes(startDateTime,interval))

        const sheduleData={
            startDateTime:s,
            endDateTime:e
        }

        const existingShedule=await prisma.schedule.findFirst({
            where:sheduleData
        })

        if(!existingShedule){
            const result=await prisma.schedule.create({
                data:sheduleData
            })
            console.log(result)
            shedule.push(result)
        }

        
        startDateTime.setMinutes(startDateTime.getMinutes()+30)
    }

    currentDate.setDate(currentDate.getDate()+1)
}



    return shedule;
}


export const sheduleServices={
    createSchedule
}