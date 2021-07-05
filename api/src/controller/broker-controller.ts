import mqtt, { AsyncClient } from 'async-mqtt'
import { Task, User } from '../model/model'

export class BrokerController {

    static BROKER_HOST = `mqtt://${process.env.BROKER_HOST}:${process.env.BROKER_PORT}`
    static TASK_COMPLETION_TOPIC = '/task-completed'
    static TASK_DELETION_TOPIC = '/task-deleted'
    static TASK_CREATION_TOPIC = '/task-created'

    private client: AsyncClient | null = null

    constructor() {

        mqtt.connectAsync(BrokerController.BROKER_HOST)
            .then((client) => {
                this.client = client
            })
    }

    async publishTaskCompletion(task: Task, user: User) {

        try {
            return await this.client?.publish(BrokerController.TASK_COMPLETION_TOPIC, JSON.stringify({ task, user }))
        }

        catch (err) {
            Promise.reject('An error ocurred while notifying task')
        }

    }
    async publishTaskCreation(task: Task) {

        try {
            return await this.client?.publish(BrokerController.TASK_CREATION_TOPIC, JSON.stringify(task))
        }

        catch (err) {
            Promise.reject('An error ocurred while notifying task')
        }

    }
    async publishTaskDeletion(task: Task) {

        try {
            return await this.client?.publish(BrokerController.TASK_DELETION_TOPIC, JSON.stringify({task}))
        }

        catch (err) {
            Promise.reject('An error ocurred while notifying task')
        }

    }

    close() {
        this.client?.end()
    }

}

export default new BrokerController()