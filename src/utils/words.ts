import { Dispatch, SetStateAction } from "react";

const generateWords = (
  val: number,
  baseUrl: string,
  wordsDispatch: Dispatch<SetStateAction<string[]>>
) => {
  /* Generate initial random array of words */
  fetch(baseUrl + "/api/words/generate?n=" + val)
    .then((resp) => resp.json())
    .then((data) => {
      wordsDispatch(data.words);
    });
};

const generateNewWords = (
  val: number,
  baseUrl: string,
  wordsDispatch: Dispatch<SetStateAction<string[]>>
) => {
  /* Generate array of words that need more work on */

  let failedChars = new Set(sessionStorage.getItem("failedChars")?.split(","));
  fetch(
    baseUrl +
      "/api/words/generate?chars=" +
      Array.from(failedChars).join(",").slice(0, -1) +
      "&n=" +
      val
  )
    .then((resp) => resp.json())
    .then((data) => {
      wordsDispatch(data.words);
    });
};

const getWordClass = (wordIdx: number, currWordIdx: number) => {
  /* Create className value for current word */

  if (wordIdx === currWordIdx) {
    return "text-[30px] text-[#319795] ";
  }
};

const getCharClass = (
  roundStatus: string,
  words: string[],
  wordIdx: number,
  currWordIdx: number,
  charIdx: number,
  currCharIdx: number,
  char: string,
  currChar: string
): string => {
  /* Create className value for current character */

  if (
    wordIdx === currWordIdx &&
    charIdx === currCharIdx &&
    currChar &&
    roundStatus !== "finished"
  ) {
    if (char === currChar) {
      return "was-success";
    } else {
      let failedChars = window.sessionStorage.getItem("failedChars");
      if (failedChars == "") {
        window.sessionStorage.setItem("failedChars", char + ",");
      } else {
        if (!failedChars?.split(",").includes(char)) {
          window.sessionStorage.setItem(
            "failedChars",
            failedChars + char + ","
          );
        }
      }

      return "was-failure";
    }
  } else if (
    wordIdx === currWordIdx &&
    currCharIdx >= words[currWordIdx]!.length
  ) {
    return "was-failure";
  } else {
    return "";
  }
};

const getContentClass = () => {
  /* Sets the color of words content background based on color mode */
  var colorMode = window.localStorage["chakra-ui-color-mode"];
  return `content ${colorMode}`;
};

export {
  generateWords,
  generateNewWords,
  getWordClass,
  getCharClass,
  getContentClass,
};
