import React from 'react';
import Comment from './Comment';

const comments =[
    {
        name : "홍길동",
        comment : "안녕하세요",
    },

    {
        name : "James",
        comment : "Hello",
    },

    {
        name : "김말동",
        comment : "안녕하세유",
    },
];

function CommentList(props){
    return(
        <div>
            {comments.map(comment =>{
               return(
                   <Comment name={comment.name} comment={comment.comment}/>
               ) ;
            })}
        </div>
    );
}

export default CommentList;