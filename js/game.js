class GameInterface {
    static getUserDataFromInputs() {
        const inputs = document.getElementById("user_form").elements;
        const userDataObj = {
            "nickname": inputs.nickname.value
        }
        GameInterface.saveLastLoginDataToStorage(userDataObj);
        return userDataObj;
    }

    static saveLastLoginDataToStorage(userDataObj) {
        localStorage.setItem("lastLoginUserData", JSON.stringify(userDataObj));
    }

    static loadLastUserDataFromStorageToInputs() {
        if (localStorage.getItem("lastLoginUserData")) {
            const lastUserData = JSON.parse(localStorage.getItem("lastLoginUserData"));
            const inputs = document.getElementById("user_form").elements;
            inputs.nickname.value = lastUserData.nickname;
        }
    }

    static getSizeFromUserInput() {
        const inputs = document.getElementById("user_form").elements;
        return inputs.selectSize.value;
    }
    static select(id) {
        this.game_match.tryToSelect(id);
    }

    static pressEnterOnFocusLetter(id) {
        if (event.code === 'Enter') {
            GameInterface.select(id);
        }
    }

    static startGame() {
        const size = Number(GameInterface.getSizeFromUserInput());
        const user_data = GameInterface.getUserDataFromInputs();
        this.game_match = new Game(size, user_data);
        this.game_match.createGame();
    }

}

class Game {
    constructor(size, user_data) {
        this.user_data = user_data;
        this.size = size;
        this.time = 0;
        this.setTimeOutTimer;
        this.leftLetters = this.size ** 2;
        this.name_localStorage = 'game_records-' + this.size;
        this.letterStyleWidth = "width: " + 100 / this.size + "%;";
        this.padding_botSize = "padding-bottom: " + 100 / this.size + "%;";
        this.styleOfLetter = "float: left; height: 0; position: relative;" + this.letterStyleWidth + this.padding_botSize;
        this.selectedLetters = [];

        // this.dataWords = globalData;
        this.wordsMatrix = this.takeHardcodedMatrix(this.size);
    }

    createGame() {
        // this.createWordsMatrix();
        this.changeScene("main-menu_id", "game-scene_id");
        this.buildGameField(this.size);
        this.autofocusTheFirstLetter();
        this.startTimer();
    }

    changeScene(currentScene, nextScene) {
        document.getElementById(currentScene).hidden = true;
        document.getElementById(nextScene).hidden = false;
    }

    buildGameField(size) {
        for (let i = 0; i < size ** 2; i++) {
            this.createHTMLElementOfLetter(i, i + 1);
        }
        this.applying_CSS_to_letters(this.styleOfLetter);
        this.fillTheGameField(this.wordsMatrix);
    }

    autofocusTheFirstLetter() {
        const theFirstLetter = document.getElementById("0");
        theFirstLetter.focus();
    }

    createHTMLElementOfLetter(id, number_from_id_for_tab) {
        const newLetterElement = document.createElement('div');
        newLetterElement.setAttribute("class", "letter");
        newLetterElement.setAttribute("id", id);
        newLetterElement.setAttribute("OnClick", "GameInterface.select('" + id + "')");
        newLetterElement.setAttribute("tabindex", number_from_id_for_tab);
        newLetterElement.setAttribute("onkeydown", "GameInterface.pressEnterOnFocusLetter('" + id + "')");
        document.getElementById("game-scene_id").appendChild(newLetterElement);
    }

    applying_CSS_to_letters(style) {
        const letters = document.getElementsByClassName("letter");
        for (let i = 0; i < letters.length; i++) {
            letters[i].setAttribute("style", style);
        }
    }

    fillTheGameField(wordsMatrix) {
        const fields = document.getElementsByClassName("letter");
        for (let i = 0; i < fields.length; i++) {
            const letterFromMatrix = wordsMatrix[i].letter;
            fields[i].setAttribute("style", this.styleOfLetter + "background: url(img/alphabet/" + letterFromMatrix + ".png) no-repeat; background-size: contain;");
        }
    }

    tryToSelect(currentLetter_id) {
        this.gameLogic(currentLetter_id);
    }

