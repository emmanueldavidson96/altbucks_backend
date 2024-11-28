import { NextFunction, Request, Response } from "express"

type AsyncController = (
    req:Request,
    res:Response,
    next:NextFunction,
) => Promise<any>

const catchErrors = (controller:AsyncController):((req: Request, res: Response, next: NextFunction) => void) => 
    async (request, response, next) => {
        try{
            await controller(request, response, next)
        }catch(error){
            next(error)
        }
    }

export default catchErrors;