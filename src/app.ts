import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import AppError from "./app/errorHelpers/AppError";
import status from "http-status";


const app: Application = express();


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/v1/",IndexRoutes)




// Basic route
app.get('/', async (req: Request, res: Response) => {
    // throw new AppError(status.NOT_FOUND,"ami app error")
    res.send("server is running")
});


app.use(globalErrorHandler)
app.use(notFound)

export default app;