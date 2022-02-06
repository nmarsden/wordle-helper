import {GuessLetter} from "./globals";

type LetterFrequency = 'NONE' | 'ONE' | 'ONE_OR_MORE' | 'TWO' | 'TWO_OR_MORE';

export class WordSuggester {

  private readonly availableWords: string[];

  constructor(availableWords: string[]) {
    this.availableWords = availableWords;
  }

  private calcLetterFrequency(hintsForLetter: GuessLetter[]): LetterFrequency {
    if (hintsForLetter.every(guessLetter => guessLetter.hint === 'absent')) {
      return 'NONE';
    }
    // group hints by word
    const hintsForLetterByWord: GuessLetter[][] = [];
    const maxWord = hintsForLetter[hintsForLetter.length - 1].word;
    for (let word = 0; word <= maxWord; word++) {
      hintsForLetterByWord.push(hintsForLetter.filter(guessLetter => guessLetter.word === word));
    }
    // determine letter frequency
    let result: LetterFrequency = 'ONE_OR_MORE';
    for (let i=0; i < hintsForLetterByWord.length; i++) {
      if (hintsForLetterByWord[i].length > 1) {
        const numAbsent = hintsForLetterByWord[i].filter(guessLetter => guessLetter.hint === 'absent').length;
        const numPresent = hintsForLetterByWord[i].filter(guessLetter => guessLetter.hint === 'present').length;
        const numCorrect = hintsForLetterByWord[i].filter(guessLetter => guessLetter.hint === 'correct').length;
        if (numPresent + numCorrect > 1) {
          if (numPresent + numCorrect === 2 && numAbsent > 0) {
            result = 'TWO';
          } else {
            result = 'TWO_OR_MORE';
          }
        } else if (numPresent + numCorrect === 1 && numAbsent > 0) {
          result = 'ONE';
        }
      }
    }
    return result;
  }

  private calcLetterCountInWord(word: string): Map<string, number> {
    const letterCount: Map<string, number> = new Map();
    for (let i=0; i<word.length; i++) {
      const letter = word[i];
      const count = letterCount.get(letter);
      if (!count) {
        letterCount.set(letter, 1);
      } else {
        letterCount.set(letter, count+1);
      }
    }
    return letterCount;
  }

  suggestedWord(guessLetters: GuessLetter[]) {
    // only interested in guessLetters with a hint
    const hintedGuessLetters = guessLetters.filter(guessLetter => guessLetter.hint !== '');

    // return no suggestion if no hints
    if (hintedGuessLetters.length === 0) {
      return '';
    }

    // get set of letters with a hint
    const hintedLetters: Set<string> = new Set();
    hintedGuessLetters.forEach(guessLetter => {
      hintedLetters.add(guessLetter.letter);
    });

    const knownLetterFrequency: Map<string,LetterFrequency> = new Map();
    hintedLetters.forEach(hintedLetter => {
      const hintsForLetter = hintedGuessLetters.filter(guessLetter => guessLetter.letter === hintedLetter);
      // console.log(`hinted letter ${hintedLetter}: `, hintsForLetter);
      knownLetterFrequency.set(hintedLetter, this.calcLetterFrequency(hintsForLetter));
    });

    let suggestedWords = this.availableWords;

    // keep words that do not contain absent letters
    const absentLetters: string[] = [];
    knownLetterFrequency.forEach((frequency, letter) => {
      if (frequency === 'NONE') {
        absentLetters.push(letter);
      }
    })
    suggestedWords = suggestedWords.filter(word => absentLetters.every(letter => word.indexOf(letter) === -1));

    // keep words that contain all the present and correct letters
    const presentAndCorrectLetters = hintedGuessLetters.filter(guessLetter => ['present', 'correct'].includes(guessLetter.hint)).map(guessLetter => guessLetter.letter);
    if (presentAndCorrectLetters.length > 0) {
      suggestedWords = suggestedWords.filter(word => presentAndCorrectLetters.every(letter => word.indexOf(letter) !== -1));
    }

    // keep words that contain all the correct letters in the correct positions
    const correctLetterAndPositions = hintedGuessLetters.filter(guessLetter => guessLetter.hint === 'correct').map(guessLetter => ({
      letter: guessLetter.letter,
      position: guessLetter.position
    }));
    if (correctLetterAndPositions.length > 0) {
      suggestedWords = suggestedWords.filter(word => correctLetterAndPositions.every(letterAndPosition => {
        return word[letterAndPosition.position] === letterAndPosition.letter;
      }));
    }

    // keep words that contain all the present letters not in the present positions
    const presentLetterAndPositions = hintedGuessLetters.filter(guessLetter => guessLetter.hint === 'present').map(guessLetter => ({
      letter: guessLetter.letter,
      position: guessLetter.position
    }));
    if (presentLetterAndPositions.length > 0) {
      suggestedWords = suggestedWords.filter(word => presentLetterAndPositions.every(letterAndPosition => {
        return word[letterAndPosition.position] !== letterAndPosition.letter;
      }));
    }

    // keep words that contain the correct frequency of letters
    suggestedWords = suggestedWords.filter(word => {
      const letterCountInWord = this.calcLetterCountInWord(word);
      let validNum = 0;
      knownLetterFrequency.forEach((frequency, letter) => {
        const count = letterCountInWord.get(letter) || 0;
        if ((frequency === 'NONE' && count === 0)
          || (frequency === 'ONE' && count === 1)
          || (frequency === 'ONE_OR_MORE' && count >=1)
          || (frequency === 'TWO' && count === 2)
          || (frequency === 'TWO_OR_MORE' && count >= 2)) {
          validNum++;
        }
      })
      return validNum === knownLetterFrequency.size
    });

    return suggestedWords.length > 0 ? suggestedWords[0] : '';
  }
}