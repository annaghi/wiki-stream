from flask import Flask, Response, request
import requests
import json

app = Flask(__name__)

WIKI_STREAM_URL = "https://stream.wikimedia.org/v2/stream/recentchange"


@app.route('/')
def home():
    return app.send_static_file('index.html')


@app.route('/wiki-stream')
def wiki_stream():
    def generate():
        # Connect to Wikimedia EventStreams
        session = requests.Session()

        # SSE connection
        response = session.get(
            WIKI_STREAM_URL,
            headers={'Accept': 'text/event-stream'},
            stream=True  # Important for SSE
        )

        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data:'):
                    try:
                        data = json.loads(line[5:])
                        # Filter and format the data we want to show
                        wiki_data = {
                            'type': data['type'],
                            'title': data['title'],
                            'user': data['user'],
                            'wiki': data['wiki'],
                            'timestamp': data['timestamp'],
                            'changetype': data.get('type'),
                            'length': data.get('length', {}).get('new', 0)
                        }
                        yield f"data: {json.dumps(wiki_data)}\n\n"
                    except json.JSONDecodeError:
                        continue

    response = Response(generate(), mimetype='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Connection'] = 'keep-alive'
    return response


if __name__ == '__main__':
    app.run(debug=True)
