import { Request, Response, Router } from "express"
import { taskController } from "../../controller/taskController"
import { userController } from "../../controller/userController"
import { User, UserType } from "../../model/model"
import { createSession, verifyJWTToken } from "../../utils/auth"
import { authMiddleWare } from "../middlewares/auth"

export const authuserRouter = Router()

authuserRouter.use(authMiddleWare)

authuserRouter.get('/', async (req:Request, res: Response) => {
    
    try {
        const user : User = req.body.session

        let userId
        if(user.userType === UserType.technician) {userId = user.id}

        const users = await userController.list(userId)

        res.json({users})
    }
    catch(err) {
        res.status(400)
        res.json({error: err})
    }

})

authuserRouter.post('/logout', async (req: Request, res: Response) => {

    try {

        res.clearCookie('sword-session')
        res.json({state:'Logeed out'})

    }
    catch (err) {
        res.status(400)
        res.json({ error: err })
    }

})

authuserRouter.post('/refresh-session', async (req: Request, res: Response) => {

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

        createSession(res,currentUser)

        res.json({user:currentUser})

    }
    catch (err) {
        res.status(401)
        res.json({ error: 'Authorization error' })
    }

})