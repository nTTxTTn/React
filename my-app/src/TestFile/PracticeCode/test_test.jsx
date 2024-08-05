import React, { useState } from 'react';

function App() {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { title: 'Home', content: 'This is the Home tab.' },
        { title: 'About', content: 'This is the About tab.' },
        { title: 'Services', content: 'This is the Services tab.' },
        { title: 'Contact', content: 'This is the Contact tab.' },
    ];

    const handleTabClick = (index) => {
        setActiveTab(index);
    };

    return (
        <div>
            <div className="tabs">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`tab ${activeTab === index ? 'active' : ''}`}
                        onClick={() => handleTabClick(index)}
                    >
                        {tab.title}
                    </div>
                ))}
            </div>
            <div className="tab-content">
                {tabs[activeTab].content}
            </div>
        </div>
    );
}

export default App;