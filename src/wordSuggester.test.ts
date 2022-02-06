import {WordSuggester} from "./wordSuggester";

describe('WordSuggester', () => {

    test('should suggest nothing when no guess letters', () => {
        const wordSuggester = new WordSuggester(['serve']);
        expect(wordSuggester.suggestedWord([])).toBe('');
    });

    test('should suggest nothing when guess letters have no hints', () => {
        const wordSuggester = new WordSuggester(['serve']);
        expect(wordSuggester.suggestedWord([{letter: 'r', hint: '', position: 0, word: 0}])).toBe('');
    });

    describe('no duplicate guess letters', () => {

        test('should suggest word not containing absent letter', () => {
            const wordSuggester = new WordSuggester(['serve', 'sissy']);
            expect(wordSuggester.suggestedWord([{letter: 'r', hint: 'absent', position: 0, word: 0}])).toBe('sissy');
        });

        test('should suggest word containing present letter', () => {
            const wordSuggester = new WordSuggester(['serve', 'cigar']);
            expect(wordSuggester.suggestedWord([{letter: 'g', hint: 'present', position: 0, word: 0}])).toBe('cigar');
        });

        test('should suggest word containing correct letter', () => {
            const wordSuggester = new WordSuggester(['serve', 'rebut']);
            expect(wordSuggester.suggestedWord([{letter: 'r', hint: 'correct', position: 0, word: 0}])).toBe('rebut');
        });
    });

    describe('duplicate guess letters', () => {

        test('should suggest word containing single correct letter', () => {
            const wordSuggester = new WordSuggester(['serve', 'rebut']);
            expect(wordSuggester.suggestedWord([
                {letter: 'e', hint: 'present', position: 0, word: 0},
                {letter: 'e', hint: 'absent',position: 1, word: 0}])).toBe('rebut');
        });

        test('should suggest word containing duplicate letters: one correct and one present', () => {
            const wordSuggester = new WordSuggester(['serve', 'sissy']);
            expect(wordSuggester.suggestedWord([
                {letter: 's', hint: 'correct', position: 0, word: 0},
                {letter: 's', hint: 'present', position: 1, word: 0}])).toBe('sissy');
        });

        test('should suggest word containing duplicate letters: one absent and two correct', () => {
            const wordSuggester = new WordSuggester(['fluff', 'bluff']);
            expect(wordSuggester.suggestedWord([
                {letter: 'f', hint: 'absent', position: 0, word: 0},
                {letter: 'f', hint: 'correct', position: 3, word: 0},
                {letter: 'f', hint: 'correct', position: 4, word: 0}])).toBe('bluff');
        });

        // ------ funky -------
        // r o a t e
        // _ _ _ _ _
        // s i s s y
        // _ _ _ _ *
        // p u l p y
        // _ * _ _ *
        // d u c h y
        // _ * _ _ *
        // b u g g y
        // _ * _ _ *
        // m u m m y
        // _ * _ _ *
        // f u n n y
        // * * * _ *

        test('should suggest word containing duplicate letters: one absent and four correct', () => {
            const wordSuggester = new WordSuggester(['funny', 'funky']);
            expect(wordSuggester.suggestedWord([
                // -- roate
                {letter: 'r', hint: 'absent', position: 0, word: 0},
                {letter: 'o', hint: 'absent', position: 1, word: 0},
                {letter: 'a', hint: 'absent', position: 2, word: 0},
                {letter: 't', hint: 'absent', position: 3, word: 0},
                {letter: 'e', hint: 'absent', position: 4, word: 0},
                // -- sissy
                {letter: 's', hint: 'absent', position: 0, word: 1},
                {letter: 'i', hint: 'absent', position: 1, word: 1},
                {letter: 's', hint: 'absent', position: 2, word: 1},
                {letter: 's', hint: 'absent', position: 3, word: 1},
                {letter: 'y', hint: 'correct', position: 4, word: 1},
                // -- pulpy
                {letter: 'p', hint: 'absent', position: 0, word: 2},
                {letter: 'u', hint: 'correct', position: 1, word: 2},
                {letter: 'l', hint: 'absent', position: 2, word: 2},
                {letter: 'p', hint: 'absent', position: 3, word: 2},
                {letter: 'y', hint: 'correct', position: 4, word: 2},
                // -- duchy
                {letter: 'd', hint: 'absent', position: 0, word: 3},
                {letter: 'u', hint: 'correct', position: 1, word: 3},
                {letter: 'c', hint: 'absent', position: 2, word: 3},
                {letter: 'h', hint: 'absent', position: 3, word: 3},
                {letter: 'y', hint: 'correct', position: 4, word: 3},
                // -- buggy
                {letter: 'b', hint: 'absent', position: 0, word: 4},
                {letter: 'u', hint: 'correct', position: 1, word: 4},
                {letter: 'g', hint: 'absent', position: 2, word: 4},
                {letter: 'g', hint: 'absent', position: 3, word: 4},
                {letter: 'y', hint: 'correct', position: 4, word: 4},
                // -- mummy
                {letter: 'm', hint: 'absent', position: 0, word: 5},
                {letter: 'u', hint: 'correct', position: 1, word: 5},
                {letter: 'm', hint: 'absent', position: 2, word: 5},
                {letter: 'm', hint: 'absent', position: 3, word: 5},
                {letter: 'y', hint: 'correct', position: 4, word: 5},
                // -- funny
                {letter: 'f', hint: 'correct', position: 0, word: 6},
                {letter: 'u', hint: 'correct', position: 1, word: 6},
                {letter: 'n', hint: 'correct', position: 2, word: 6},
                {letter: 'n', hint: 'absent', position: 3, word: 6},
                {letter: 'y', hint: 'correct', position: 4, word: 6}])).toBe('funky');
        });
    });
});