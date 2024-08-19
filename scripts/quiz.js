document.getElementById('generate-quiz').addEventListener('click', function() {
    const age = document.getElementById('age').value;
    const year = document.getElementById('year').value;
    const keyword = document.getElementById('keyword').value;
    console.log("사용자 입력값 출력 :", age, year, keyword);
    
    if (keyword === "" || age === "" || year === "") {
        alert("모든 필드를 입력하세요");
        return;
    }

    document.getElementById('question').innerText = "";
    document.getElementById('news-titles').innerHTML = "";
    document.getElementById('choices').innerHTML = "";
    document.getElementById('result').innerText = "";
    document.getElementById('explanation').innerText = "";

    // 로딩메세지
    document.querySelector('.right-section').classList.remove('hidden');
    document.getElementById('question').innerText = "퀴즈를 생성하는 중입니다...";

    fetch('https://smart-stock-c661884f5077.herokuapp.com/generate_quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ age: age, year: year, keyword: keyword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('question').innerText = data.error;
        } else {
            console.log(data);
            
            document.getElementById('question').innerText = data["오늘의 질문"];

            // 선택지 화면에 나오게
            const choicesContainer = document.getElementById('choices');
            choicesContainer.innerHTML = '';
            for (let i = 1; i <= 4; i++) {
                const choice = document.createElement('label');
                choice.classList.add('radio-container');
                choice.innerHTML = `
                    <input type="radio" name="choice" value="${i}">
                    <span class="custom-radio"></span>
                    ${data[i.toString()]}
                `;
                choicesContainer.appendChild(choice);
            }
            
            // 정답체크
            document.getElementById('submit-answer').onclick = function() {
                const selectedChoice = document.querySelector('input[name="choice"]:checked').value;
                const answerNumber = extractAnswerNumber(data["정답"]);
                const resultElement = document.getElementById('result');

                if (selectedChoice === answerNumber) {
                    resultElement.innerText = "정답입니다!";
                    resultElement.classList.remove('incorrect');
                    resultElement.classList.add('correct');
                } else {
                    resultElement.innerText = "오답입니다!";
                    resultElement.classList.remove('correct');
                    resultElement.classList.add('incorrect');
                }

                document.getElementById('explanation').innerText = data["해설"];

                // 정답 제출 이후에 기사 링크 보이도록
                const newsTitlesContainer = document.getElementById('news-titles');
                newsTitlesContainer.innerHTML = ''; 
                data.titles.forEach((title, index) => {
                    const linkElement = document.createElement('a');
                    linkElement.href = data.links[index];
                    linkElement.target = "_blank";
                    linkElement.innerText = title;
                
                    linkElement.classList.add('news-link');
                
                    newsTitlesContainer.appendChild(linkElement);
                });
            };
        }
    })
    .catch(error => {
        document.getElementById('question').innerText = '퀴즈 생성에 실패했습니다.';
        console.error('Error:', error);
    });
});

function extractAnswerNumber(answerText) {
    const match = answerText.match(/정답\s*:\s*(\d)/);
    return match ? match[1] : null;
}
