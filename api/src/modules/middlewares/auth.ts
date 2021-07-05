import { NextFunction, Request, Response } from "express";
import { User } from "../../model/model";
import { verifyJWTToken } from "../../utils/auth";

export const authMiddleWare = async (req:Request, res: Response, next: NextFunction) => {

    try {

        if(!req.cookies['sword-session']) {
            res.status(401)
            res.json({error:'Authorization error'})
            return
        }

        const verified : User = await verifyJWTToken(req.cookies['sword-session'])
        const currentUser : User = {
            id: verified.id,
            name:verified.name,
            username: verified.username,
            userType: verified.userType

        }
        req.body.session = currentUser
        next()

    }

    catch(err) {
        res.status(401)
        res.json({error:'Authorization error'})
    }

    
}