import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Library from "./JSX_TEST/Library";
import Clock from "./Clock/Clock";
import CommentList from "./Comment/CommentList";
import notificationList from "./Notification/NotificationList";
import NotificationList from "./Notification/NotificationList";

/*
------------테스트-------------
ReactDOM.render(
    <React.StrictMode>
        <Library />
    </React.StrictMode>,
    document.getElementById('root')
);*/

/*
-------------시계-------------
setInterval(() => {
    ReactDOM.render(
        <React.StrictMode>
            <Clock/>
        </React.StrictMode>,
        document.getElementById('root')
    );
},1000) */

/*
------------댓글--------------
ReactDOM.render(
    <React.StrictMode>
        <CommentList/>
    </React.StrictMode>,
    document.getElementById('root')
);
*/

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);







// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();