import {five, six} from './data/data.js';
let wordsNumber;
let checkedIndex = 0;
let currentWord = '';
let tips = true;
let end = false;
let target = '';
let size = 5;
let sound = false;


window.onload = ()=> {
    let today = getTodayDate();
    let tommorow = getTommorowDate();
    localStorage.setItem('end', '');
    if (!localStorage.getItem('today')) {
        localStorage.setItem('end', '');
        localStorage.setItem('today', today)
        localStorage.setItem('target', getTargetWord());
    }
    if (tommorow > localStorage.getItem('today')) {
        localStorage.setItem('end', '');
        localStorage.setItem('today', tommorow);
        localStorage.setItem('target', getTargetWord());
    }
    target = localStorage.getItem('target');
    setWordSize();
    buildWords(size);
    buildKeyboard();
    addKeyListener();
    allowTips();
    openConfig();
    closeConfig();
    openInfo();
    closeInfo();
    changeWordSize();
    enableSound();
}

function getTodayDate() {
    let today = new Date().toLocaleDateString();
    return today;
}

function getTommorowDate() {
    let tommorow = new Date();
    tommorow.setDate(tommorow.getDate() + 1)
    return tommorow;
}

function setWordSize() {
    let select = document.querySelector(".select-word-size");
    let selectedIndex = select.options.selectedIndex;
    if (selectedIndex) {
        size = 6;
    }
    else {
        size = 5;
    }
}

function buildWords(size) {
    const localHistory = JSON.parse(localStorage.getItem('history'));
    const finish = Boolean(localStorage.getItem('end'));
    let words;
    words = document.querySelector('.words');
    if (size == 5) {
        wordsNumber = 30;
        words.classList.remove('six-words');
        words.classList.add('five-words');
    }
    else {
        wordsNumber = 36;
        words.classList.remove('five-words');
        words.classList.add('six-words');
    }

    while(words.lastChild) {
        words.lastChild.remove();
    }

    for (let i=0; i<wordsNumber; i++) {
        const word = words.appendChild(document.createElement(`div`));
        if (finish && localHistory && i<=localHistory.length - 1) {
            word.textContent = localHistory[i]['wordContent'];
            word.classList.add('draw');
            word.classList.add(localHistory[i]['fillClass']);
        }
        word.classList.add('word');
        if (i >= 5 && !localHistory) {
            word.appendChild(document.createElement('img')).src = './images/bloquear.png';
            word.classList.add('lock');
            word.children[0].classList.add('locker');
        }
    }
}

function buildKeyboard() {
    const firstColumn = document.querySelector('.first-column');
    const secondColumn = document.querySelector('.second-column');
    const thirdColumn = document.querySelector('.third-column');
    const keys = ["Q","W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", 
    "S", "D", "F", "G", "H", "J", "K", "L", "Ç", "Z", 'X', 'C', "V", "B", "N", "M", "x", "Enter"];
    for(let i=0; i<keys.length; i++) {
        if (i <= 9) {
            const key = firstColumn.appendChild(document.createElement(`div`));
            key.innerHTML = keys[i];
            key.classList.add('key');
        }
        else if (i <= 19) {
            const key = secondColumn.appendChild(document.createElement(`div`));
            key.innerHTML = keys[i];
            key.classList.add('key');
        }
        else {
            const key = thirdColumn.appendChild(document.createElement(`div`));
            key.innerHTML = keys[i];
            key.classList.add('key');
            if (i == 28) {
                key.classList.add('enter');
            }

        }
    } 
}

function addKeyListener() {
    let keys = document.querySelectorAll('.key');
    keys.forEach(element=> {
        element.addEventListener("click", (event)=> {
            if (!end) {
                playSound('./sounds/keypress.mp3');
                let letter = event.target.innerText;
                drawLetter(letter);
            }
        })
    })
}

function openConfig() {
    let options = document.querySelector('.options');
    options.children[0].addEventListener('click', ()=> {
        playSound('./sounds/click-option.mp3');
        let optionsWindow = document.querySelector('.config-modal');
        optionsWindow.classList.add('open-config');
    });
}

function closeConfig() {
    let header = document.querySelector('.modal-header');
    header.children[1].addEventListener('click', ()=> { 
        playSound('./sounds/click-option.mp3');
        let optionsWindow = document.querySelector('.config-modal');
        optionsWindow.classList.remove('open-config');
        allowTips();
    });
}

function openInfo() {
    let options = document.querySelector('.options');
    options.children[2].addEventListener('click', ()=> {
        playSound('./sounds/click-option.mp3');
        let optionsWindow = document.querySelector('.info-modal');
        optionsWindow.classList.add('open-info');
    });
}

function closeInfo() {
    let header = document.querySelectorAll('.modal-header');
    header[1].children[1].addEventListener('click', ()=> {
        playSound('./sounds/click-option.mp3');
        let optionsWindow = document.querySelector('.info-modal');
        optionsWindow.classList.remove('open-info');
    });
}

function allowTips() {
    let toggle = document.getElementById('toggle');
    if (toggle.checked)
        tips = true;
    else
        tips = false;
}

