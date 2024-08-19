from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import time
import json
import os 

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return "Welcome to the Smart Stock Quiz API"

def get_search_results(keyword):
    response = requests.get(f"https://search.naver.com/search.naver?where=news&sm=tab_jum&query={keyword}&sort=0&pd=1d")
    html = response.text
    soup = BeautifulSoup(html, "html.parser")
    return soup.select("div.info_group")

def get_article_details(url):
    response = requests.get(url, headers={'User-agent': 'Mozilla/5.0'})
    html = response.text
    soup = BeautifulSoup(html, "html.parser")
    if "entertain" in response.url:
        title = soup.select_one(".end_tit")
        content = soup.select_one("#articeBody")
    elif "sports" in response.url:
        title = soup.select_one("h4.title")
        content = soup.select_one("#newsEndContents")
        divs = content.select("div")
        for div in divs:
            div.decompose()
        paragraphs = content.select("p")
        for p in paragraphs:
            p.decompose()
    else:
        title = soup.select_one(".media_end_head_headline")
        content = soup.select_one("#dic_area")
    return title.text.strip(), content.text.strip()

def collect_news_data(keyword):
    articles = get_search_results(keyword)
    titles = []
    contents = []
    links = []

    for i, article in enumerate(articles):
        if i >= 3:
            break
        links_in_article = article.select("a.info")
        if len(links_in_article) >= 2:
            url = links_in_article[1].attrs["href"]
            title, content = get_article_details(url)
            titles.append(title)
            contents.append(content)
            links.append(url)
            time.sleep(0.3)

    return titles, contents, links

class CompletionExecutor:
    def __init__(self, host, api_key, api_key_primary_val, request_id):
        self._host = host
        self._api_key = api_key
        self._api_key_primary_val = api_key_primary_val
        self._request_id = request_id

    def execute(self, completion_request):
        headers = {
            'X-NCP-CLOVASTUDIO-API-KEY': self._api_key,
            'X-NCP-APIGW-API-KEY': self._api_key_primary_val,
            'X-NCP-CLOVASTUDIO-REQUEST-ID': self._request_id,
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'text/event-stream'
        }

        with requests.post(self._host + '/testapp/v1/tasks/iqsmk52h/chat-completions',
                           headers=headers, json=completion_request, stream=True) as r:
            event_stream_data = []
            for line in r.iter_lines():
                if line:
                    event_stream_data.append(line.decode("utf-8"))
            return event_stream_data

def parse_event_stream(stream):
    last_message_content = None
    for line in stream:
        if line.startswith("data:"):
            data = json.loads(line[len("data:"):])
            if "message" in data and "content" in data["message"]:
                last_message_content = data["message"]["content"]
    return last_message_content

def parse_response(data, titles, links):
    lines = data.split('\n')
    parsed_data = {
        "오늘의 질문": "",
        "1": "",
        "2": "",
        "3": "",
        "4": "",
        "정답": "",
        "해설": ""
    }
    for line in lines:
        if line.startswith("오늘의 질문"):
            parsed_data["오늘의 질문"] = line
        elif line.startswith("1."):
            parsed_data["1"] = line
        elif line.startswith("2."):
            parsed_data["2"] = line
        elif line.startswith("3."):
            parsed_data["3"] = line
        elif line.startswith("4."):
            parsed_data["4"] = line
        elif line.startswith("정답"):
            parsed_data["정답"] = line
        elif line.startswith("해설"):
            parsed_data["해설"] = line
    return parsed_data, titles, links

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    age = data['age']
    year = data['year']
    keyword = data['keyword']
    
    titles, contents, links = collect_news_data(keyword)
    
    if contents:
        articles_content = " ".join(contents)
        preset_text = [
            {
                "role": "system",
                "content": (
                    "너는 사용자가 주는 최신 뉴스 기사의 내용을 취합해 사용자에게 주식 투자 교육 제공을 목적으로 퀴즈를 만들어줄거야."
                    "\n퀴즈는 사용자가 주는 최신기사 내용에서 주식 가격에 영향을 줄 정보를 중심으로, 사용자의 보유종목에 관해서 내줘."
                    "\n4지선다에 정답은 1개인 퀴즈이고, 딱 1개의 퀴즈만 만들면 돼."
                    "\n아래에 너가 해야하는 답변의 형식을 지정해줄게. 여기 ~~~부분에 너의 답변을 넣어주면 돼."
                    "\n\n[답변 형식]\n오늘의 질문 :~~~? \n1.~~~\n2.~~~\n3.~~~\n4.~~~\n\n정답 :~~~번 ~~~\n\n해설 :~~~"
                )
            },
            {
                "role": "user",
                "content": f"{articles_content}\n나이: {age}세\n투자경력: {year}년\n보유종목: {keyword}"
            }
        ]
        
        request_data = {
            'messages': preset_text,
            'topP': 0.8,
            'topK': 0,
            'maxTokens': 256,
            'temperature': 0.5,
            'repeatPenalty': 5.0,
            'stopBefore': [],
            'includeAiFilters': True,
            'seed': 0
        }

        completion_executor = CompletionExecutor(
            host='https://clovastudio.stream.ntruss.com',
            api_key='NTA0MjU2MWZlZTcxNDJiY45r/DkTDk7oBmqKVrH2tgppYRF/3kCtv0bwtT7ihqUM',
            api_key_primary_val='2vb3PzZVsMZcjwGY1yQG7xbuK0FqU7hrFGli34ou',
            request_id='76902a7a-2232-400c-843f-65a8edfc8e46'
        )

        event_stream_data = completion_executor.execute(request_data)
        response = parse_event_stream(event_stream_data)
        parsed_response, titles, links = parse_response(response, titles, links)
        
        # 기사 링크 제공을 위해 title, links도 같이 프론트로 보내기
        parsed_response['titles'] = titles
        parsed_response['links'] = links
        
        return jsonify(parsed_response)
    else:
        return jsonify({"error": "No news articles found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
