from random import randrange

from app.python.data.words import failed_hashmap, word_list


def generate(number_of_words: int) -> list:
    """Generate a specified number of words"""
    # Initial word list
    if failed_hashmap == {}:
        return [word_list[randrange(1000)] for _ in range(number_of_words)]

    # Optimized word list
    words = words_that_need_work()
    return [words[randrange(len(words))] for _ in range(number_of_words)]


def words_that_need_work() -> list:
    """Grab a list of ALL words that conatin a failed char"""
    failed_chars = [key for key in failed_hashmap]
    words = []
    for char in failed_chars:
        for word in word_list:
            if char in word and word not in words:
                words.append(word)

    return words


def fill_hashmap(char: str) -> None:
    """Store failed characters in hashmap"""
    if char not in failed_hashmap:
        failed_hashmap[char] = 1
    else:
        failed_hashmap[char] = failed_hashmap[char] + 1
