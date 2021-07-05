import * as mysql from 'mysql2'
import { Pool } from 'mysql2'
import { Pool as PromisePool } from 'mysql2/promise'
import { Task } from '../model/model'

export type CreateResult = {
    state:string
    id:number
}

export default abstract class Controller<T> {

    errors: {[x:number]: string}
    abstract create(...params: any) : Promise<CreateResult>
    abstract delete(id:number, ...rest:any) : Promise<string>
    abstract list(...params:any) : Promise<T[]>
    abstract getOne(id:number) : Promise<T>

    static pool : Pool = mysql.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.MYSQL_DATABASE_USER,
        password: process.env.MYSQL_DATABASE_PWD,
        waitForConnections:true,
        connectionLimit: 10,
        database: process.env.MYSQL_DATABASE_NAME
    })
    
    static promisePool : PromisePool = Controller.pool.promise()
    static errorCode = 0
    static DEFAULT_ERROR_CODE = Controller.errorCode++
    static RESOURCE_NOT_FOUND = Controller.errorCode++
    static RESOURCE_NOT_AUTHORIZED = Controller.errorCode++
    
    constructor() {
        this.errors = {
            [Controller.DEFAULT_ERROR_CODE]: 'An error has ocurred',
            [Controller.RESOURCE_NOT_FOUND]: 'No resource found with the id provided',
            [Controller.RESOURCE_NOT_AUTHORIZED]: 'No permission to update/delete this resource'
        }
    }

    getError(errno?:number) : string {

        if(!errno) {
            return this.errors[Controller.DEFAULT_ERROR_CODE]
        }

        return this.errors[errno] ?? this.errors[Controller.DEFAULT_ERROR_CODE]

    }  

    static close() {
        Controller.pool.end()
    }

}

