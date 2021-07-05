import { DateTime } from 'luxon'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useMqttSubcription } from '../../api/broker'
import { SwordRequester } from '../../api/request'
import { getTasks } from '../../api/tasks'
import { Task as TaskModel, User, UserType } from '../../model/model'
import NewTask from './newtask/NewTask'
import Notifications from './notifications/Notifications'
import Task from './task/Task'
import './tasks.css'

type Props = {
    requester: SwordRequester
    user: User
}

const TASK_COMPLETION_TOPIC = '/task-completed'
const TASK_DELETION_TOPIC = '/task-deleted'
const TASK_CREATION_TOPIC = '/task-created'

const TOPICS = [
    TASK_COMPLETION_TOPIC,
    TASK_DELETION_TOPIC,
    TASK_CREATION_TOPIC
]

const Tasks: React.FC<Props> = ({ requester, user }) => {

    const [tasks, setTasks] = useState<TaskModel[]>([])
    const [error, setError] = useState<string>('')

    const isManager = useMemo(() => user.userType === UserType.manager, [user])

    const [notifications,setNotifications] = useState<string[]>([])
    const [notificationsOpened,setNotificationsOpened] = useState<boolean>(false)
    const closeNotifications = () => {
        setNotifications([])
        setNotificationsOpened(false)
    } 

    const [newTaskCollapsed, setNewTaskCollapsed] = useState<boolean>(true)
    const toggleCollapse = useCallback(() => setNewTaskCollapsed((prev: boolean) => !prev), [])

    const buttonLabel = newTaskCollapsed ? '+' : '-'

    const fetchTasks = useCallback(() => {

        getTasks(requester)
            .then(({ tasks }: { tasks: TaskModel[] }) => { 
                setTasks(tasks)
                setError('')
            })
            .catch((err) => setError(String(err)))

    }, [requester])

    const onReceiveNotification = useCallback((topic:string,message:string) => {

        if(topic === TASK_COMPLETION_TOPIC) {
            try {
    
                const {task,user} : {task:TaskModel,user:User} = JSON.parse(message)
                const date = DateTime.fromFormat(String(task.completionDate),"yyyy-LL-dd'T'HH:mm:ss.SSS'Z'")
                const dateFromIso = DateTime.fromISO(date.toISO()).toFormat('yyyy-LL-dd HH:mm:ss')
                
                const notification = `Technician ${user.name} has performed task ${task.summary} on ${dateFromIso}`
    
                setNotifications((prev:string[]) => [...prev,notification])
    
    
            }
            catch(err) {}
        }

        fetchTasks()

    }, [fetchTasks])

    useEffect(() => {

        if(notifications.length > 0 && !notificationsOpened) {

            setNotificationsOpened(true)

        }

    }, [notifications, notificationsOpened])

    const client = useMqttSubcription(TOPICS,onReceiveNotification)
    
    if(user.userType === UserType.technician) {
        client?.end()
    }

    useEffect(() => {

        fetchTasks()

    }, [requester,fetchTasks])

    return (
        <>
        <div>
            {
                notificationsOpened ? <Notifications notifications={notifications} onView={closeNotifications} /> : null
            }
        </div>
        <div className={notificationsOpened ? 'main-notifications-opened' : 'main'}>
            <h3>
                {isManager
                    ? 'All Tasks'
                    : 'My Tasks'
                }
                {
                    !isManager
                        ? <button onClick={toggleCollapse} className="add-task-button" aria-label="create new task">{buttonLabel}</button>
                        : null
                }
            </h3>
            {
                !isManager
                    ? <div className={newTaskCollapsed ? 'add-task-form-collapsed' : 'add-task-form'}><NewTask onSuccess={fetchTasks} requester={requester} user={user} /></div>
                    : null
            }
            {
                error !== ''
                    ? <p className="error">{error}</p>
                    : null
            }
            <table className="tasks-table">
                <thead>
                    <tr>
                        <th>Summary</th>
                        <th>Completion Date</th>
                        {
                            isManager ? <th>Responsible Technician</th> : null
                        }
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task: TaskModel) => (<Task onError={setError} onSuccess={fetchTasks} isManager={isManager} key={task.id} requester={requester} task={task} />))}
                </tbody>
            </table>

        </div>
        </>
    )

}

export default Tasks