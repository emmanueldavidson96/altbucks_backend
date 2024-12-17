import { Errback, ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/AppError";

const handleZodError = (response:Response, error:z.ZodError) => {
    const errors = error.issues.map((issue) => ({
        path:issue.path.join("."),
        message:issue.message
    }))
    return response.status(BAD_REQUEST).json({
        message:error.message,
        errors,
    })
}

const handleAppError = (response:Response, error:AppError) => {
    return response.status(error.statusCode).json({
        message:error.message,
        errorCode:error.errorCode
    })

}

const errorHandler:ErrorRequestHandler = (error:any, request:Request, response:Response, next:NextFunction) => {
    console.log(`PATH: ${request.path}`, error);
    if(error instanceof z.ZodError){
        return handleZodError(response, error);
    }
    if(error instanceof AppError) {
        return handleAppError(response, error)
    }
    response.status(INTERNAL_SERVER_ERROR).send("Internal Server Error")
    //      // For all other errors, return a generic 500 Internal Server Error
    // response.status(INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
}

export default errorHandler;