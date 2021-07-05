import React, { useCallback, useState } from 'react'
import { SwordRequester } from '../../api/request'
import { login } from '../../api/user'
import { User } from '../../model/model'
import './loginform.css'

type Props = {
    onSuccess: (user: User) => void
    requester: SwordRequester
}

const LoginForm : React.FC<Props> = ({onSuccess,requester} : Props) => {

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')

    const changeUsername = useCallback((event:React.ChangeEvent<HTMLInputElement>) => setUsername(event.target.value), [])
    const changePassword = useCallback((event:React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value), [])

    const onClickLogin = useCallback(() => {

        login(requester,username,password)
          .then(({user}:{user:User}) => onSuccess(user))
          .catch((err:any) => setError(String(err.error ?? 'An error ocurred')))
    
      }, [requester,username,password,onSuccess,setError])

    return (
        <div aria-roledescription="login form" className="form">
            <input value={username} onChange={changeUsername} aria-label="username input" placeholder="username" type="text" id="username-input" />
            <input value={password} onChange={changePassword} aria-label="password input" type="password" id="password-input" placeholder="password" />
            <button onClick={onClickLogin}>login</button>
            {
                error !== '' 
                    ? <p className="error">{error}</p> 
                    : null
            }
        </div>
    )

}

export default LoginForm