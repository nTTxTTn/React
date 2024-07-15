import React from 'react';
import Notification from './Notification';
import notification from "./Notification";

const reserveNotifications = [
    {
        id: 1,
        message: "안녕하세요. 오늘의 일정을 알려드리겠습니다",
    },
    {
        id:2,
        message: "점심식사 시간입니다",
    },
    {
        id:3,
        message: "이제 곧 미팅이 시작됩니다.",
    },
];

var timer;

class NotificationList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            notifications: [],
        };
    }


//-----------생명주기--------------//
    componentDidMount() {
        const {notifications} = this.state;
        timer = setInterval(() => {
            if (notifications.length < reserveNotifications.length) {
                const index = notifications.length;
                notifications.push(reserveNotifications[index]);


                //-----state update--------//
                this.setState({
                    notifications: [],
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);
    }
    render() {
        return(
            <div>
                {this.state.notifications.map((notification) => {
                  return <Notification
                  key={notification.id}
                  id={notification.id}
                      message = {notification.message} />;
                })}
            </div>
        );
    }
}

export default NotificationList;