function changeWordSize() {
    let select = document.querySelector('.select-word-size');
    select.addEventListener('click', ()=> {
        setWordSize();
        buildWords(size);
    });
}

function playSound(path) {
    if (sound) {
        let audio = new Audio(path);
        audio.play();
    }
}

function getTargetWord() {
    return five[Math.floor(Math.random() * five.length)];
}

const deleteWord = (words, emptyIndex) => {
    const lastWord = emptyIndex - 1;
    if (lastWord >= 0 && lastWord != checkedIndex - 1) {
        words[lastWord].innerHTML = '';
        words[lastWord].classList.remove('draw');
    }
}

function drawLetter(letter) {
    let words = document.querySelectorAll('.word');
    let allow;
    for(let wordIndex=0; wordIndex<words.length; wordIndex++) {
        if (words[wordIndex].innerHTML == '' || words[wordIndex].childElementCount == 1) {
            if (letter == 'x') {
                deleteWord(words, wordIndex);
            }
            allow = checkAllow(wordIndex, letter);
            if (checkedIndex) {
                getCurrentWord(words);
            }
            if (letter == 'Enter' && currentWord) {
                if (five.includes(currentWord))
                    checkWin(wordIndex);
                else
                    alert('Essa palavra não existe')
                if (!end)
                    unlockNextWord(words)
            }
            if ((allow || checkedIndex == wordIndex) && (letter != 'Enter' && letter != 'x')) {
                words[wordIndex].classList.add('draw');
                setTimeout(()=> {
                    words[wordIndex].innerHTML = letter;
                }, 200);
                break;
            }
            if (!allow) {
                break;
            }
            letter = ''
            break;
        }
    }
}

function unlockNextWord(words) {
    if (checkedIndex) {
        for (let i=checkedIndex; i<=checkedIndex + 4; i++) {
            words[i].removeChild(words[i].childNodes[0]);
            words[i].classList.remove('lock');
        }
    } 
}

function getCurrentWord(words) {
    currentWord = '';
    let startIdx = getLoopStartIndex(checkedIndex);
    for (let i=startIdx; i<=checkedIndex; i++) {
        currentWord += words[i].textContent;
        currentWord = currentWord.toLowerCase();
    }
}

function getLoopStartIndex(index) {
    if (size == 5)
        return index - 5;
    return index - 6;
}

function checkAllow(wordIndex, letter) {
    let breakIndexes;
    let allow = true;
    if (wordsNumber == 30) {
        breakIndexes = [5, 10, 15, 20];
    }
    else {
        breakIndexes = [6, 11, 16, 21];
    }
    if (breakIndexes.includes(wordIndex) && letter != 'Enter') {
        allow = false;
    }
    else if (breakIndexes.includes(wordIndex) && letter == 'Enter') {
        checkedIndex = wordIndex;
    }
    return allow;
}

function checkWin(index) {
    let word = '';
    let breakIndexes = [5, 6, 10, 11, 15, 16, 20, 21];
    let startIndex = 0;
    let loopIdx = getLoopStartIndex(index);
    let words = document.querySelectorAll('.word');
    let history = [];
    if (breakIndexes.includes(index)) {
        for (let i=loopIdx; i<=index - 1; i++) {
            if (tips) {
                let letter = words[i]
                setTips(letter, startIndex);
                blockKey(letter)
            }
            word += words[i].textContent.toLowerCase();
        }
    }
    if (word == target) {
        playSound('./sounds/win.mp3');
        for (let i=loopIdx; i<=index - 1; i++) {
            words[i].classList.add('fill-win');
        }
        end = true;
        localStorage.setItem('end', end);
    }
    for (let i=0; i<index; i++) {
        let classList =  words[i].classList;
        history.push({'wordContent': words[i].textContent, 'fillClass':classList.item(classList.length - 1)});
    }
    localStorage.setItem('history', JSON.stringify(history));
}

function blockKey(letter) {
    let keys = document.querySelectorAll('.key');
    for (let i=0; i<keys.length; i++) {
        if (keys[i].textContent == letter.textContent && (!letter.classList.contains('fill-rigth-position') && !letter.classList.contains('fill-wrong-position'))) {
            keys[i].classList.add('discovered');
        }
    }
}

function setTips(letter, startIndex) {
    let char = letter.textContent.toLowerCase();
    if (target.includes(char)) {
        if (target.indexOf(char, startIndex) == currentWord.indexOf(char, startIndex)) {
            startIndex = currentWord.indexOf(char) + 1;
            letter.classList.add('fill-rigth-position');
            playSound('./sounds/fill.mp3');
        }
        else {
            letter.classList.add('fill-wrong-position');
        }
    } 
}

function enableSound() {
    let options = document.querySelector('.options');
    options.children[1].addEventListener('click', ()=> {
        let image = document.querySelector('.sound-icon');
        if (image.src.includes('no-sound')) {
            image.src = './images/sound.png';
            sound = true;
            playSound('./sounds/click-option.mp3')
        }    
        else {
            image.src = './images/no-sound.png';
            sound = false;
        }
    })
}