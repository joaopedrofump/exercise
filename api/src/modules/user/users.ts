import { Router } from "express"
import { authuserRouter } from "./auth-routes"
import { noAuthuserRouter } from "./noauth-routes"

export const userRouter = Router()

/**
 * router to handle non autenticated users endpoints
 */

userRouter.use('/auth',noAuthuserRouter)

/**
 * router to secure endpoints
 */

 userRouter.use(authuserRouter)