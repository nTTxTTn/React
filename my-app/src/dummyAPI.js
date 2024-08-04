// dummyAPI.js

// 더미 데이터 생성 함수
const generateDummyWords = (count) => {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        term: `단어 ${index + 1}`,
        definition: `단어 ${index + 1}에 대한 정의입니다. 이것은 더미 데이터입니다.`
    }));
};

// 전체 더미 데이터 생성 (100개의 단어)
const allWords = generateDummyWords(100);

// API 요청 시뮬레이션 함수 - 단어 목록 가져오기
export const fetchWords = (page = 1, pageSize = 8) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const paginatedWords = allWords.slice(start, end);
            resolve({
                words: paginatedWords,
                hasMore: end < allWords.length
            });
        }, 500); // 0.5초 지연을 주어 실제 API 호출처럼 보이게 함
    });
};

// API 요청 시뮬레이션 함수 - 단어 상세 정보 가져오기
export const fetchWordDetail = (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const word = allWords.find(word => word.id === parseInt(id));
            if (word) {
                resolve({
                    ...word,
                    examples: [`예문 1 for ${word.term}`, `예문 2 for ${word.term}`],
                    synonyms: [`유의어 1 for ${word.term}`, `유의어 2 for ${word.term}`],
                });
            } else {
                resolve(null);
            }
        }, 300);
    });
};