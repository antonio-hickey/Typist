import { NextApiRequest, NextApiResponse } from "next";
import { wordList } from "../../../server/data";


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    /* Handles the context of the `/api/words/generate` api endpoint */

    if (!req.query.n) {
        res.status(400).json({error: "Number of words (integer) not provided in url query."});
    } else if (typeof req.query.chars === "string" && typeof req.query.n === "string"){
        res.status(200).json({words: getRandomWords(parseInt(req.query.n), getWordsWithCharsThatNeedWork(req.query.chars))});
    } else if (typeof req.query.n === "string") {
        res.status(200).json({words: getRandomWords(parseInt(req.query.n))});
    } else {
        res.status(400).json({error: "Invalid type for query parameter `n`."});
    };
}

function getRandomWords(numberOfWords: number, listOfWords?: string[]): string[] {
    /* Generate a given number of random words */

    if (listOfWords) {
        return Array.from(Array(numberOfWords).keys()).map(_ =>
            listOfWords[Math.floor(Math.random() * listOfWords.length)]!
        );
    };

    let words: string[] = wordList();
    return Array.from(Array(numberOfWords).keys()).map(_ =>
        words[Math.floor(Math.random() * words.length)]!
    );
}

function getWordsWithCharsThatNeedWork(charsThatNeedWork: string): string[] {
    /* Filter array of strings for words that contain characters. */

    let words: string[] = wordList();
    return Array.from(
        words.filter(
            word => {
                return charsThatNeedWork.split(",")
                       .some(char => word.includes(char))
            }
        )
    );
}
