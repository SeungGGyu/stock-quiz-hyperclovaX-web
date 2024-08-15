document.getElementById('generate-quiz').addEventListener('click', function() {
    const age = document.getElementById('age').value;
    const year = document.getElementById('year').value;
    const keyword = document.getElementById('keyword').value;
    console.log("사용자 입력값 출력 :", age, year, keyword)
    if (keyword === "" || age === "" || year === "") {
        alert("모든 필드를 입력하세요");
        return;
    }

    // Clear previous results
    document.getElementById('news-titles').innerText = "";
    document.getElementById('quiz-container').classList.add('hidden');

    // Display loading message
    document.getElementById('news-titles').innerText = "퀴즈를 생성하는 중입니다...";

    fetch('http://localhost:5000/generate_quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ age: age, year: year, keyword: keyword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('news-titles').innerText = data.error;
        } else {
            console.log(response)
            // Display the quiz
            document.getElementById('quiz-container').classList.remove('hidden');
            document.getElementById('news-titles').innerHTML = ""; // Clear loading message

            // Set the question
            document.getElementById('question').innerText = data["오늘의 질문"];
            const choicesContainer = document.getElementById('choices');
            choicesContainer.innerHTML = '';

            // Set the choices
            for (let i = 1; i <= 4; i++) {
                const choice = document.createElement('div');
                choice.innerHTML = `<input type="radio" name="choice" value="${i}"> ${data[i.toString()]}`;
                choicesContainer.appendChild(choice);
            }

            // Handle answer submission
            document.getElementById('submit-answer').onclick = function() {
                const selectedChoice = document.querySelector('input[name="choice"]:checked').value;
                const answerNumber = extractAnswerNumber(data["정답"]);

                if (selectedChoice === answerNumber) {
                    document.getElementById('result').innerText = "정답입니다!";
                } else {
                    document.getElementById('result').innerText = "오답입니다!";
                }

                document.getElementById('explanation').innerText = data["해설"];
            };
        }
    })
    .catch(error => {
        document.getElementById('news-titles').innerText = '퀴즈 생성에 실패했습니다.';
        console.error('Error:', error);
    });
});

function extractAnswerNumber(answerText) {
    const match = answerText.match(/정답\s*:\s*(\d)/);
    return match ? match[1] : null;
}
