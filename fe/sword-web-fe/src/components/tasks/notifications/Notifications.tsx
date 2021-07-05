import React from 'react'
import "./notifications.css"

type Props = {
    notifications: string[]
    onView: () => void
}

const Notifications : React.FC<Props> = ({notifications,onView}) => {

    return (
        <div className="wrapper">
            <div className="notifications">
                {notifications.map((notification:string,index:number) => {

                    return (
                        <p key={index}>{notification}</p>
                    )

                })}
                <button onClick={onView}>Ok</button>
            </div>
        </div>
    )

}

export default Notifications