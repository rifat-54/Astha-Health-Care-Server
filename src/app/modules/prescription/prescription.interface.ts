export interface ICreatePrescriptionPayload{
    appointmentId:string,
    followUpDate:Date,
    instructions:string
}

export interface IUpdatePrescriptionPayload{
    appointmentId:string,
    instructions:string,
    followUpDate?:Date,
}
