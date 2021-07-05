import {Router, Request, Response} from 'express'
import { DateTime } from 'luxon'
import { taskController } from '../controller/taskController'
import { User, UserType } from '../model/model'
import { authMiddleWare } from './middlewares/auth'

export const tasksRouter = Router()

tasksRouter.use(authMiddleWare)

tasksRouter.post('/', async (req: Request, res: Response) => {

    try {

        const user : User = req.body.session
        const response = await taskController.create(req.body.summary, Number(user.id))
        res.json({state:response})
    
    }
    catch(err) {
        res.status(400)
        res.json({error: err})
    }

})

tasksRouter.get('/', async (req: Request, res: Response) => {

    try {
        const user : User = req.body.session

        let userId
        if(user.userType === UserType.technician) {userId = user.id}

        const tasks = await taskController.list(userId)

        res.json({tasks})
    }
    catch(err) {
        res.status(400)
        res.json({error: err})
    }

})

tasksRouter.delete('/:id', async (req: Request, res: Response) => {

    try {
        const id = parseInt(req.params.id)
        const user : User = req.body.session

        let userId
        if(user.userType === UserType.technician) {userId = user.id}

        const response = await taskController.delete(id,userId)
        res.json({state:response})
    }
    catch(err) {
        res.status(400)
        res.json({error: err})
    }

})

tasksRouter.put('/:id', async (req: Request, res: Response) => {

    try {

        const id = parseInt(req.params.id)
        const user : User = req.body.session
        const response = await taskController.completeTask(req.body.date,id,Number(user.id))
        res.json({state:response})
    }
    catch(err) {
        res.status(400)
        res.json({error: err})
    }

})