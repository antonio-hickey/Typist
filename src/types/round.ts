import { Dispatch, SetStateAction, KeyboardEvent } from "react";

export interface RoundParams {
  baseUrl: string;
  roundStatus: string;
  roundStatusDispatch: Dispatch<SetStateAction<string>>;
  roundCountdownDispatch: Dispatch<SetStateAction<number>>;
  roundCountdownPercentDispatch: Dispatch<SetStateAction<number>>;
  roundWordsDispatch: Dispatch<SetStateAction<string[]>>;
  sliderValue: number;
  currWordIdxDispatch: Dispatch<SetStateAction<number>>;
  currInputDispatch: Dispatch<SetStateAction<string>>;
  correctDispatch: Dispatch<SetStateAction<number>>;
  incorrectDispatch: Dispatch<SetStateAction<number>>;
  currCharIdxDispatch: Dispatch<SetStateAction<number>>;
  currCharDispatch: Dispatch<SetStateAction<string>>;
  hiddenDispatch: Dispatch<SetStateAction<boolean>>;
}

export interface CheckMatchParams {
  words: string[];
  currWordIdx: number;
  currInput: string;
  correctDispatch: Dispatch<SetStateAction<number>>;
  incorrectDispatch: Dispatch<SetStateAction<number>>;
}

export interface HandleKeyDownParams {
  event: KeyboardEvent<HTMLInputElement>;
  words: string[];
  currCharDispatch: Dispatch<SetStateAction<string>>;
  currCharIdxDispatch: Dispatch<SetStateAction<number>>;
  currWordIdx: number;
  currWordIdxDispatch: Dispatch<SetStateAction<number>>;
  currInput: string;
  currInputDispatch: Dispatch<SetStateAction<string>>;
  correctDispatch: Dispatch<SetStateAction<number>>;
  incorrectDispatch: Dispatch<SetStateAction<number>>;
}
