import { ResultSetHeader } from "mysql2"
import { Task } from "../model/model"
import brokerController from "./broker-controller"
import Controller, { CreateResult } from "./controller"
import { userController } from "./userController"

class TaskController extends Controller<Task> {

    constructor() {
        super()
        this.errors = {
            ...this.errors,
            1000: 'Tasks can only be assigned to technicians',
            1406: 'Length of summary exceeds the maximum length of 2500 characters'
        }
    }

    async create (summary:string, userId: number) : Promise<CreateResult> {

        try {
    
            const stmt = `INSERT INTO Task(summary,userId) VALUES(?,?)`
            const result = await Controller.promisePool.execute(stmt,[summary,userId])
            const finalResult = {state:'Task created', id: (result[0] as ResultSetHeader).insertId}
            await brokerController.publishTaskDeletion(await this.getOne(finalResult.id))
            return finalResult
    
        }
    
        catch(err) {
            return Promise.reject(this.getError(err.errno))
        }
    
    }

    async list(userId?: number) {

        try {

            const withUserId = typeof userId !== 'undefined'
    
            const query = !withUserId ? `SELECT Task.*, SUser.name FROM Task JOIN SUser ON SUser.id = Task.userId ORDER BY completionDate ASC ` : `SELECT * FROM Task WHERE userId = ?`
            const [rows] = await Controller.promisePool.execute(query,withUserId ? [userId] : [])
            return rows as Task[]
    
        }
    
        catch(err) {
            return Promise.reject(this.getError(err.errno))
        }
    
    }

    async delete(id: number, userId?:number) {

        try {

            const withUserId = typeof userId !== 'undefined'
            const task : Task = await this.getOne(id)
    
            if(!task) {return Promise.reject(this.getError(Controller.RESOURCE_NOT_FOUND))}
    
            else if (withUserId && task.userId !== userId) {return Promise.reject(this.getError(TaskController.RESOURCE_NOT_AUTHORIZED))}
    
            const stmt = `DELETE FROM Task WHERE id = ?`
            await Controller.promisePool.execute(stmt,[id])

            await brokerController.publishTaskDeletion(task)

            return 'Task Deleted'
    
        }
    
        catch(err) {
            return Promise.reject(this.getError(err.errno))
        }

    }

    async completeTask(date: string, id: number, userId: number) {

        try {
            
            const task : Task = await this.getOne(id)

            if(!task) {return Promise.reject(this.getError(Controller.RESOURCE_NOT_FOUND))}
            else if (task.userId !== userId) {return Promise.reject(this.getError(TaskController.RESOURCE_NOT_AUTHORIZED))}

            const stmt = `UPDATE Task SET completionDate = ? WHERE id = ?`
            await Controller.promisePool.execute(stmt,[date,id]) 

            const user = await userController.getOne(userId)
            const taskUpdated = await taskController.getOne(id)

            await brokerController.publishTaskCompletion(taskUpdated,user)

            return 'Task Completed'
    
        }
    
        catch(err) {
            return Promise.reject(this.getError(err.errno))
        }

    }

    async getOne(id:number) : Promise<Task> {

        try {

            const queryTask = 'SELECT * FROM Task WHERE id = ?'
            const queryResult = await Controller.promisePool.execute(queryTask,[id])
            const tasks = queryResult[0] as Task[]
            return tasks[0]

        }

        catch(err) {
            return Promise.reject(this.getError(err.errno))
        }

    }

}

export const taskController = new TaskController()