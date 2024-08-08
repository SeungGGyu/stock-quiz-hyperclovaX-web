import requests
from bs4 import BeautifulSoup
import time
import json
import sys

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

    print(titles, contents, links)
    return titles, contents, links
    

if __name__ == "__main__":
    if len(sys.argv) > 1:
        keyword = sys.argv[1]
    else:
        keyword = input("Enter the keyword to search for: ")
    titles, contents, links = collect_news_data(keyword)
    data = {
        'titles': titles,
        'contents': contents,
        'links': links
    }
    print(data)
    with open('news_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
