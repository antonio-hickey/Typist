import {
  RoundParams,
  CheckMatchParams,
  HandleKeyDownParams,
} from "../types/round";

import { generateWords, generateNewWords } from "./words";

const startRound = (params: RoundParams) => {
  /* Starts a new round of words */

  if (params.roundStatus === "finished") {
    params.currWordIdxDispatch(0);
    params.correctDispatch(0);
    params.incorrectDispatch(0);
    params.currCharIdxDispatch(-1);
    params.currCharDispatch("");
  }

  if (params.roundStatus !== "started") {
    params.roundStatusDispatch("started");
    params.hiddenDispatch(true);
    let interval = setInterval(() => {
      params.roundCountdownDispatch((prevCountdown: number) => {
        // When the minute runs out
        if (prevCountdown === 0) {
          if (sessionStorage.getItem("failedChars") == "") {
            generateWords(
              params.sliderValue,
              params.baseUrl,
              params.roundWordsDispatch
            );
          } else {
            generateNewWords(
              params.sliderValue,
              params.baseUrl,
              params.roundWordsDispatch
            );
          }
          clearInterval(interval);
          params.roundStatusDispatch("finished");
          params.hiddenDispatch(false);
          params.currInputDispatch("");
          params.roundCountdownPercentDispatch(100);
          return 60;
        } else {
          params.roundCountdownPercentDispatch(() => {
            return ((prevCountdown - 1) / 60) * 100;
          });
          return prevCountdown - 1;
        }
      });
    }, 1000);
  }
};

const checkMatch = (params: CheckMatchParams) => {
  /* Checks if the word matches the correct word */
  if (params.words[params.currWordIdx] === params.currInput.trim()) {
    params.correctDispatch((prev) => prev + 1);
  } else {
    params.incorrectDispatch((prev) => prev + 1);
  }
};

const handleKeyDown = (params: HandleKeyDownParams) => {
  /* Handles the logic on every key pressed down */
  var charCode = params.event.which ? params.event.which : params.event.keyCode;

  // space bar
  if (charCode === 32) {
    checkMatch({
      words: params.words,
      currWordIdx: params.currWordIdx,
      currInput: params.currInput,
      correctDispatch: params.correctDispatch,
      incorrectDispatch: params.incorrectDispatch,
    });
    params.currInputDispatch("");
    params.currWordIdxDispatch((prev) => prev + 1);
    params.currCharIdxDispatch(-1);
  }

  // backspace
  else if (charCode === 8) {
    params.currCharIdxDispatch((prev) => Math.max(-1, prev - 1));
    params.currCharDispatch("");
  }

  // a-z or '
  else if ((charCode > 64 && charCode < 91) || charCode === 222) {
    params.currCharIdxDispatch((prev) => prev + 1);
    params.currCharDispatch(params.event.key);
  }

  // out of scope
  else {
    params.event.preventDefault();
  }
};

export { startRound, checkMatch, handleKeyDown };
