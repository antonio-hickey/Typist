from flask import Flask
from flask_cors import CORS

from app.python.routes import words

application = Flask(__name__)
app = application
app.config['JSON_SORT_KEYS'] = False
CORS(app)


# Register routes blueprint
app.register_blueprint(words.blueprint)


@app.route("/")
def healthcheck():
    return "ok"
