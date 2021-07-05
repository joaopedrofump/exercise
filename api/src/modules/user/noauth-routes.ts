import { Request, Response, Router } from "express"
import { userController } from "../../controller/userController"
import { User } from "../../model/model"
import { createSession, generateJWTSession } from "../../utils/auth"

export const noAuthuserRouter = Router()

noAuthuserRouter.post('/login', async (req: Request, res: Response) => {

    try {
        const user: User = await userController.login(req.body.username, req.body.password)
        createSession(res,user)
        res.json({state:'Login ok', user})

    }
    catch (err) {
        res.status(400)
        res.json({ error: err })
    }

})