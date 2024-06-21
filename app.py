from flask import Flask, render_template, request, jsonify
import difflib
import requests
from bs4 import BeautifulSoup
import re
from flask_cors import CORS
from konlpy.tag import Kkma, Komoran, Okt, Hannanum
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app, origins=["chrome-extension://hioajkoafncgageignkjgenckmfkojbn"])

# KoNLPy의 Okt 객체를 생성
okt = Okt()

# 영어와 한국어 명사 가져오는 코드
def get_nouns_and_english(sentence):
    tokens = okt.pos(sentence, norm=True, stem=True)
    words = []
    for word, pos in tokens:
        if pos in ('Noun') or word.encode('utf-8').isalpha():  # 영어 단어도 포함
            words.append(word)
    return words

# 불용어 처리 함수
def removing_stopwords(words):
    for word in words:
        if len(word) == 1:
            words.remove(word)
        elif word in ('이다', '있다'):
            words.remove(word)
    return words


@app.route('/extract', methods=['POST'])
def extract():
    # 데이터 긁어오기
    data = request.get_json()
    url = data['url']  # Get URL from the POST request data
    print(url)
    # Fetch
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # 전체 텍스트 크롤링
    text = soup.get_text(separator='\n', strip=True)

    # "필수항목" 관련 텍스트 뽑기
    required_info = re.findall(r"필수항목([^,]+(?:, [^,]+)*)", text)
    ans = required_info[0].strip() if required_info else ""

    data = {'텍스트': [ans]}  # 'ans'는 당신이 제공한 문자열 변수입니다.
    df = pd.DataFrame(data)



    # DataFrame의 '텍스트' 열에 토큰화 작업 적용
    df['토큰'] = df["텍스트"].apply(lambda x: okt.pos(x, norm=True, stem=True))

    # 명사, 형용사
    df['토큰'] = df['텍스트'].apply(lambda x: get_nouns_and_english(x))
    # 스토핑 단어 제거
    df['토큰'] = df['토큰'].apply(lambda x: removing_stopwords(x))

    df_exploded = df.explode('토큰')

    word_df = df_exploded["토큰"]

    # 인덱스 리셋 밑 앞 행 제거
    word_df.reset_index(drop=True, inplace=True)

    icon_list = []

    for i in range(len(word_df) - 1):  # len(word_df) - 1을 사용하여 인덱스 범위 오류 방지
        word = word_df.iloc[i]
        if word in ["ID", "아이디"]:
            icon_list.append("아이디")
        if word == "비밀번호":
            icon_list.append("비밀번호")
        if word in ["mail", "Mail", "메일", "이메일"]:
            icon_list.append("이메일")
        if word in ["이름", "성명"]:
            icon_list.append("이름")
        if word in ["생년", "출생"]:
            icon_list.append("생년월일")
        if word in ["휴대전화", "휴대폰", "휴대폰번호", "전화번호", "휴대전화번호"]:
            icon_list.append("전화번호")
        if word in ["IP", "아이피"]:
            icon_list.append("IP")
        if word == "위치":
            icon_list.append("위치정보")
        if word == "기록":
            icon_list.append("접속기록")
        if word in ["OS", "기기"]:
            icon_list.append("기기정보")
        if word == "프로필" and word_df.iloc[i + 1] == "사진":
            icon_list.append("프로필사진")

    results = list(set(icon_list))

    return jsonify(results)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)


