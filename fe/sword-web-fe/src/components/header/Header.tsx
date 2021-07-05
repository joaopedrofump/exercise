import { useCallback } from 'react'
import { SwordRequester } from '../../api/request'
import { logout } from '../../api/user'
import { User } from '../../model/model'
import './header.css'

type Props = {
    user: User | null
    onLogout: () => void
    requester: SwordRequester
}

const Header : React.FC<Props> = ({user,onLogout,requester}) => {

    const logoutAction = useCallback(() => {
    
        logout(requester)
          .then(() => onLogout())
          .catch(err => console.error(err))
      } 
      , [requester,onLogout])

    return (
        <header className="header">
            <div className="logo">
                <h1>Sword Tasks</h1>
                {
                    !!user 
                    ? <p>profile: <em className="profile-type">{user.userType}</em></p>
                    : null
                }

            </div>
            <ul className="profile">
                <li>
                    {!!user 
                        ? <p>{user.name}</p>
                        : null
                    }
                </li>
                <li>
                    {!!user 
                        ? <button onClick={logoutAction}>logout</button>
                        : null
                    }
                </li>
            </ul>
        </header>
    )

}

export default Header