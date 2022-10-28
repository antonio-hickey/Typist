import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  VStack,
  Tooltip,
  Slider,
  SliderThumb,
  SliderTrack,
  SliderFilledTrack,
} from "@chakra-ui/react";

import { useEffect, useState, KeyboardEvent } from "react";

import { startRound, handleKeyDown } from "./../utils/round";
import {
  getCharClass,
  getContentClass,
  getWordClass,
  generateWords,
} from "./../utils/words";
import { updateHighScore } from "../utils/score";

import type { Session } from "next-auth";

interface GameBoxProps {
  baseUrl: string;
  session: Session | null;
}

export default function GameBox(props: GameBoxProps) {
  const [wordsForRound, setWordsForRound] = useState<string[]>([]);
  const [roundStatus, setRoundStatus] = useState("waiting");
  const [roundCountdown, setRoundCountdown] = useState(60);
  const [roundCountdownPercent, setRoundCountdownPercent] = useState(100);
  const [sliderValue, setSliderValue] = useState(50);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currInput, setCurrInput] = useState("");
  const [currWordIdx, setCurrWordIdx] = useState(0);
  const [currCharIdx, setCurrCharIdx] = useState(-1);
  const [currChar, setCurrChar] = useState("");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [hidden, setHidden] = useState(false);

  const setInputFocus = (input: HTMLInputElement | null) => {
    /* Sets the text input to focus */
    if (typeof input !== null && roundStatus === "started") {
      input?.focus();
    }
  };

  useEffect(() => {
    // Generate the number of words based on slider value
    if (wordsForRound.length == 0) {
      generateWords(sliderValue, props.baseUrl, setWordsForRound);
    }
  }, [sliderValue]);

  useEffect(() => {
    // Updates user's high score
    if (props.session && roundStatus == "finished") {
      let wpm = correct;
      let accuracy = (correct / (correct + incorrect)) * 100;
      let score = Math.round(wpm * accuracy);

      if (!props.session.user?.highScore) {
        updateHighScore(props.baseUrl, props.session.user?.id!, score);
      } else if (wpm * accuracy > props.session.user?.highScore!) {
        updateHighScore(props.baseUrl, props.session.user?.id!, score);
      }
    }
  }, [roundStatus, props.session]);

  return (
    <div className="flex flex-col m-auto">
      <Box
        textAlign="center"
        fontSize="xl"
        maxW="4xl"
        w={["sm", "lg", "2xl", "4xl"]}
        borderWidth="2px"
        borderRadius="xl"
        boxShadow="dark-lg"
        borderColor="gray.500"
        backgroundColor="rgba(26, 32, 44, 0.85)"
        alignContent={"center"}
        alignItems={"center"}
        alignSelf={"center"}
        justifyContent={"center"}
        p={10}
      >
        <div className="flex flex-col m-auto">
          <VStack spacing={10}>
            <div className="flex justify-center items-center">
              <div className="pb-[20px] text-[120px] text-center">
                <CircularProgress
                  value={roundCountdownPercent}
                  trackColor={"RGBA(0, 0, 0, 0.34)"}
                  color="#319795"
                  size="200px"
                >
                  <CircularProgressLabel>
                    {roundCountdown}
                  </CircularProgressLabel>
                </CircularProgress>
              </div>
            </div>

            <div className="w-15">
              {["finished", "waiting"].includes(roundStatus)
                ? [
                    <>
                      <h2>Select the number of words: {sliderValue}</h2>
                      <Slider
                        key="numberOfWordsSlider"
                        id="slider"
                        defaultValue={50}
                        min={10}
                        max={200}
                        step={10}
                        colorScheme="solidteal"
                        onChange={(v: number) => setSliderValue(v)}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        isDisabled={roundStatus === "started"}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <Tooltip
                          hasArrow
                          bg="teal"
                          color="white"
                          placement="top"
                          isOpen={showTooltip}
                          label={`${sliderValue} words`}
                        >
                          <SliderThumb boxSize={6} />
                        </Tooltip>
                      </Slider>
                    </>,
                  ]
                : null}
            </div>

            <div className="flex justify-center items-center">
              <input
                ref={(e: HTMLInputElement) => setInputFocus(e)}
                disabled={roundStatus !== "started"}
                type="text"
                className="input"
                onKeyDown={(keyEvent: KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown({
                    event: keyEvent,
                    words: wordsForRound,
                    currCharDispatch: setCurrChar,
                    currCharIdxDispatch: setCurrCharIdx,
                    currWordIdx: currWordIdx,
                    currWordIdxDispatch: setCurrWordIdx,
                    currInput: currInput,
                    currInputDispatch: setCurrInput,
                    correctDispatch: setCorrect,
                    incorrectDispatch: setIncorrect,
                  })
                }
                value={currInput}
                onChange={(e) => setCurrInput(e.target.value)}
                placeholder="Type Here..."
              />
            </div>
            <div className="flex justify-center items-center">
              {!hidden ? (
                <Button
                  onClick={() =>
                    startRound({
                      baseUrl: props.baseUrl,
                      currInputDispatch: setCurrInput,
                      currWordIdxDispatch: setCurrWordIdx,
                      currCharDispatch: setCurrChar,
                      currCharIdxDispatch: setCurrCharIdx,
                      correctDispatch: setCorrect,
                      incorrectDispatch: setIncorrect,
                      roundCountdownDispatch: setRoundCountdown,
                      roundCountdownPercentDispatch: setRoundCountdownPercent,
                      hiddenDispatch: setHidden,
                      roundStatus: roundStatus,
                      roundStatusDispatch: setRoundStatus,
                      roundWordsDispatch: setWordsForRound,
                      sliderValue: sliderValue,
                    })
                  }
                  colorScheme="btnteal"
                  className="!hover:bg-violet-600"
                >
                  Start Typing!
                </Button>
              ) : null}
            </div>
            {roundStatus === "started" && (
              <div className="flex justify-center items-center">
                <div className="px-5">
                  <div className={`${getContentClass()} rounded-lg px-5 py-2`}>
                    {wordsForRound.map((word, wordIdx) => (
                      <span key={wordIdx}>
                        <span
                          key={wordIdx}
                          className={getWordClass(wordIdx, currWordIdx)}
                        >
                          {word.split("").map((char, charIdx) => (
                            <span
                              className={getCharClass(
                                roundStatus,
                                wordsForRound,
                                wordIdx,
                                currWordIdx,
                                charIdx,
                                currCharIdx,
                                char,
                                currChar
                              )}
                              key={charIdx}
                            >
                              {char}
                            </span>
                          ))}
                        </span>
                        <span> </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {roundStatus === "finished" && (
              <div className="flex justify-center items-center">
                <div className="columns">
                  <div className="text-center">
                    <p className="text-base">Words per minute:</p>
                    <p className="text-[#319795] text-lg">{correct}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base">Accuracy:</p>
                    {correct !== 0 ? (
                      <p className="text-[#319795] text-lg">
                        {Math.round((correct / (correct + incorrect)) * 100)}%
                      </p>
                    ) : (
                      <p className="text-[#319795] text-lg">0%</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </VStack>
        </div>
      </Box>
    </div>
  );
}
