import {compare, hash} from 'bcryptjs'
import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../model/model'

export const EXPIRATION_SECONDS = 60 * 60
export const EXPIRATION_MILISECONDS = EXPIRATION_SECONDS * 1000

export const generateJWTSession = (payload: any, expiresIn:number) : string => {
    return jwt.sign(payload,String(process.env.SECRET),{
        expiresIn
    })
}

export const verifyJWTToken = (token : string) : Promise<any> => {

    return new Promise((res: Function, rej: Function) => {

        jwt.verify(token,String(process.env.SECRET), (err, decoded) => {

            if(err) 
                rej(err)
            else 
                res(decoded)

        })

    })

}

export const createSession = (res: Response, user: User) => {

    const jwt = generateJWTSession({ ...user }, EXPIRATION_SECONDS)
    /**
     * In production also set the domain and secure to true to ensure https
     */
    res.cookie('sword-session', jwt, { httpOnly: true, maxAge: EXPIRATION_MILISECONDS })

}
