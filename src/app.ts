import {AVAILABLE_WORDS, GuessLetter, Hint} from "./globals";
import {WordSuggester} from "./wordSuggester";

export type Elems = {
    confirmationModalElem: HTMLElement;
    confirmationCancelButtonElem: HTMLElement;
    confirmationContinueButtonElem: HTMLElement;
    exitModalElem: HTMLElement;
    exitModalReconfirmButtonElem: HTMLElement;
    resetButtonElem: HTMLElement;
    keyElems: NodeListOf<Element>;
    guessLetterElems: NodeListOf<Element>;
    suggestionLetterElems: NodeListOf<Element>;
    suggestionUseButtonElem: HTMLElement;
}

export type State = {
    currentGuessLetterIndex: number;
    guessLetters: GuessLetter[];
    suggestion: string;
}

class WordleHelper {

    wordSuggester: WordSuggester;
    elems: Elems;
    state: State;

    // ----------------------------------------
    //                Constants
    // ----------------------------------------
    static AVAILABLE_HINTS: Hint[] = ['absent', 'present', 'correct'];

    constructor() {
        this.wordSuggester = new WordSuggester(AVAILABLE_WORDS);
        this.elems = {
            confirmationModalElem: document.getElementById('confirmationModal'),
            confirmationCancelButtonElem: document.getElementById('confirmationModalCancelButton'),
            confirmationContinueButtonElem: document.getElementById('confirmationModalContinueButton'),
            exitModalElem: document.getElementById('exitModal'),
            exitModalReconfirmButtonElem: document.getElementById('exitModalReconfirmButton'),
            resetButtonElem: document.getElementById('resetButton'),
            keyElems: document.querySelectorAll('.keyboard .key'),
            guessLetterElems: document.querySelectorAll('.guesses .guessLetter'),
            suggestionLetterElems: document.querySelectorAll('.suggestionWord .guessLetter'),
            suggestionUseButtonElem: document.getElementById('useButton'),
        }
        this.state = {
            currentGuessLetterIndex: 0,
            guessLetters: new Array(this.elems.guessLetterElems.length),
            suggestion: ''
        }
        for (let i=0; i< this.elems.guessLetterElems.length; i++) {
            this.state.guessLetters[i] = {letter: '', hint: '', position: (i % 5), word: Math.floor(i / 5)};
        }
        this.elems.confirmationCancelButtonElem.addEventListener('click', this.onConfirmationCancelButtonClicked)
        this.elems.confirmationContinueButtonElem.addEventListener('click', this.onConfirmationContinueButtonClicked)
        this.elems.exitModalReconfirmButtonElem.addEventListener('click', this.onexitModalReconfirmButtonClicked)
        this.elems.resetButtonElem.addEventListener('click', this.onResetButtonClicked)
        this.elems.keyElems.forEach(elem => elem.addEventListener('click', this.onKeyClicked));
        this.elems.guessLetterElems.forEach((elem, index) => elem.addEventListener('click', this.onGuessLetterClicked(index)));
        this.elems.suggestionUseButtonElem.addEventListener('click', this.onSuggestionUseButtonClicked)
    }

    // ----------------------------------------
    //             Event Handlers
    // ----------------------------------------

    onConfirmationCancelButtonClicked = (event) => {
        this.elems.exitModalElem.classList.remove('hide');
    }

    onConfirmationContinueButtonClicked = (event) => {
        this.elems.confirmationModalElem.classList.add('hide');
    }

    onexitModalReconfirmButtonClicked = (event) => {
        this.elems.exitModalElem.classList.add('hide');
    }

    onResetButtonClicked = (event) => {
        while (this.state.currentGuessLetterIndex !== 0) {
            this.removeLetter();
        }
        this.updateSuggestion();
    };

    onKeyClicked = (event) => {
        const key = event.currentTarget.dataset.key;
        if (this.state.currentGuessLetterIndex === 0 && key === 'BACKSPACE') {
            return;
        }
        if (this.state.currentGuessLetterIndex === this.elems.guessLetterElems.length && key !== 'BACKSPACE') {
            return;
        }
        if (key === 'BACKSPACE') {
            this.removeLetter();
        } else {
            this.addLetter(key);
        }

        this.updateSuggestion();
    };

    onGuessLetterClicked = (index) => {
        return (event) => {
            if (index >= this.state.currentGuessLetterIndex) {
                return;
            }
            this.elems.guessLetterElems[index].classList.remove('hintRequired');

            const currentHintIndex = WordleHelper.AVAILABLE_HINTS.indexOf(this.state.guessLetters[index].hint);
            const oldHint = (currentHintIndex !== -1) ? WordleHelper.AVAILABLE_HINTS[currentHintIndex] : '';
            const newHintIndex = (currentHintIndex + 1) % 3;
            const newHint = WordleHelper.AVAILABLE_HINTS[newHintIndex];

            this.elems.guessLetterElems[index].classList.remove(`hint-${oldHint}`);
            this.elems.guessLetterElems[index].classList.add(`hint-${newHint}`);
            this.state.guessLetters[index].hint = newHint;

            // TODO validate hints are not contradictory and mark invalid hints as 'hintRequired'

            this.updateSuggestion();
        }
    };

