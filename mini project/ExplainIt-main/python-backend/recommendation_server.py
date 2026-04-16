from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from keybert import KeyBERT
import requests
import os
from dotenv import load_dotenv

# =========================
# CONFIGURATION
# =========================
load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("API_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")

# =========================
# LOAD EMBEDDING MODEL
# =========================

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
kw_model = KeyBERT(model=embedding_model)

# =========================
# KEYWORD EXTRACTION
# =========================

def extract_keywords(text, num_keywords=5):
    """
    Extract top key phrases from document text
    """

    # Limit text length for speed
    short_text = text[:1500]

    keywords = kw_model.extract_keywords(
        short_text,
        keyphrase_ngram_range=(1, 2),
        stop_words='english',
        top_n=num_keywords
    )

    # keywords format: [("logistic regression", 0.82), ...]
    return [kw[0] for kw in keywords]


# =========================
# GOOGLE SEARCH CORE
# =========================

def google_search(query, num_results=5):
    url = "https://www.googleapis.com/customsearch/v1"

    params = {
        "key": API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "num": num_results
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []
    seen_links = set()

    if "items" in data:
        for item in data["items"]:
            link = item.get("link", "")

            if link not in seen_links:
                seen_links.add(link)
                results.append({
                    "title": item.get("title", ""),
                    "link": link
                })

    return results


# =========================
# ARTICLE SEARCH
# =========================

def search_articles(query):
    search_query = f"{query} explanation overview"

    results = google_search(search_query, num_results=10)

    filtered = []
    for r in results:
        link = r["link"].lower()
        title = r["title"].lower()

        if "youtube" in link:
            continue
        if "course" in title or "tutorial" in title:
            continue

        filtered.append(r)

    return filtered[:5]


# =========================
# VIDEO SEARCH
# =========================

def search_videos(query):
    search_query = f"{query} explanation site:youtube.com"

    results = google_search(search_query, num_results=10)

    videos = []
    for r in results:
        if "youtube.com/watch" in r["link"]:
            videos.append(r)

    return videos[:5]


# =========================
# MAIN PIPELINE
# =========================

def recommend_resources(text):
    keywords = extract_keywords(text)

    if not keywords:
        return "", [], []

    # Combine top 3 keywords for better context
    query = " ".join(keywords[:3])

    articles = search_articles(query)
    videos = search_videos(query)

    # Use first keyword as main detected topic
    return keywords[0], articles, videos


# =========================
# FLASK ROUTES
# =========================

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Python recommendation server is running!"})


@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        text = data.get('text', '')

        if not text or text.strip() == '':
            return jsonify({
                "error": "No text provided",
                "topic": "",
                "articles": [],
                "videos": []
            }), 400

        # Skip placeholder texts
        if '[PDF - will be processed on server]' in text or \
           '[Image document - will be analyzed using vision]' in text or \
           '[DOCX content - extraction failed]' in text:
            return jsonify({
                "error": "Cannot analyze placeholder content",
                "topic": "",
                "articles": [],
                "videos": []
            }), 400

        topic, articles, videos = recommend_resources(text)

        return jsonify({
            "topic": topic,
            "articles": articles,
            "videos": videos
        })

    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        return jsonify({
            "error": str(e),
            "topic": "",
            "articles": [],
            "videos": []
        }), 500


# =========================
# SERVER
# =========================

if __name__ == '__main__':
    print("✅ Python Recommendation Server starting...")
    print(f"✅ Google API Key Loaded: {'YES' if API_KEY else 'NO'}")
    print(f"✅ Search Engine ID Loaded: {'YES' if SEARCH_ENGINE_ID else 'NO'}")
    app.run(port=5000, debug=True)