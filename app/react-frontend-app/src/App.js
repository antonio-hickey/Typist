import { useState, useEffect, useRef } from 'react';
import './App.css'
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
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

// 1 Minute to find Words per Minute (WPM)
const SECONDS = 60

function App() {

  const [words, setWords] = useState([]);
  const [countDown, setCountDown] = useState(SECONDS);
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
  const textInput = useRef(null);

  // initial words
  useEffect(() => {
    fetch("http://127.0.0.1:5000/generate-words/" + sliderValue)
      .then(resp => resp.json()).then(data => {
        setWords(data);
      })
  }, [])

  // Make text input the focus when started
  useEffect(() => {
    if (status === 'started') {
      textInput.current.focus()
    }
  }, [status])

  // Generate new words
  function generateWords(val) {
    setSliderValue(val)
    fetch("http://127.0.0.1:5000/generate-words/" + val)
      .then(resp => resp.json()).then(data => {
        setWords(data);
      })
  }


  function start() {

    // Reset variables when finished
    if (status === 'finished') {
      setWords(generateWords())
      setCurrWordIndex(0)
      setCorrect(0)
      setIncorrect(0)
      setCurrCharIndex(-1)
      setCurrChar("")
    }

    // If not already started
    if (status !== 'started') {
      setStatus('started')
      setShowSlider(false)
      setHidden(true)
      let interval = setInterval(() => {
        setCountDown((prevCountdown) => {

          // When the minute runs out
          if (prevCountdown === 0) {
            clearInterval(interval)
            setStatus('finished')
            setHidden(false)
            setCurrInput("")
            return SECONDS
          } else {
            return prevCountdown - 1
          }
        })
      }, 1000)
    }

  }

  function handleKeyDown({ keyCode, key }) {
    // space bar
    if (keyCode === 32) {
      checkMatch()
      setCurrInput("")
      setCurrWordIndex(currWordIndex + 1)
      setCurrCharIndex(-1)
    }

    // backspace
    else if (keyCode === 8) {
      setCurrCharIndex(currCharIndex - 1)
      setCurrChar("")
    }

    else {
      setCurrCharIndex(currCharIndex + 1)
      setCurrChar(key)
    }
  }

  function checkMatch() {
    const wordToCompare = words[currWordIndex]
    const doesItMatch = wordToCompare === currInput.trim()
    if (doesItMatch) {
      setCorrect(correct + 1)
    }
    else {
      setIncorrect(incorrect + 1)
    }
  }

  // Create className value for current word
  function getWordClass(wordIdx) {
    if (wordIdx === currWordIndex) {
      return 'current-word is-size-4'
    }
  }

  // Create className value for current character
  function getCharClass(wordIdx, charIdx, char) {

    if (wordIdx === currWordIndex && charIdx === currCharIndex && currChar && status !== 'finished') {
      if (char === currChar) {
        return 'was-success'
      }
      else {
        return 'was-failure'
      }
    }

    else if (wordIdx === currWordIndex && currCharIndex >= words[currWordIndex].length) {
      return 'was-failure'
    }
    else {
      return ''
    }
  }

  // Store color mode in local storage
  function getContentClass() {
    let colorMode = window.localStorage["chakra-ui-color-mode"]
    return `content ${colorMode}`
  }

  // Create "html"
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <div className="section">
              <div className="countdown has-text-centered has-text-primary">
                <h2>{countDown}</h2>
              </div>
            </div>
            {
              // why doesn't javascript have an `or` ? lol
              ["finished", "waiting"].includes(status) ?
                <Slider
                  id='slider'
                  defaultValue={50}
                  min={10}
                  max={300}
                  step={10}
                  colorScheme='teal'
                  onChange={(v) => generateWords(v)}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  disabled={status == "started"}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='teal'
                    color='white'
                    placement='top'
                    isOpen={showTooltip}
                    label={`${sliderValue} words`}
                  >
                    <SliderThumb boxSize={6} />
                  </Tooltip>
                </Slider>
                : null
            }

            <div className="control is-expanded section">
              <input ref={textInput} disabled={status !== "started"} type="text" className="input" onKeyDown={handleKeyDown} value={currInput} onChange={(e) => setCurrInput(e.target.value)} />
            </div>
            <div className="section">
              {!hidden ?
                <Button
                  onClick={start}
                  colorScheme='teal'
                  spinner='start'
                >
                  Start Typing!
                </Button> : null}
            </div>
            {status === 'started' && (
              <div className="section" >
                <div className="card">
                  <div className="card-content">
                    <div className={getContentClass()}>
                      {words.map((word, i) => (
                        <span key={i}>
                          <span className={getWordClass(i)}>
                            {word.split("").map((char, idx) => (
                              <span className={getCharClass(i, idx, char)} key={idx}>{char}</span>
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
            {status === 'finished' && (
              <div className="section">
                <div className="columns">
                  <div className="has-text-centered">
                    <p className="is-size-3">Words per minute:</p>
                    <p className="has-text-primary is-size-4">
                      {correct}
                    </p>
                  </div>
                  <div className="has-text-centered">
                    <p className="is-size-3">Accuracy:</p>
                    {correct !== 0 ? (
                      <p className="has-text-primary has-text-info is-size-4">
                        {Math.round((correct / (correct + incorrect)) * 100)}%
                      </p>
                    ) : (
                      <p className="has-text-primary has-text-info is-size-4">0%</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
