## Wordle Helper

A tool to help play the [Wordle](https://www.powerlanguage.co.uk/wordle/) game.

Enter played words as well as known hints for each letter.  A suggestion for the next guess to play will be calculated.

The suggestion is determined based on the known set of Wordle words, and the letters and hints provided.

## Tech
Built using HTML, CSS, and TypeScript. 

Used [Font Awesome](https://fontawesome.com/) for icons.

Used [Parcel](https://parceljs.org/) to build.

## TODOs
* [x] initial design
* [x] allow entering a letter
* [x] allow deleting the last letter
* [x] allow entering a hint for a letter: absent (grey), present (yellow), or correct (green)
* [x] obtain Wordle word list
* [x] calculate and show suggestion
* [x] allow reset
* [x] allow applying suggestion
* [x] introduce unit tests  
* [x] show initial warning confirmation modal
* [x] show info modal containing instructions
* [ ] allow auto-enter first word on reset based on a configured word in settings
