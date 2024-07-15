import React from "react";

function Clock(props) {
    return(
        <div>
            <h1>현재 시간 : {new Date().toLocaleTimeString()}</h1>
        </div>
    );
}

export default Clock