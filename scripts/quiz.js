document.getElementById('generate-quiz').addEventListener('click', async () => {
    const age = document.getElementById('age').value;
    const year = document.getElementById('year').value;
    const keyword = document.getElementById('keyword').value;

    // Run the Python script and get news data
    await fetch(`/run_news_scraper?keyword=${keyword}`);
    const newsData = await fetch('/news_data.json').then(response => response.json());
    displayNewsTitles(newsData.titles);

    // Generate Quiz
    const quizData = await generateQuiz({
        age,
        year,
        keyword,
        articles: newsData.contents.join(" ")
    });
    displayQuiz(quizData);
});

async function generateQuiz(data) {
    const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return parseResponse(result);
}

async function generateQuiz(data) {
    const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return parseResponse(result);
}

function parseResponse(data) {
    const lines = data.split('\n');
    const parsedData = {
        question: "",
        choices: [],
        answer: "",
        explanation: ""
    };

    lines.forEach(line => {
        if (line.startsWith("오늘의 질문")) {
            parsedData.question = line;
        } else if (line.startsWith("1.")) {
            parsedData.choices.push(line);
        } else if (line.startsWith("2.")) {
            parsedData.choices.push(line);
        } else if (line.startsWith("3.")) {
            parsedData.choices.push(line);
        } else if (line.startsWith("4.")) {
            parsedData.choices.push(line);
        } else if (line.startsWith("정답")) {
            parsedData.answer = line;
        } else if (line.startsWith("해설")) {
            parsedData.explanation = line;
        }
    });

    return parsedData;
}

function displayNewsTitles(titles) {
    const newsTitlesDiv = document.getElementById('news-titles');
    newsTitlesDiv.innerHTML = '';
    titles.forEach(title => {
        const p = document.createElement('p');
        p.textContent = title;
        newsTitlesDiv.appendChild(p);
    });
}

function displayQuiz(quizData) {
    document.getElementById('question').textContent = quizData.question;
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    quizData.choices.forEach(choice => {
        const label = document.createElement('label');
        label.textContent = choice;
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'quiz-choice';
        radio.value = choice.split('.')[0];
        choicesDiv.appendChild(label);
        choicesDiv.appendChild(radio);
        choicesDiv.appendChild(document.createElement('br'));
    });
    document.getElementById('quiz-container').classList.remove('hidden');
}

document.getElementById('submit-answer').addEventListener('click', () => {
    const selectedChoice = document.querySelector('input[name="quiz-choice"]:checked');
    if (selectedChoice) {
        const selectedValue = selectedChoice.value;
        checkAnswer(selectedValue);
    }
});

async function checkAnswer(selectedValue) {
    const resultDiv = document.getElementById('result');
    const explanationDiv = document.getElementById('explanation');
    const quizResponse = await fetch('YOUR_API_ENDPOINT');  // 필요한 경우 API 요청 수정
    const quizData = await quizResponse.json();

    const answerNumber = extractAnswerNumber(quizData.answer);
    if (selectedValue == answerNumber) {
        resultDiv.textContent = "Correct!";
        resultDiv.classList.add('success');
    } else {
        resultDiv.textContent = "Incorrect!";
        resultDiv.classList.add('error');
    }

    explanationDiv.textContent = quizData.explanation;
}

function extractAnswerNumber(answerText) {
    const match = answerText.match(/정답\s*:\s*(\d)/);
    return match ? match[1] : null;
}
