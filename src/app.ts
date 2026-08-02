import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import AppError from "./app/errorHelpers/AppError";
import status from "http-status";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import cors from "cors"
import { envVeriable } from "./app/config/env";


const app: Application = express();


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())

app.use(cors({
    origin:[envVeriable.FRONTEND_URL,envVeriable.BETTER_AUTH_URL],
    credentials:true,
    methods:["GET","POST","DELETE","PUT","PATCH","UPDATE"],
    allowedHeaders:["Content-Type","Authorization"]
}))

app.use("/api/auth",toNodeHandler(auth))


app.use("/api/v1/",IndexRoutes)



// Basic route
app.get('/', async (req: Request, res: Response) => {
    // throw new AppError(status.NOT_FOUND,"ami app error")
    res.send("server is running")
});


app.use(globalErrorHandler)
app.use(notFound)

export default app;