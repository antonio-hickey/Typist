from random import randrange

from app.python.data.words import word_list


def generate(number_of_words: int) -> list:
    """Generate 200 random common words"""
    idx = [randrange(1000) for x in range(number_of_words)]
    words = [word_list[i] for i in idx]
    return words