    gameLogic(currentLetter_id) {
        // enable selecting for the first selecting
        if (this.selectedLetters.length === 0) {
            this.select(currentLetter_id);
            this.selectedLetters.push(currentLetter_id);
        }
        else {
            let lastSelectedLetter_id = this.selectedLetters[this.selectedLetters.length - 1];
            // enable unselecting last selected letter
            if (currentLetter_id === lastSelectedLetter_id) {
                this.select(currentLetter_id);
                this.selectedLetters.pop();
            }
            else {
                // disable selecting already selected elements
                if (this.selectedLetters.indexOf(currentLetter_id) === -1) {
                    // enable selecting near letters
                    if (Number(currentLetter_id) === Number(lastSelectedLetter_id) + 1 ||
                        Number(currentLetter_id) === Number(lastSelectedLetter_id) - 1 ||
                        Number(currentLetter_id) === Number(lastSelectedLetter_id) + this.size ||
                        Number(currentLetter_id) === Number(lastSelectedLetter_id) - this.size
                    ) {
                        this.select(currentLetter_id);
                        this.selectedLetters.push(currentLetter_id);
                    }
                }
            }
        }

        if (this.selectedLetters.length > 0 && this.isWordCompleted()) {
            this.deactivateOnClickElems(this.selectedLetters);
            this.fadeInFindedWord(this.selectedLetters);
            this.leftLetters = this.leftLetters - this.selectedLetters.length;
            this.selectedLetters = [];
            if (this.chkWinCondition()) {
                clearTimeout(this.setTimeOutTimer);
                this.chkAndUpdateTop10LocalStorageRecords(this.name_localStorage, this.time, this.user_data);
                this.showWinSceneWithDelay(1000);
            }
        }

    }

    isWordCompleted() {
        const guessedWordFromFirstSelectLetter = this.wordsMatrix[Number(this.selectedLetters[0])].word;
        let currentWord = "";
        const wordsMatrixTemp = this.wordsMatrix
        this.selectedLetters.forEach(function (idLetter) {
            currentWord = currentWord + wordsMatrixTemp[Number(idLetter)].letter;
            if (wordsMatrixTemp[Number(idLetter)].word !== guessedWordFromFirstSelectLetter) {
                // for cases when word = current word but letters taken from different guessed words
                return false;
            }
        })
        return guessedWordFromFirstSelectLetter === currentWord;
    }

    select(id) {
        this.htmlAttrToggle(id, "class", "letter", "letter selected");
    }

    deactivateOnClickElems(collectionID) {
        collectionID.forEach(function (id) {
            document.getElementById(id).removeAttribute("OnClick");
        })
    }

    fadeInFindedWord(collectionID) {
        collectionID.forEach(function (id) {
            document.getElementById(id).removeAttribute("OnClick");
            document.getElementById(id).setAttribute("class", "letter fade-in");
        })
    }

    htmlAttrToggle(id, attr, toggleClassOn, toggleClassOff) {
        const letter = document.getElementById(id);
        if (letter.getAttribute(attr) === toggleClassOn) {
            letter.setAttribute(attr, toggleClassOff);
        } else {
            letter.setAttribute(attr, toggleClassOn);
        }
    }

    chkWinCondition() {
        return this.leftLetters === 0;
    }

    showCongrat() {
        document.getElementById("congrat").textContent = "Congratulation You win!";
    }

    //timer autostop when winCondition is true;
    startTimer() {
        const that = this;
        function timerSec() {
            that.time = that.time + 100;
            const time = that.convertMS(that.time);
            document.getElementById("timer_id").textContent = time;
            if (that.chkWinCondition() === false) {
                that.setTimeOutTimer = setTimeout(timerSec, 100);
            }
        }
        timerSec();
    }

    showWinSceneWithDelay(ms) {
        const that = this;
        this.setTableOfRecords();
        function delay() {
            that.changeScene("game-scene_id", "win-scene_id");
        }
        setTimeout(delay, ms);
    }

    setTableOfRecords() {
        const records_list = document.getElementById("records-table");
        const list = document.createElement('ol');
        const records = JSON.parse(localStorage.getItem(this.name_localStorage));
        records.forEach(recordObj => {
            let listElem = document.createElement('li');
            if (recordObj === "empty") listElem.textContent = "empty";
            else {
                let time = document.createElement('div');
                time.setAttribute("class", "record-time");
                time.textContent = this.convertMS(recordObj.time);
                if (recordObj.user_data.nickname === "") {
                    time.textContent = time.textContent + " unknown";
                } else {
                    time.textContent = time.textContent + " " + recordObj.user_data.nickname;
                }
                listElem.appendChild(time);
            }
            list.appendChild(listElem);
        });
        records_list.appendChild(list);
    }

