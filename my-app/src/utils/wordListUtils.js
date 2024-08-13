export function loadWordLists(user) {
    const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
    return Promise.resolve(user ? loadedLists.filter(list => list.userId === user.sub) : loadedLists);
}

export function loadWordList(id) {
    const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
    return Promise.resolve(loadedLists.find(list => list.id === id));
}

export function saveWordList(newList) {
    const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
    const updatedLists = loadedLists.map(list =>
        list.id === newList.id ? newList : list
    );
    if (!loadedLists.find(list => list.id === newList.id)) {
        updatedLists.push(newList);
    }
    localStorage.setItem('wordLists', JSON.stringify(updatedLists));
    return Promise.resolve(newList);
}

export function deleteWordList(id, user) {
    const loadedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
    const updatedLists = loadedLists.filter(list => list.id !== id);
    localStorage.setItem('wordLists', JSON.stringify(updatedLists));
    return loadWordLists(user);
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}