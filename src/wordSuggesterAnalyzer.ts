import {AVAILABLE_WORDS, GuessLetter, Hint, FirstWordResult } from "./globals";
import {WordSuggester} from "./wordSuggester";
import * as fs from "fs";

export class WordSuggesterAnalyzer {

  private readonly firstWords: string[];
  private readonly outputJsonFileName: string;

  constructor(firstWords: string[], outputJsonFileName) {
    this.firstWords = firstWords;
    this.outputJsonFileName = outputJsonFileName;
  }

  private isSolved(guessLetters: GuessLetter[]): boolean {
    return guessLetters.every(guessLetter => guessLetter.hint === 'correct');
  }

  private letterFrequency(letter: string, word: string) {
    return word.split(letter).length - 1;
  }

  private calcHint(guessedWord: string, position: number, targetWord: string): Hint {

    const guessedLetter = guessedWord[position];
    const targetLetters = targetWord.split('');
    if (!targetLetters.some(targetLetter => targetLetter === guessedLetter)) {

      // console.info('calcHint called:', guessedWord, position, targetWord, '=> absent');

      return 'absent';
    }
    if (guessedLetter === targetWord[position]) {

      // console.info('calcHint called:', guessedWord, position, targetWord, '=> correct');

      return 'correct'
    }
    const targetLetterFreq = this.letterFrequency(guessedLetter, targetWord);
    const guessedLetterFreq = this.letterFrequency(guessedLetter, guessedWord);
    if (targetLetterFreq >= guessedLetterFreq) {

      // console.info('calcHint called:', guessedWord, position, targetWord, '=> present');

      return 'present';
    } else {

      // console.info('calcHint called:', guessedWord, position, targetWord, '=> absent *');

      return 'absent';
    }
  }

  private calcGuessLetters(guessedWord: string, targetWord: string, guessNumber: number): GuessLetter[] {

    // console.info('calcGuessLetters called:', guessedWord, targetWord, guessNumber);

    const guessLetters: GuessLetter[] = [];
    for (let position = 0; position<guessedWord.length; position++) {
      const letter = guessedWord[position];
      guessLetters.push({
        letter: letter,
        hint: this.calcHint(guessedWord, position, targetWord),
        position: position,
        word: guessNumber - 1
      })
    }
    // console.info('guessLetters:', guessLetters);

    return guessLetters;
  }

  private printHint(hint: Hint): string {
    switch (hint) {
      case 'absent': return '_';
      case 'present': return '?';
      case 'correct': return '*';
    }
  }

  private printGuessLetters(guessLetters: GuessLetter[]): void {
    const printedLetters:string = guessLetters.map(guessLetter => guessLetter.letter).join(' ');
    const printedHints:string = guessLetters.map(guessLetter => this.printHint(guessLetter.hint)).join(' ');

    console.info(printedLetters);
    console.info(printedHints);
  }

  private median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }

  private formatInteger(num: number, maxChars: number): string {
    const result = num.toString(10);
    return result.padStart(maxChars);
  }

  private formatFloat(num: number, maxChars: number): string {
    const result = num.toFixed(2);
    return result.padStart(maxChars);
  }

  private roundTo2DecimalPlaces(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  private writeResultToFile(results: FirstWordResult[], jsonFileName: string, callback) {
    const json = JSON.stringify(results);
    fs.writeFile(jsonFileName, json, 'utf8', callback);
  }

  private calcResult(firstWord: string, unsolvedIn6: any[], unsolvedIn10: any[], guessNumbers: any[]): FirstWordResult {
    const sum = guessNumbers.reduce((a, b) => a + b, 0);
    return {
      w: firstWord,
      u6: unsolvedIn6.length,
      u10: unsolvedIn10.length,
      min: Math.min(...guessNumbers),
      max: Math.max(...guessNumbers),
      avg: this.roundTo2DecimalPlaces((sum / guessNumbers.length) || 0),
      med: this.roundTo2DecimalPlaces(this.median(guessNumbers))
    };
  }

  private printResult(firstWordIndex: number, numberOfFirstWords: number, firstWord: string, unsolvedIn6: any[], unsolvedIn10: any[], guessNumbers: any[]) {
    const wordNum = this.formatInteger(firstWordIndex + 1, 5);
    const numUnsolvedIn6 = this.formatInteger(unsolvedIn6.length, 5);
    const numUnsolvedIn10 = this.formatInteger(unsolvedIn10.length, 5);
    const min = this.formatInteger(Math.min(...guessNumbers), 4);
    const max = this.formatInteger(Math.max(...guessNumbers), 4);
    const sum = guessNumbers.reduce((a, b) => a + b, 0);
    const avg = this.formatFloat((sum / guessNumbers.length) || 0, 7);
    const median = this.formatFloat(this.median(guessNumbers), 7);

    const result = `[ ${wordNum} of ${numberOfFirstWords}] ${firstWord}: ${numUnsolvedIn6} ${numUnsolvedIn10} ${min} ${max} ${avg} ${median}`;
    console.info(result);
  }

  analyze() {
    console.info('Analyzing WordSuggester...');

    const results: FirstWordResult[] = [];
    const suggester = new WordSuggester(AVAILABLE_WORDS);

    const numberOfFirstWords = this.firstWords.length;
    const startTime = new Date().getTime();

    this.firstWords.forEach((firstWord, firstWordIndex) => {

      const guessNumbers = [];
      const unsolvedIn6 = [];
      const unsolvedIn10 = [];
      const targetWords = AVAILABLE_WORDS;

      // console.info(`------ first word: ${firstWord} -------`);

      targetWords.forEach(targetWord => {
        let guessNumber = 1;
        const allGuessLetters = [];

        // console.info(`------ ${targetWord} -------`);

        let guessLetters = this.calcGuessLetters(firstWord, targetWord, guessNumber);

        // this.printGuessLetters(guessLetters);

        while (!this.isSolved(guessLetters)) {
          allGuessLetters.push(...guessLetters);

          // console.info('allGuessLetters', allGuessLetters);

          const suggestedWord = suggester.suggestedWord(allGuessLetters);
          if (guessNumber === 6) {
            unsolvedIn6.push(targetWord);
          }
          if (guessNumber === 10) {
            unsolvedIn10.push(targetWord);
            break;
          }
          guessNumber++;
          guessLetters = this.calcGuessLetters(suggestedWord, targetWord, guessNumber);

          // this.printGuessLetters(guessLetters);
        }
        // console.info(`guesses: ${guessNumber}`);
        guessNumbers.push(guessNumber);
      });

      results.push(this.calcResult(firstWord, unsolvedIn6, unsolvedIn10, guessNumbers));

      const currentTime = new Date().getTime();
      const duration = currentTime - startTime;
      const timePerWord = duration / (firstWordIndex + 1);
      const timeRemaining = timePerWord * (numberOfFirstWords - firstWordIndex - 1);
      const estimatedEndTime = new Date(startTime + timeRemaining);

      console.info(`${firstWordIndex + 1} of ${numberOfFirstWords}: [Time per word: ${(timePerWord / 1000).toFixed(2)} secs][Estimated completion: ${estimatedEndTime.toLocaleTimeString()}]`);

      // this.printResult(firstWordIndex, numberOfFirstWords, firstWord, unsolvedIn6, unsolvedIn10, guessNumbers)
    });

    this.writeResultToFile(results, this.outputJsonFileName, (err) => {
      if (err) {
        console.error(`Error writing to file ${this.outputJsonFileName}:`, err);
      } else {
        console.info('Analyzing complete!')
        console.info(`Output results to ${this.outputJsonFileName}`)
      }
    });
  }
}
