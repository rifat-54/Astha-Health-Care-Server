import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";

const storage=new CloudinaryStorage({
    cloudinary:cloudinaryUpload,
    params:async(req,file)=>{
        const originalName=file.originalname;
        const extension=originalName.split(".").pop()?.toLocaleLowerCase()

        console.log("called multer")

  const fileNameWithoutExtension = originalName
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

        return  {
            resource_type:"auto",
            public_id:uniqueName,
            folder:`astha-healthcare/${folder}`
        }
    }
})

export const multerUpload=multer({storage})