    onSuggestionUseButtonClicked = (event) => {
        if (this.isSuggestionUseDisabled()) {
            return;
        }
        this.state.suggestion.split('').forEach(this.addLetter);
    };

    // ----------------------------------------
    //               Functions
    // ----------------------------------------

    initialHint = (letter, position): Hint => {
        // TODO does not handle the case when there were multiple hints for the same letter in a single word: one being 'absent' and the other being 'correct' or 'present'
        // TODO for now return ''
        return '';
        /*
        // determine if letter is known to 'absent'
        const absentLetters = this.state.guessLetters.filter(guessLetter => guessLetter.hint === 'absent').map(guessLetter => guessLetter.letter);
        if (absentLetters.includes(letter)) {
            return 'absent';
        }
        // determine if letter is known to be 'present' or 'correct' for this position
        const matchingGuessLetters = this.state.guessLetters.filter(guess => guess.letter === letter && guess.position === position);
        return matchingGuessLetters.length > 0 ? matchingGuessLetters[0].hint : '';
        */
    };

    removeLetter = () => {
        this.state.currentGuessLetterIndex--;
        this.elems.guessLetterElems[this.state.currentGuessLetterIndex].textContent = '';
        this.elems.guessLetterElems[this.state.currentGuessLetterIndex].classList.remove('hintRequired');
        this.elems.guessLetterElems[this.state.currentGuessLetterIndex].classList.remove(`hint-${this.state.guessLetters[this.state.currentGuessLetterIndex].hint}`);
        this.state.guessLetters[this.state.currentGuessLetterIndex].letter = '';
        this.state.guessLetters[this.state.currentGuessLetterIndex].hint = '';
    }

    addLetter = (letter) => {
        const position = this.state.currentGuessLetterIndex % 5;
        const hint = this.initialHint(letter, position);

        this.elems.guessLetterElems[this.state.currentGuessLetterIndex].textContent = letter;
        this.elems.guessLetterElems[this.state.currentGuessLetterIndex].classList.add(hint === '' ? 'hintRequired' : `hint-${hint}`);
        this.state.guessLetters[this.state.currentGuessLetterIndex].letter = letter;
        this.state.guessLetters[this.state.currentGuessLetterIndex].hint = hint;
        this.state.currentGuessLetterIndex++;
    };

    suggestionHint = (letter, position) => {
        // TODO fix bug: handle hints for duplicate letters in a suggested word, ie. if a letter is not known to appear twice in the word, then don't hint it twice
        //      guess #1:            P E A R L
        //                           c a p p a
        //      .
        //      guess #2:            P A R T Y
        //                           c c c a a
        //      recommends...
        //                           P A R K A
        //                           c c c _ p
        //      .
        //      should not hint that the last 'A' is present, since the word is not known to contain duplicate 'A' letters

        // TODO return any empty string for now, until fixed
        /*
        // determine if letter is known to be 'correct' or 'present' for this position
        const matchingGuessLetters = this.state.guessLetters.filter(guess => guess.letter === letter && guess.position === position);
        if (matchingGuessLetters.length > 0) {
            return matchingGuessLetters[0].hint;
        }
        // determine if letter is 'present'
        const presentLetters = this.state.guessLetters.filter(guessLetter => guessLetter.hint === 'present').map(guessLetter => guessLetter.letter);
        if (presentLetters.includes(letter)) {
            return 'present';
        }
        */
        return '';
    };

    isSuggestionUseDisabled = () => {
        return this.state.currentGuessLetterIndex > 20
            || this.state.currentGuessLetterIndex % 5 !== 0
            || this.state.suggestion === ''
            || (this.state.currentGuessLetterIndex > 0 && this.state.guessLetters.slice(this.state.currentGuessLetterIndex - 5, this.state.currentGuessLetterIndex).map(g => g.letter).join('') === this.state.suggestion)
            || this.state.guessLetters.some(guessLetter => guessLetter.letter !== '' && guessLetter.hint === '');
    };

    updateSuggestion = () => {
        this.state.suggestion = this.wordSuggester.suggestedWord(this.state.guessLetters);

        // show suggestion
        const suggestionLetters = (this.state.suggestion === '') ? new Array(5).fill('') : this.state.suggestion.split('');
        this.elems.suggestionLetterElems.forEach((elem, index) => {
            elem.textContent = suggestionLetters[index];
            WordleHelper.AVAILABLE_HINTS.forEach(hint => elem.classList.remove(`hint-${hint}`));
            const hint = this.suggestionHint(suggestionLetters[index], index);
            if (hint !== '') {
                elem.classList.add(`hint-${hint}`);
            }
        });

        // enable/disable the 'USE' button
        if (this.isSuggestionUseDisabled()) {
            this.elems.suggestionUseButtonElem.classList.add('disabled');
        } else {
            this.elems.suggestionUseButtonElem.classList.remove('disabled');
        }
    };
}

window.onload = () => {
    new WordleHelper();
};
