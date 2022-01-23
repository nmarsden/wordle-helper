const keyElems = document.querySelectorAll('.keyboard .key');
const guessLetterElems = document.querySelectorAll('.guesses .guessLetter');

let currentGuessLetterIndex = 0;
const guessLetters = new Array(guessLetterElems.length);
guessLetters.fill({ letter: '', hint: '' });

keyElems.forEach(keyElem => {
    keyElem.addEventListener('click', (event) => {
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
    })
})

