import React, { useCallback, useState } from 'react';
import { SwordRequester } from "../../../api/request";
import { createTask } from '../../../api/tasks';
import { User } from "../../../model/model";
import './newtask.css';

const MAX_LENGTH = 2500

type Props = {
    requester: SwordRequester
    user: User
    onSuccess: () => void
}

const NewTask : React.FC<Props> = ({requester,user, onSuccess}) => {

    const [summary, setSummary] = useState<string>('')
    const [error, setError] = useState<string>('')
    const changeUsername = useCallback((event:React.ChangeEvent<HTMLTextAreaElement>) => setSummary(event.target.value), [])

    const left = MAX_LENGTH-summary.length

    const createTaskAction = () => {

           createTask(requester,summary)
            .then(() => {
                onSuccess()
                setSummary('')
            })
            .catch(err => setError(String(err)))

    }

    return (
        <div aria-roledescription="create task form" className="new-task-form">
            <div className="internal-div">
                <textarea 
                    maxLength={2500}
                    rows={5}
                    className="new-task"
                    aria-label="summary input" 
                    placeholder="Task summary" 
                    value={summary} 
                    onChange={changeUsername} 
                />
                <p className="left">
                    {left} characters left
                </p>
                <button onClick={createTaskAction} className="confirm">Create new task</button>
                {
                    error !== '' 
                        ? <p className="error">{error}</p> 
                        : null
                }
            </div>
        </div>
    )

}

export default NewTask

