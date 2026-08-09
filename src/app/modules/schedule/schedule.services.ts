import { addMinutesWithOptions } from "date-fns/fp";
import { ICreateShedulePayload, IUpdatShedulePayload } from "./schedule.interface";
import { addHours, addMinutes, format } from "date-fns";
import { convertDateTime } from "./schedule.utils";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interface/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import {
  scheduleFilterableFields,
  scheduleIncludeConfig,
  scheduleSearchableFields,
} from "./schedule.constant";

const createSchedule = async (payload: ICreateShedulePayload) => {
  console.log("Payload-> ", payload);

  const { startDate, endDate, startTime, endTime } = payload;

  const interval = 30;

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  console.log(format(currentDate, "yyyy-MM-dd"));

  const shedule: any = [];

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0]),
        ),
        Number(startTime.split(":")[1]),
      ),
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0]),
        ),
        Number(endTime.split(":")[1]),
      ),
    );

    while (startDateTime < endDateTime) {
      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, interval));

      const sheduleData = {
        startDateTime: s,
        endDateTime: e,
      };

      const existingShedule = await prisma.schedule.findFirst({
        where: sheduleData,
      });

      if (!existingShedule) {
        const result = await prisma.schedule.create({
          data: sheduleData,
        });
        console.log(result);
        shedule.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + 30);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return shedule;
};

const getAllShedule = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Schedule,
    Prisma.ScheduleWhereInput,
    Prisma.ScheduleInclude
  >(prisma.schedule, query, {
    searchableFields: scheduleSearchableFields,
    filterableFields: scheduleFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(scheduleIncludeConfig)
    .sort()
    .fields()
    .execute();

    return result;
};

const getScheduleById=async(id:string)=>{
  const schedule=await prisma.schedule.findUnique({
    where:{
      id
    }
  })

  return schedule;
}
const deleteSchedule=async(id:string)=>{
  const schedule=await prisma.schedule.delete({
    where:{
      id
    }
  })

  return schedule;
}


const updateSchedule=async(id:string,payload:IUpdatShedulePayload)=>{
  const {startDate,endDate,startTime,endTime}=payload

  const startDateTime=new Date(
    addMinutes(
      addHours(
        `${format(new Date(startDate),"yyyy-MM-dd")}`,
        Number(startTime.split(":")[0])
      ),
      Number(startTime.split(":")[1])
    )
  )

  const endDateTime=new Date(
    addMinutes(
      addHours(
        `${format(new Date(endDate),"yyyy-MM-dd")}`,
        Number(endTime.split(":")[0])
      ),
      Number(endTime.split(":")[1])
    )
  )

const result=await prisma.schedule.update({
  where:{
    id
  },
  data:{
    startDateTime,
    endDateTime
  }
})


return result


}

export const sheduleServices = {
  createSchedule,
  getAllShedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule
};
