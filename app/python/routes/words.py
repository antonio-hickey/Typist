from flask import Blueprint, jsonify

from app.python.repositories import words as words_repo

blueprint = Blueprint("words", __name__)


@blueprint.route("/generate-words/<number>", methods=["GET"])
def generate_words(number: str):
    return jsonify(words_repo.generate(int(number)))
