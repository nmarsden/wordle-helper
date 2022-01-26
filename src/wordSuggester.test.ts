import {WordSuggester} from "./wordSuggester";

describe('WordSuggester', () => {
    const availableWords = [
      "serve",
      "sissy",
      "cigar",
      "rebut",
    ];
    const wordSuggester = new WordSuggester(availableWords);

    test('should suggest nothing when no guess letters', () => {
        expect(wordSuggester.suggestedWord([])).toBe('');
    });

    test('should suggest nothing when guess letters have no hints', () => {
        expect(wordSuggester.suggestedWord([{letter: 'r', hint: '', position: 0, word: 0}])).toBe('');
    });

    describe('no duplicate guess letters', () => {

        test('should suggest word not containing absent letter', () => {
            expect(wordSuggester.suggestedWord([{letter: 'r', hint: 'absent', position: 0, word: 0}])).toBe('sissy');
        });

        test('should suggest word containing present letter', () => {
            expect(wordSuggester.suggestedWord([{letter: 'g', hint: 'present', position: 0, word: 0}])).toBe('cigar');
        });

        test('should suggest word containing correct letter', () => {
            expect(wordSuggester.suggestedWord([{letter: 'r', hint: 'correct', position: 0, word: 0}])).toBe('rebut');
        });
    });

    describe('duplicate guess letters', () => {

        test('should suggest word containing single correct letter', () => {
            expect(wordSuggester.suggestedWord([
                {letter: 'e', hint: 'present', position: 0, word: 0},
                {letter: 'e', hint: 'absent',position: 1, word: 0}])).toBe('rebut');
        });

        test('should suggest word containing duplicate letters: one correct and one present', () => {
            expect(wordSuggester.suggestedWord([
                {letter: 's', hint: 'correct', position: 0, word: 0},
                {letter: 's', hint: 'present', position: 1, word: 0}])).toBe('sissy');
        });
    });
});