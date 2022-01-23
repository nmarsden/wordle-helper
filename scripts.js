// ----------------------------------------
//                 State
// ----------------------------------------

const keyElems = document.querySelectorAll('.keyboard .key');
const guessLetterElems = document.querySelectorAll('.guesses .guessLetter');
let currentGuessLetterIndex = 0;
const guessLetters = new Array(guessLetterElems.length);
const AVAILABLE_HINTS = [ 'absent', 'present', 'correct'];

// ----------------------------------------
//             Event Handlers
// ----------------------------------------

const onKeyClicked = (event) => {
    const key = event.currentTarget.dataset.key;
    if (currentGuessLetterIndex === 0 && key === 'BACKSPACE') {
        return;
    }
    if (currentGuessLetterIndex === guessLetterElems.length && key !== 'BACKSPACE') {
        return;
    }
    if (key === 'BACKSPACE') {
        currentGuessLetterIndex--;
        guessLetterElems[currentGuessLetterIndex].textContent = '';
        guessLetterElems[currentGuessLetterIndex].classList.remove('hintRequired');
        guessLetters[currentGuessLetterIndex] = { letter: '', hint: '' };
    } else {
        guessLetterElems[currentGuessLetterIndex].textContent = key;
        guessLetterElems[currentGuessLetterIndex].classList.add('hintRequired');
        guessLetters[currentGuessLetterIndex] = { letter: key, hint: '' };
        currentGuessLetterIndex++;
    }
}

const onGuessLetterClicked = (index) => {
    return (event) => {
        if (index >= currentGuessLetterIndex) {
            return;
        }
        guessLetterElems[index].classList.remove('hintRequired');

        const currentHintIndex = AVAILABLE_HINTS.indexOf(guessLetters[index].hint);
        const oldHint = (currentHintIndex > 0) ? AVAILABLE_HINTS[currentHintIndex] : '';
        const newHintIndex = (currentHintIndex + 1) % 3;
        const newHint = AVAILABLE_HINTS[newHintIndex];

        guessLetterElems[index].classList.remove(`hint-${oldHint}`);
        guessLetterElems[index].classList.add(`hint-${newHint}`);
        guessLetters[index].hint = newHint;
    }
}

// ----------------------------------------
//               Functions
// ----------------------------------------

const init = () => {
    guessLetters.fill({ letter: '', hint: '' });

    keyElems.forEach(elem => elem.addEventListener('click', onKeyClicked));
    guessLetterElems.forEach((elem, index) => elem.addEventListener('click', onGuessLetterClicked(index)));
}

init();
