import express, { Express } from 'express'
import { tasksRouter } from './modules/tasks'
import { userRouter } from './modules/user/users'
import cookieParser from 'cookie-parser'

const api : Express = express()

const PORT : number = parseInt(process.env.API_PORT ?? '3000')

api.use(express.json())
api.use(cookieParser())

/**
 * router to handle tasks routes
 */
api.use('/task', tasksRouter)

/**
 * router to handle users routes
 */

api.use('/user', userRouter)

api.listen(PORT, () => console.log(`api listening on port ${PORT}`))