    chkAndUpdateTop10LocalStorageRecords(name_localStorage, current_time, user_data) {
        if (!localStorage.getItem(name_localStorage)) {
            const emptyArray = new Array(10);
            const newRecords = emptyArray.fill("empty");
            newRecords[0] = { "time": current_time, "user_data": user_data };
            localStorage.setItem(name_localStorage, JSON.stringify(newRecords));
        } else {
            let records = JSON.parse(localStorage.getItem(name_localStorage));
            let newRecordObj = { "time": current_time, "user_data": user_data };
            for (let i = 0; i < 10; i++) {
                if (records[i] === "empty") {
                    records[i] = newRecordObj;
                    localStorage.setItem(name_localStorage, JSON.stringify(records));
                    break;
                } else {
                    if (current_time < records[i].time) {
                        let copyRightPartOfArr = records.slice(i, 9);
                        let copyLeftPartOfArr = records.slice(0, i);
                        copyLeftPartOfArr.push(newRecordObj);
                        records = copyLeftPartOfArr.concat(copyRightPartOfArr);
                        localStorage.setItem(name_localStorage, JSON.stringify(records));
                        break;
                    }
                }
            }
        }
    }

    convertMS(input_ms) {
        let ms = (input_ms % 1000) / 100;
        let s = Math.floor(input_ms / 1000);
        let m = Math.floor(s / 60);
        s = s % 60;
        m = m % 60;
        if (s < 10) s = "0" + s;
        return String(m) + ":" + String(s) + ":" + String(ms)
    };

