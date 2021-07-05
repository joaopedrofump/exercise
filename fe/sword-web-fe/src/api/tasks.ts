import { DateTime } from "luxon"
import { Task } from "../model/model"
import { SwordRequester } from "./request"

export const getTasks = async(request: SwordRequester) : Promise<{tasks:Task[]}> => {

    return request('task')

}

export const createTask = async(request: SwordRequester, summary:string) : Promise<{tasks:Task[]}> => {

    return request('task', {method: 'post', body: JSON.stringify({summary})})

} 

export const deleteTask = async(request: SwordRequester, id:number) : Promise<{tasks:Task[]}> => {

    return request(`task/${id}`, {method: 'delete'})

}

export const completeask = async(request: SwordRequester, id:number) : Promise<{tasks:Task[]}> => {

    const now = DateTime.now()
    const date = now.toFormat('yyyy-LL-dd HH:mm:ss')

    return request(`task/${id}`, {method: 'put', body: JSON.stringify({date})})

} 

