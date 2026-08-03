import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVeriable } from "./env";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

cloudinary.config({
  cloud_name: envVeriable.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVeriable.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVeriable.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(
      status.BAD_REQUEST,
      "File buffer and file name are required for upload",
    );
  }

  const extension = fileName.split(".").pop()?.toLocaleLowerCase();

  const fileNameWithoutExtension = fileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  const uniqueName =
    Math.random().toString(36).substring(2) +
    "-" +
    Date.now() +
    "-" +
    fileNameWithoutExtension;

  const folder = extension === "pdf" ? "pdfs" : "images";

  return new Promise((resolve,reject)=>{
    cloudinary.uploader.upload_stream(
        {
            resource_type:"auto",
            public_id:`astha-healthcare/${folder}/${uniqueName}`,
            folder:`astha-healthcare/${folder}`
        },
        (error,result)=>{
            if(error){
                return reject(new AppError(status.INTERNAL_SERVER_ERROR,"Failed to upload file to cloudinary"))
            }

            resolve(result as UploadApiResponse)
        }
    ).end(buffer)
  })
};

export const cloudinaryUpload=cloudinary