    takeHardcodedMatrix(size) {
        switch(size){
            case 3:
                return [
                    { "letter": "E", "word": "EGO" }, { "letter": "G", "word": "EGO" }, { "letter": "O", "word": "EGO" },
                    { "letter": "E", "word": "EXO" }, { "letter": "X", "word": "EXO" }, { "letter": "O", "word": "EXO" },
                    { "letter": "R", "word": "RED" }, { "letter": "E", "word": "RED" }, { "letter": "D", "word": "RED" }
                ];
            case 5:
                return [
                    { "letter": "L", "word": "LUFFY" }, { "letter": "K", "word": "KAIDO" }, { "letter": "A", "word": "KAIDO" }, { "letter": "I", "word": "OI" }, { "letter": "Y", "word": "YONKOS" },
                    { "letter": "U", "word": "LUFFY" }, { "letter": "E", "word": "ERA" }, { "letter": "I", "word": "KAIDO" }, { "letter": "O", "word": "OI" }, { "letter": "O", "word": "YONKOS" },
                    { "letter": "F", "word": "LUFFY" }, { "letter": "R", "word": "ERA" }, { "letter": "D", "word": "KAIDO" }, { "letter": "S", "word": "YONKOS" }, { "letter": "N", "word": "YONKOS" },
                    { "letter": "F", "word": "LUFFY" }, { "letter": "A", "word": "WE" }, { "letter": "O", "word": "KAIDO" }, { "letter": "O", "word": "YONKOS" }, { "letter": "K", "word": "YONKOS" },
                    { "letter": "Y", "word": "LUFFY" }, { "letter": "M", "word": "MICU" }, { "letter": "I", "word": "MICU" }, { "letter": "C", "word": "MICU" }, { "letter": "U", "word": "MICU" }
                ];
                case 10:
                return [
                       { "letter": "N", "word": "NURIS" },              { "letter": "D", "word": "DDDDDD" },            { "letter": "D", "word": "DRUMS" },             { "letter": "C", "word": "CELLO" },              { "letter": "V", "word": "VIOLLA" },                     { "letter": "K", "word": "KKKKKKKKKKKKKK" },      { "letter": "M", "word": "KKKKKKKKKKKKKK" },      { "letter": "B", "word": "BLACKPINK" },               { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "S", "word": "SUGAR" },  
                       { "letter": "U", "word": "NURIS" },              { "letter": "S", "word": "NURIS" },            { "letter": "R", "word": "DRUMS" },             { "letter": "E", "word": "CELLO" },              { "letter": "I", "word": "VIOLLA" },                     { "letter": "K", "word": "KKKKKKKKKKKKKK" },      { "letter": "M", "word": "KKKKKKKKKKKKKK" },      { "letter": "L", "word": "BLACKPINK" },               { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "U", "word": "SUGAR" },
                       { "letter": "R", "word": "NURIS" },              { "letter": "I", "word": "NURIS" },            { "letter": "U", "word": "DRUMS" },             { "letter": "L", "word": "CELLO" },              { "letter": "O", "word": "VIOLLA" },                     { "letter": "K", "word": "KKKKKKKKKKKKKK" },      { "letter": "M", "word": "KKKKKKKKKKKKKK" },      { "letter": "A", "word": "BLACKPINK" },               { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "G", "word": "SUGAR" },
                       { "letter": "Y", "word": "YELLOW" },             { "letter": "K", "word": "KOSMOS" },                { "letter": "M", "word": "DRUMS" },             { "letter": "L", "word": "CELLO" },              { "letter": "L", "word": "VIOLLA" },                     { "letter": "K", "word": "KKKKKKKKKKKKKK" },      { "letter": "M", "word": "KKKKKKKKKKKKKK" },      { "letter": "C", "word": "BLACKPINK" },               { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "A", "word": "SUGAR" },
                       { "letter": "E", "word": "YELLOW" },           { "letter": "O", "word": "KOSMOS" },             { "letter": "S", "word": "DRUMS" },             { "letter": "O", "word": "CELLO" },              { "letter": "L", "word": "VIOLLA" },                    { "letter": "K", "word": "KKKKKKKKKKKKKK" },      { "letter": "M", "word": "KKKKKKKKKKKKKK" },      { "letter": "K", "word": "BLACKPINK" },               { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "R", "word": "SUGAR" },
                       { "letter": "L", "word": "YELLOW" },           { "letter": "S", "word": "KOSMOS" },         { "letter": "M", "word": "MARIA" },             { "letter": "R", "word": "RESET" },              { "letter": "A", "word": "VIOLLA" },                    { "letter": "K", "word": "KKKKKKKKKKKKKK" },      { "letter": "M", "word": "KKKKKKKKKKKKKK" },      { "letter": "P", "word": "BLACKPINK" },               { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "A", "word": "ANIMALS" },
                       { "letter": "L", "word": "YELLOW" },      { "letter": "M", "word": "KOSMOS" },               { "letter": "A", "word": "MARIA" },        { "letter": "K", "word": "KKKKKKKKKKKKKK" },     { "letter": "K", "word": "KKKKKKKKKKKKKK" },           { "letter": "K", "word": "KKKKKKKKKKKKKK" },      { "letter": "M", "word": "KKKKKKKKKKKKKK" },      { "letter": "I", "word": "BLACKPINK" },               { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "N", "word": "ANIMALS" },
                       { "letter": "O", "word":"YELLOW" },     { "letter": "O", "word": "KOSMOS" },                 { "letter": "R", "word": "MARIA" },       { "letter": "M", "word": "MMMMMMMMMMMMMMM" },    { "letter": "M", "word": "MMMMMMMMMMMMMMM" },          { "letter": "M", "word": "MMMMMMMMMMMMMMM" },     { "letter": "M", "word": "MMMMMMMMMMMMMMM" },     { "letter": "N", "word": "BLACKPINK" },               { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "I", "word": "ANIMALS" },
                       { "letter": "W", "word": "YELLOW" },  { "letter": "S", "word": "KOSMOS" },                   { "letter": "I", "word": "MARIA" },     { "letter": "A", "word": "MARIA" },  { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },        { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "Z", "word": "ZZZZZZZZZZZZZZZZZ" },   { "letter": "K", "word": "BLACKPINK" },             { "letter": "S", "word": "ANIMALS" },   { "letter": "M", "word": "ANIMALS" },                 
                       { "letter": "L", "word": "LIPS" },  { "letter": "I", "word": "LIPS" },  { "letter": "P", "word": "LIPS" }, { "letter": "S", "word": "LIPS" },  { "letter": "X", "word": "XXXXXXXXXXXXXXXXXXX" },        { "letter": "X", "word": "XXXXXXXXXXXXXXXXXXX" },   { "letter": "X", "word": "XXXXXXXXXXXXXXXXXXX" },   { "letter": "X", "word": "XXXXXXXXXXXXXXXXXXX" },             { "letter": "L", "word": "ANIMALS" },   { "letter": "A", "word": "ANIMALS" }
                    ];
        }
        return matrix;
    }




    // &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    // next code for future generator matrixs

}