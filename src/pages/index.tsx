import type { NextPage } from "next";
import Head from "next/head";

import React, { useState, useEffect, useRef } from "react";
import {
  ChakraProvider,
  Box,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  Tooltip,
  SliderThumb,
  VStack,
  Grid,
  theme,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./../components/colorModeSwitcher";

const Home: NextPage = () => {
  const [words, setWords] = useState<string[]>([""]);
  const [countDown, setCountDown] = useState(60);
  const [currInput, setCurrInput] = useState("");
  const [sliderValue, setSliderValue] = useState(50);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currWordIndex, setCurrWordIndex] = useState(0);
  const [currCharIndex, setCurrCharIndex] = useState(-1);
  const [currChar, setCurrChar] = useState("");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [status, setStatus] = useState("waiting");
  const [hidden, setHidden] = useState(false);
  const textInput = useRef<any>(null);

  useEffect(() => {
    /*
      Initialize item in session storage for keeping
      track of characters the user failed.
    */
    sessionStorage.setItem("failedChars", "");
  }, []);

  useEffect(() => {
    /* Make text input the focus when started */
    if (status === "started") {
      textInput?.current?.focus();
    }
  }, [status]);

  function generateWords(val: number) {
    /* Generate initial random array of words */
    fetch("http://localhost:3000/api/words/generate?n=" + val)
      .then((resp) => resp.json())
      .then((data) => {
        setWords(data.words);
      });
  }

  function generateNewWords(val: number) {
    /* Generate array of words that need more work on */

    let failedChars = new Set(
      sessionStorage.getItem("failedChars")?.split(",")
    );
    fetch(
      "http://localhost:3000/api/words/generate?chars=" +
        Array.from(failedChars).join(",").slice(0, -1) +
        "&n=" +
        val
    )
      .then((resp) => resp.json())
      .then((data) => {
        setWords(data);
      });
  }

  function start() {
    /* Starts a new round of words */

    if (status === "finished") {
      if (sessionStorage.getItem("failedChars") == "") {
        generateWords(sliderValue);
      } else {
        generateNewWords(sliderValue);
      }
      setCurrWordIndex(0);
      setCorrect(0);
      setIncorrect(0);
      setCurrCharIndex(-1);
      setCurrChar("");
    }

    if (status !== "started") {
      generateWords(sliderValue);
      setStatus("started");
      setHidden(true);
      let interval = setInterval(() => {
        setCountDown((prevCountdown) => {
          // When the minute runs out
          if (prevCountdown === 0) {
            clearInterval(interval);
            setStatus("finished");
            setHidden(false);
            setCurrInput("");
            return 60;
          } else {
            return prevCountdown - 1;
          }
        });
      }, 1000);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    /* Handles logic on key pressed down */

    // space bar
    if (event.keyCode === 32) {
      checkMatch();
      setCurrInput("");
      setCurrWordIndex(currWordIndex + 1);
      setCurrCharIndex(-1);
    }

    // backspace
    else if (event.keyCode === 8) {
      setCurrCharIndex(currCharIndex - 1);
      setCurrChar("");
    } else {
      setCurrCharIndex(currCharIndex + 1);
      setCurrChar(event.key);
    }
  }

  function checkMatch() {
    /* Checks if the word matches the correct word */
    if (words[currWordIndex] === currInput.trim()) {
      setCorrect(correct + 1);
    } else {
      setIncorrect(incorrect + 1);
    }
  }

  function getWordClass(wordIdx: number) {
    /* Create className value for current word */

    if (wordIdx === currWordIndex) {
      return "text-[30px] text-[#319795]";
    }
  }

  function getCharClass(
    wordIdx: number,
    charIdx: number,
    char: string
  ): string {
    /* Create className value for current character */

    if (
      wordIdx === currWordIndex &&
      charIdx === currCharIndex &&
      currChar &&
      status !== "finished"
    ) {
      if (char === currChar) {
        return "was-success";
      } else {
        if (window.sessionStorage.getItem("failedChars") == "") {
          window.sessionStorage.setItem("failedChars", char + ",");
        } else {
          window.sessionStorage.setItem(
            "failedChars",
            window.sessionStorage.getItem("failedChars") + char + ","
          );
        }

        return "was-failure";
      }
    } else if (
      wordIdx === currWordIndex &&
      currCharIndex >= words[currWordIndex]!.length
    ) {
      return "was-failure";
    } else {
      return "";
    }
  }

  function getContentClass() {
    /* Sets the color of words content background based on color mode */
    var colorMode = window.localStorage["chakra-ui-color-mode"];
    return `content ${colorMode}`;
  }

  function sliderText() {
    /* Sets the number of words slider text value */
    return <h2> Select the number of words: {sliderValue}</h2>;
  }

  return (
    <>
      <Head>
        <title>Typist</title>
        <meta
          name="description"
          content="App to learn fast and accurate typing."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChakraProvider theme={theme}>
        <Box textAlign="center" fontSize="xl">
          <Grid minH="100vh" p={3}>
            <ColorModeSwitcher justifySelf="flex-end" aria-label="test" />
            <VStack spacing={8}>
              <div className="flex justify-center items-center">
                <div className="pb-[20px] text-[120px] text-center text-[#319795]">
                  <h2>{countDown}</h2>
                </div>
              </div>

              <div className="w-15">
                {["finished", "waiting"].includes(status)
                  ? [
                      sliderText(),
                      <Slider
                        key="numberOfWordsSlider"
                        id="slider"
                        defaultValue={50}
                        min={10}
                        max={200}
                        step={10}
                        colorScheme="teal"
                        onChange={(v) => setSliderValue(v)}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        isDisabled={status === "started"}
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
                      </Slider>,
                    ]
                  : null}
              </div>

              <div className="flex justify-center items-center">
                <input
                  ref={textInput}
                  disabled={status !== "started"}
                  type="text"
                  className="input"
                  onKeyDown={(keyEvent) => handleKeyDown(keyEvent)}
                  value={currInput}
                  onChange={(e) => setCurrInput(e.target.value)}
                  placeholder="Type Here..."
                />
              </div>
              <div className="flex justify-center items-center">
                {!hidden ? (
                  <Button onClick={start} colorScheme="teal">
                    Start Typing!
                  </Button>
                ) : null}
              </div>
              {status === "started" && (
                <div className="flex justify-center items-center">
                  <div className="card">
                    <div className="card-content">
                      <div className={getContentClass()}>
                        {words.map((word, i) => (
                          <span key={i}>
                            <span className={getWordClass(i)}>
                              {word.split("").map((char, idx) => (
                                <span
                                  className={getCharClass(i, idx, char)}
                                  key={idx}
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
                </div>
              )}
              {status === "finished" && (
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
          </Grid>
        </Box>
      </ChakraProvider>
    </>
  );
};

export default Home;
