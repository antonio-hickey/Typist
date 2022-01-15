from flask import Blueprint, jsonify, request

from app.python.repositories import words as words_repo

blueprint = Blueprint("words", __name__)


@blueprint.route("/generate-words/<number>/")
def generate_words(number: str):
    return jsonify(words_repo.generate(
        number_of_words=int(number),
    ))


@blueprint.route("/store-failure", methods=["POST"])
def store_failure():
    words_repo.fill_hashmap(
        char=(request.data).decode("utf-8")[1],
    )
    return "200"
