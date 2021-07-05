import { User } from "../model/model"
import { SwordRequester } from "./request"

export const refreshSession = async (requester: SwordRequester) : Promise<{user:User}>  => {

    return requester('user/refresh-session',{method: 'post'})

}

export const login = async (requester: SwordRequester, username:string, password:string) : Promise<{user:User}> => {

    return requester('/user/auth/login',{method: 'post', body: JSON.stringify({username,password})})

}


export const logout = async (requester: SwordRequester) : Promise<{user:User}> => {

    return requester('/user/logout',{method: 'post'})

} 