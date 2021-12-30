import { useState, useEffect, useRef } from 'react';
import randomWords from 'random-words';
import './App.css'
import {
  ChakraProvider,
  Box,
  Button,
  VStack,
  Grid,
  theme,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

const NUM_WORDS = 200
const SECONDS = 60

function App() {
  const [words, setWords] = useState([])
  const [countDown, setCountDown] = useState(SECONDS)
  const [currInput, setCurrInput] = useState("")
  const [currWordIndex, setCurrWordIndex] = useState(0)
  const [currCharIndex, setCurrCharIndex] = useState(-1)
  const [currChar, setCurrChar] = useState("")
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [status, setStatus] = useState("waiting")
  const [hidden, setHidden] = useState(false)
  const textInput = useRef(null)

  useEffect(() => {
    setWords(generateWords())
  }, [])

  useEffect(() => {
    if (status === 'started') {
      textInput.current.focus()
    }
  }, [status])

  function generateWords() {
    return new Array(NUM_WORDS).fill(null).map(() => randomWords())
  }

  function start() {

    if (status === 'finished') {
      setWords(generateWords())
      setCurrWordIndex(0)
      setCorrect(0)
      setIncorrect(0)
      setCurrCharIndex(-1)
      setCurrChar("")
    }

    if (status !== 'started') {
      setStatus('started')
      setHidden(true)
      let interval = setInterval(() => {
        setCountDown((prevCountdown) => {
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
      // backspace
    } else if (keyCode === 8) {
      setCurrCharIndex(currCharIndex - 1)
      setCurrChar("")
    } else {
      setCurrCharIndex(currCharIndex + 1)
      setCurrChar(key)
    }
  }

  function checkMatch() {
    const wordToCompare = words[currWordIndex]
    const doesItMatch = wordToCompare === currInput.trim()
    if (doesItMatch) {
      setCorrect(correct + 1)
    } else {
      setIncorrect(incorrect + 1)
    }
  }

  function getWordClass(wordIdx) {
    if (wordIdx === currWordIndex) {
      return 'current-word is-size-4'
    }
  }

  function getCharClass(wordIdx, charIdx, char) {
    if (wordIdx === currWordIndex && charIdx === currCharIndex && currChar && status !== 'finished') {
      if (char === currChar) {
        return 'was-success'
      } else {
        return 'was-failure'
      }
    } else if (wordIdx === currWordIndex && currCharIndex >= words[currWordIndex].length) {
      return 'was-failure'
    } else {
      return ''
    }
  }

  function getContentClass() {
    let colorMode = window.localStorage["chakra-ui-color-mode"]
    return `content ${colorMode}`
  }


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
