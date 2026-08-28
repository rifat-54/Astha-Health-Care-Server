import PDFDocument from "pdfkit"

interface IPrescriptionData{
    doctorName:string,
    doctorEmail:string,
    patientName: string;
    patientEmail: string;
    followUpDate: Date;
    instructions: string;
    prescriptionId : string;
    appointmentDate: Date;
    createdAt: Date;
}


export const generatePrescriptionPDF=async(prescriptionData:IPrescriptionData):Promise<Buffer> =>{
    return new Promise((resolve,reject)=>{

        try {
            const doc=new PDFDocument({
                size:"a4",
                margin:"50"
            })

            


        } catch (error) {
            
        }

    })
}