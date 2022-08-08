import type { NextPage } from "next";
import Head from "next/head";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  Tooltip,
  SliderThumb,
  VStack,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Spacer,
  Stack,
  Icon,
  Text,
  Badge,
  Avatar,
  Center,
  Divider,
  IconButton,
} from "@chakra-ui/react";

import { FaGithub } from "react-icons/fa";
import { Octokit } from "@octokit/core";

interface gitRepoData {
  commiter: string;
  avatar: string;
  hash: string;
  message: string;
  url: string;
}

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
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [timeLeftPerc, setTimeLeftPerc] = useState(100);
  const [lastCommitData, setLastCommitData] = useState<gitRepoData>();

  useEffect(() => {
    /*
      Set the base url
      TODO:
        refactor how we do this.
    */
    setBaseUrl(window.location.href);
  }, []);

  useEffect(() => {
    /*
      Initialize item in session storage for keeping
      track of characters the user failed.
    */
    sessionStorage.setItem("failedChars", "");
  }, []);

  useEffect(() => {
    const octokit = new Octokit({});
    const fetchRepoData = async () => {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/commits",
        {
          owner: "antonio-hickey",
          repo: "Typist",
        }
      );
      if (response !== null) {
        setLastCommitData({
          commiter: response.data[0]?.author?.html_url!,
          message: response.data[0]?.commit.message!,
          hash: response.data[0]?.sha!,
          avatar: response.data[0]?.author?.avatar_url!,
          url: response.data[0]?.html_url!,
        });
      }
    };
    fetchRepoData();
  }, []);

  function setInputFocus(input: HTMLInputElement | null) {
    /* Sets the text input to focus */
    if (typeof input !== null && status === "started") {
      input?.focus();
    }
  }

  function generateWords(val: number) {
    /* Generate initial random array of words */
    fetch(baseUrl + "/api/words/generate?n=" + val)
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
      baseUrl +
        "/api/words/generate?chars=" +
        Array.from(failedChars).join(",").slice(0, -1) +
        "&n=" +
        val
    )
      .then((resp) => resp.json())
      .then((data) => {
        setWords(data.words);
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
            setTimeLeftPerc(100);
            return 60;
          } else {
            setTimeLeftPerc(() => {
              return ((prevCountdown - 1) / 60) * 100;
            });
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
      return "text-[30px] text-[#319795] ";
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
    <div className="mainBodyDark flex flex-col min-h-[100vh] max-h-[100vh] justify-between h-screen">
      <Head>
        <title>Typist</title>
        <meta
          name="description"
          content="App to learn fast and accurate typing."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box className="bg-darkBgAlpha text-center py-4">
        <HStack spacing={8} className="pl-5">
          <Spacer />
          <h1 className="font-extrabold text-4xl text-[#319795]">Typist</h1>
          <Spacer />
        </HStack>
      </Box>

      <div className="flex flex-col m-auto">
        <Box
          textAlign="center"
          fontSize="xl"
          maxW="4xl"
          w="4xl"
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
                    value={timeLeftPerc}
                    trackColor={"RGBA(0, 0, 0, 0.34)"}
                    color="#319795"
                    size="200px"
                  >
                    <CircularProgressLabel>{countDown}</CircularProgressLabel>
                  </CircularProgress>
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
                        colorScheme="solidteal"
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
                  ref={(e) => setInputFocus(e)}
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
                  <Button
                    onClick={start}
                    colorScheme="btnteal"
                    className="!hover:bg-violet-600"
                  >
                    Start Typing!
                  </Button>
                ) : null}
              </div>
              {status === "started" && (
                <div className="flex justify-center items-center">
                  <div className="px-5">
                    <div
                      className={`${getContentClass()} rounded-lg px-5 py-2`}
                    >
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
          </div>
        </Box>
      </div>

      <footer className="bg-darkBgAlpha text-center">
        <Stack direction={"row"} className="!text-center px-5 pt-7 pb-3">
          <Text className="pl-5">Last Commit:</Text>
          <a href={lastCommitData?.commiter}>
            <Avatar
              src={lastCommitData?.avatar}
              size="sm"
              className="!mt-[-0.2rem]"
            />
          </a>
          <Badge colorScheme={"teal"} className="h-5 !mt-[0.17rem] !lowercase">
            <a href={lastCommitData?.url}>{lastCommitData?.hash.slice(0, 7)}</a>
          </Badge>
          <Text>
            <a
              href={lastCommitData?.url}
              className="underline underline-offset-2"
            >
              {lastCommitData?.message}
            </a>
          </Text>
          <Spacer />
          <Center height="2rem">
            <Divider orientation="vertical" />
          </Center>
          <Spacer />
          <Text className="underline underline-offset-4">
            <a href="https://github.com/antonio-hickey/Typist">
              View source code on GitHub
            </a>
          </Text>
          <IconButton
            variant="subtle"
            colorScheme="teal"
            aria-label="GitHub"
            fontSize="2.5rem"
            icon={<Icon as={FaGithub} className="!mt-[-0.75rem]" />}
            className="!pr-1.5"
          />
        </Stack>
      </footer>
    </div>
  );
};

export default Home;
