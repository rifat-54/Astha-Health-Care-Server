import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (schema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parseResult = schema.safeParse(req.body);

    if (!parseResult.success) {
      next(parseResult.error);
    }
    //  sanitizing the data
    req.body = parseResult.data;
    next();
  };
};