import z from "zod";

const updateAdminZodSchema=z.object({
    admin:z.object({
        name:z.string("name must be string").optional(),
        profilePhoto:z.url("Profile photo must be a valid url").optional(),
        contactNumber:z.string().min(11,"Contact number must be at least 11 digit").max(14,"contact number must be at most 14 digit").optional()
    })
})

export const adminZodValidation={
            updateAdminZodSchema
}