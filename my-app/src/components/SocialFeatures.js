import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import '../ReactCSS/SocialFeatures.css';

const SocialFeatures = () => {
    const { user } = useUser();
    const [friends, setFriends] = useState([]);
    const [sharedLists, setSharedLists] = useState([]);

    useEffect(() => {
        if (user) {
            setFriends(JSON.parse(localStorage.getItem(`friends_${user.sub}`)) || []);
            setSharedLists(JSON.parse(localStorage.getItem(`shared_lists_${user.sub}`)) || []);
        }
    }, [user]);

    const shareWordList = (wordListId, friendId) => {
        const newSharedLists = [...sharedLists, { wordListId, friendId }];
        setSharedLists(newSharedLists);
        localStorage.setItem(`shared_lists_${user.sub}`, JSON.stringify(newSharedLists));
    };

    return (
        <div className="social-features">
            <div className="friends-section">
                <h2 className="section-title">친구 목록</h2>
                {friends.length > 0 ? (
                    <ul className="friends-list">
                        {friends.map(friend => (
                            <li key={friend.id} className="friend-item">
                                <img src={friend.avatar} alt={friend.name} className="friend-avatar" />
                                <span className="friend-name">{friend.name}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-friends">아직 친구가 없습니다.</p>
                )}
            </div>
            <div className="shared-lists-section">
                <h2 className="section-title">공유된 단어장</h2>
                {sharedLists.length > 0 ? (
                    <ul className="shared-lists">
                        {sharedLists.map((sharedList, index) => (
                            <li key={index} className="shared-list-item">
                                <span className="shared-list-name">단어장 {sharedList.wordListId}</span>
                                <span className="shared-with">친구 {sharedList.friendId}와 공유중</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-shared-lists">아직 공유된 단어장이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default SocialFeatures;