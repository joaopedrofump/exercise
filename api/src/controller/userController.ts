import { compare, hash } from "bcryptjs";
import { ResultSetHeader } from "mysql2";
import { User, UserType } from "../model/model";
import Controller, { CreateResult } from "./controller";

class UserController extends Controller<User> {

    static WRONG_CREDENTIALS = Controller.errorCode++
    static UNSECURE_PWD = Controller.errorCode++

    constructor() {
        super()
        this.errors = {
            ...this.errors,
            [UserController.WRONG_CREDENTIALS]: 'Invalid username or password',
            [UserController.UNSECURE_PWD]: 'Password must be 8 characters long and contain 1 lowercase letter, 1 uppercase letter and 1 number',

        }
    }

    async create(name: string, password: string, username: string, type: UserType): Promise<CreateResult> {

        try {

            const pwdRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.{8,}).*$/
            if (!pwdRegex.test(password)) {
                return Promise.reject(this.getError(UserController.UNSECURE_PWD))
            }

            const hashedPwd = await hash(password, 10)

            const stmt = `INSERT INTO SUser(username,name,password,userType) VALUES(?,?,?,?)`
            const result = await Controller.promisePool.execute(stmt, [username, name, hashedPwd, type])
            return { state: 'User Created', id: (result[0] as ResultSetHeader).insertId }

        }

        catch (err) {
            return Promise.reject(this.getError(err.errno))
        }

    }

    async list(userId?: number) {

        const withUserId = typeof userId !== 'undefined'

        try {
            const query = !withUserId ? `SELECT id,name,username,userType FROM SUser` : `SELECT id,name,username,userType FROM SUser WHERE id = ?`
            const [rows] = await Controller.promisePool.execute(query, withUserId ? [userId] : [])
            return rows as User[]
        }
        catch (err) {
            return Promise.reject(this.getError(err.errno))
        }

    }
    
    async delete(id: number, userId?: number) {
        
        const withUserId = typeof userId !== 'undefined'
        try {

            const user: User = await this.getOne(id)

            if (!user) { return Promise.reject(this.getError(Controller.RESOURCE_NOT_FOUND)) }

            else if (withUserId && user.id !== userId) { return Promise.reject(this.getError(Controller.RESOURCE_NOT_AUTHORIZED)) }

            const stmt = `DELETE FROM SUser WHERE id = ?`
            await Controller.promisePool.execute(stmt, [id])
            return 'User Deleted'

        }

        catch (err) {
            return Promise.reject(this.getError(err.errno))
        }
    }

    async login(username: string, password: string): Promise<User> {

        try {

            const query = `SELECT * FROM SUser WHERE username = ?`
            const queryResult = await Controller.promisePool.execute(query, [username])

            interface UserWithPass extends User {
                password: string
            }

            const result = queryResult[0] as UserWithPass[]

            if (!result.length) {
                return Promise.reject(this.getError(UserController.WRONG_CREDENTIALS))
            }

            const passwordVerified = await compare(password, result[0].password)

            if (passwordVerified) {
                return {
                    userType: result[0].userType,
                    id: result[0].id,
                    name: result[0].name,
                    username: result[0].username
                }
            }
            else {
                return Promise.reject(this.getError(UserController.WRONG_CREDENTIALS))
            }

        }

        catch (err) {
            return Promise.reject(this.getError(err.errno))
        }

    }

    async getOne(id:number) : Promise<User> {

        try {

            const queryUser = 'SELECT id,name,userType FROM SUser WHERE id = ?'
            const queryResult = await Controller.promisePool.execute(queryUser,[id])
            const users = queryResult[0] as User[]
            return users[0]

        }

        catch(err) {
            return Promise.reject(this.getError(err.errno))
        }

    }

}

export const userController = new UserController()