import Controller, { CreateResult } from "../../controller/controller"
import { taskController } from "../../controller/taskController"
import { Task } from "../../model/model"
import { DateTime } from 'luxon'
import brokerController, { BrokerController } from "../../controller/broker-controller"
import mqtt, { AsyncClient, AsyncMqttClient } from 'async-mqtt'

beforeAll(async () => {

    await Controller.promisePool.execute('DELETE FROM Task')

})

describe('Task Controller', () => {

    test('create task with manager', async () => {

        expect(taskController.create('Task with Manager', 1)).rejects.toBe('Tasks can only be assigned to technicians')
        const tasks = await taskController.list(1)
        expect(tasks).toHaveLength(0)

    })

    test('create task with technician and expect it to be not completed and receive notficiation', async () => {
            
        const result: CreateResult = await taskController.create('Task Number 1', 3)
            const id = result.id
            expect(result.state).toBe('Task created')

            const tasks: Task[] = await taskController.list()
            const task = tasks.filter((task: Task) => task.id === id)[0]
            expect(task).toBeTruthy()
            expect(task.completionDate).toBeFalsy()

            await new Promise((resolve: Function) => setTimeout(() => resolve(), 3000))

    })

    test('create task with more than 2500 characters', async () => {

        let taskName = ''
        for (let i = 0; i < 2500; i++) { taskName += 'a' }

        /**
         * create with 2500 chars
         */

        const result: CreateResult = await taskController.create(taskName, 3)
        const id = result.id
        expect(result.state).toBe('Task created')

        const tasks: Task[] = await taskController.list()
        const task = tasks.filter((task: Task) => task.id === id)[0]
        expect(task).toBeTruthy()
        expect(task.completionDate).toBeFalsy()
        expect(tasks.length).toBe(1)

        taskName += 'a'

        /**
         * create with 2501 chars
         */

        expect(taskController.create(taskName, 3)).rejects.toBe('Length of summary exceeds the maximum length of 2500 characters')
        const tasksAfter: Task[] = await taskController.list()
        expect(tasksAfter.length).toBe(1)

    })


    test('list Tasks as Manager', async () => {

        await taskController.create('Task Number 1', 3)
        await taskController.create('Task Number 1', 4)

        const tasks: Task[] = await taskController.list()
        expect(tasks).toHaveLength(2)

    })

    test('list Tasks as Technician', async () => {

        await taskController.create('Task Number 1', 3)
        await taskController.create('Task Number 1', 4)

        const tasks: Task[] = await taskController.list(3)
        expect(tasks).toHaveLength(1)

    })

    test('complete task invalid date', async () => {

        const { id }: CreateResult = await taskController.create('Task Number 1', 3)
        return expect(taskController.completeTask('fsdfs', id, 3)).rejects.toBe('An error has ocurred')

    })

    test('complete task with creation user and get notified', async () => {

        let mqttClient: AsyncMqttClient | null = null

        try {
            let received = false

            mqttClient = await mqtt.connectAsync(BrokerController.BROKER_HOST)
            await mqttClient.subscribe(BrokerController.BROKER_HOST)
            mqttClient.subscribe(BrokerController.TASK_COMPLETION_TOPIC)
            mqttClient.addListener('message', (topicReceived: string, messageReceived: Uint8Array) => {

                if (topicReceived === BrokerController.TASK_COMPLETION_TOPIC) {

                    received = true

                }

            })

            const now = DateTime.now()
            const date = now.toFormat('yyyy-LL-dd HH:mm:ss')
            const { id }: CreateResult = await taskController.create('Task Number 1', 3)
            const result = await taskController.completeTask(date, id, 3)
            expect(result).toBe('Task Completed')

            const tasks: Task[] = await taskController.list()
            const task = tasks.filter((task: Task) => task.id === id)[0]
            expect(task).toBeTruthy()

            const dateBack = new Date(String(task.completionDate))

            const initialDate = new Date(now.year, now.month - 1, now.day, now.hour, now.minute, now.second)

            expect(initialDate).toStrictEqual(dateBack)

            await new Promise((resolve: Function) => setTimeout(() => resolve(), 3000))

            expect(received).toBe(true)

        }

        finally {
            mqttClient?.end()
        }

    })

    test('complete task with other user', async () => {

        const now = DateTime.now()
        const date = now.toFormat('yyyy-LL-dd HH:mm:ss')
        const { id }: CreateResult = await taskController.create('Task Number 1', 3)
        return expect(taskController.completeTask(date, id, 4)).rejects.toBe('No permission to update/delete this resource')


    })

    test('complete task with manager', async () => {

        const now = DateTime.now()
        const date = now.toFormat('yyyy-LL-dd HH:mm:ss')
        const { id }: CreateResult = await taskController.create('Task Number 1', 3)
        return expect(taskController.completeTask(date, id, 1)).rejects.toBe('No permission to update/delete this resource')


    })

    test('complete non existing task', async () => {

        return expect(taskController.completeTask('fsdfs', 10, 4)).rejects.toBe('No resource found with the id provided')

    })

    test('delete task with same technician user', async () => {

            const { id }: CreateResult = await taskController.create('Task Number 1', 3)
            await taskController.delete(id, 3)
            expect(taskController.list()).resolves.toHaveLength(0)
            await new Promise((resolve: Function) => setTimeout(() => resolve(), 3000))

    
    })

    test('delete task with manager', async () => {

        const { id }: CreateResult = await taskController.create('Task Number 1', 3)
        await taskController.delete(id)
        expect(taskController.list()).resolves.toHaveLength(0)

    })

    test('delete task with other technician user', async () => {

        const { id }: CreateResult = await taskController.create('Task Number 1', 3)
        expect(taskController.delete(id, 4)).rejects.toBe('No permission to update/delete this resource')
        expect(taskController.list()).resolves.toHaveLength(1)

    })

    test('delete non existing task', async () => {

        return expect(taskController.delete(1, 3)).rejects.toBe('No resource found with the id provided')

    })

    test('get a specific task', async () => {

        const { id }: CreateResult = await taskController.create('Task Number 1', 3)
        const task: Task = await taskController.getOne(id)
        expect(task.id).toBe(id)
        expect(task.summary).toBe('Task Number 1')
        expect(task.userId).toBe(3)
        expect(task.completionDate).toBe(null)

    })

})

afterEach(async () => {

    await Controller.promisePool.execute('DELETE FROM Task')

})

afterAll(async () => {
    Controller.close()
    brokerController.close()
})
