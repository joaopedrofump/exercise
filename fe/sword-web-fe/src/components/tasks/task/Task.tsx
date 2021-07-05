import React, { useCallback } from 'react'
import { SwordRequester } from '../../../api/request'
import { completeask, deleteTask } from '../../../api/tasks'
import { Task as TaskModel } from '../../../model/model'
import "./task.css"

type Props = {
    requester: SwordRequester
    task: TaskModel
    isManager: boolean
    onSuccess: () => void
    onError: (error: string) => void
}

const Task: React.FC<Props> = ({ task, requester, onSuccess, onError, isManager }) => {

    const deleteTaskAction = useCallback(() => {

        deleteTask(requester,task.id)
            .then(() => onSuccess())
            .catch(err => onError(String(err)))

    }, [task,requester,onSuccess,onError])

    const completeTaskAction = useCallback(() => {

        completeask(requester,task.id)
            .then(() => onSuccess())
            .catch(err => onError(String(err)))

    }, [task,requester,onSuccess,onError])

    return (
        <tr className={!!task.completionDate ? 'task-completed' : ''}>
            <td>
                {task.summary}
            </td>
            <td>
                {task.completionDate ?? 'Not completed'}
            </td>
            {
                isManager ? <td>{task.name}</td> : null
            }
            <td>
                <button onClick={deleteTaskAction}>Delete</button>
                {!isManager
                    ? <button onClick={completeTaskAction} className="complete-button">Mark as completed</button>
                    : null
                }
            </td>
        </tr>
    )

}

export default Task