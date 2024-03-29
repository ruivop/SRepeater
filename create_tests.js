/**
$#$ number in sequence
$#.R.0.100$ random number between [0,100[
$#.R.0.100.var1$ random number between [0,100[ and store it in vaiable var1
$v.var1$ the value of var1
*/
var $container = $('.mainTextInput');
var $backdrop = $('.backdrop');
var $highlights = $('#colorPrint');
var $textarea = $('#input');

var stringInput = null;

function createOutput() {

    stringInput = document.getElementById("input").value;
    userArrays = document.getElementById("inputArray").value.split("\n");

    createNestedParts(stringInput);

    var concat = "";
    try {
        concat = rootContext.getOutput();
        $('.inputErrorMessage').html("");
    } catch (e) {
        console.log(e);
        $('.inputErrorMessage').html(e);
    }
    console.log(concat);

    document.getElementById("output").value = concat;
}

function createNestedParts(stringInput) {
    var objectParts = [];
    var stringParts = stringInput.split(splitPattern);

    for (var stringPart of stringParts) {
        objectParts.push(new TypePattern(stringPart));
    }

    rootContext.nestedParts = [];
    var contextIndex = 0;
    var contexts = [rootContext];

    for (userPart of objectParts) {
        if (userPart.type == "pattern" && userPart.args[0].type == "C") {
            contexts.push(userPart);
            contexts[contextIndex].nestedParts.push(userPart);
            contextIndex++;
            continue;
        } else if (userPart.type == "pattern" && userPart.args[0].type == "EC") {
            if (contextIndex <= 0)
                throw 'There is an "ec" without an "c"';
            contexts[contextIndex].nestedParts.push(userPart);
            contextIndex--;
            contexts.pop();
            continue;
        }

        contexts[contextIndex].nestedParts.push(userPart);
    }

    if (contextIndex != 0)
        throw "The context does not close";
}



class TypePattern {
    constructor(str) {
        this.str = str;
        this.type;
        this.args = [];
        this.nestedParts = [];
        this.isSelected = false;

        if (splitPattern.test(str))
            this.type = "pattern";
        else
            this.type = "string";

        if (this.type == "pattern") {


            var argsStringArray = str.substring(1, str.length - 1).split(" ");
            for (var i = 0; i < argsStringArray.length; i++) {
                this.args.push(new SubArgType(argsStringArray[i]));
            }
            var selfArgArr = [this.args[0]];
            if (this.args[0].type == "N") {
                var musts = [new SubArgType("r")];
                var mustsEither = [new SubArgType("u"), new SubArgType("ul")];
                var could = [new SubArgType("v"), new SubArgType("isVisible")];

                testMustContain(this.args, musts);
                testMustContainEither(this.args, mustsEither);
                testNotContainMoreThanCapable(this.args, selfArgArr.concat(musts, mustsEither, could));
            } else if (this.args[0].type == "V") {
                var musts = [new SubArgType("v")];

                testMustContain(this.args, musts);
                testNotContainMoreThanCapable(this.args, selfArgArr.concat(musts));
            } else if (this.args[0].type == "A") {
                var mustsEither = [new SubArgType("n"), new SubArgType("v")];

                testMustContainEither(this.args, mustsEither);
                testNotContainMoreThanCapable(this.args, selfArgArr.concat(mustsEither));
            } else if (this.args[0].type == "S") {
                var mustsEither = [new SubArgType("r"), new SubArgType("lorem"), new SubArgType("person")];

                testMustContainEither(this.args, mustsEither);
                testNotContainMoreThanCapable(this.args, selfArgArr.concat(mustsEither));
            } else if (this.args[0].type == "C") {
                var mustsEitherGeneral = [new SubArgType("n"), new SubArgType("a")];
                testMustContainEither(this.args, mustsEitherGeneral);

                if (this.args[1].type == "n") {
                    var mustsEither = [new SubArgType("u"), new SubArgType("ul")];
                    var could = [new SubArgType("v"), new SubArgType("r")];

                    testMustContainEither(this.args, mustsEither);
                    testNotContainMoreThanCapable(this.args, selfArgArr.concat(mustsEitherGeneral, mustsEither, could));
                } else if (this.args[1].type == "a") {
                    var could = [new SubArgType("v"), new SubArgType("r")];

                    testNotContainMoreThanCapable(this.args, selfArgArr.concat(mustsEitherGeneral, could));
                } else {
                    throw 'Cannot find "' + this.args[0].type + '" subtype in place';
                }
            } else if (this.args[0].type == "EC") {
                if (this.args.length != 1)
                    throw "Incorrect args of ec: " + this.args.length + " args given.";
            } else {
                throw '"' + this.args[0].type + '" not found as an arg';
            }
        }
    }

    giveIndex(userVars) {
        if (this.type == "string")
            return this.str;

        if (this.args[0].type == "N") {
            var concat;
            var isVisible = 'true';
            for (var i = 0; i < this.args.length; i++) {
                if (this.args[i].type == "u") {
                    concat = randomIntFromInterval(0, this.args[i].values[0]);
                }
                if (this.args[i].type == "ul") {
                    concat = randomIntFromInterval(this.args[i].values[0], this.args[i].values[1]);
                }
                if (this.args[i].type == "v") {
                    addUserVar(userVars, new UserVar(this.args[i].values[0], concat));
                }
                if (this.args[i].type == "isVisible") {
                    isVisible = this.args[i].values[0];
                }
            }
            if (isVisible == 'true')
                return concat;
            else {
                return "";
            }
        }

        if (this.args[0].type == "V") {
            for (var vars of userVars) {
                if (vars.name == this.args[1].values[0])
                    return vars.value;
            }
            throw "v(" + this.args[1].values[0] + ") does not have a previous value to copy from";
        }

        if (this.args[0].type == "A") {
            if (this.args[1].type == "n") {
                return userArrays[parseInt(this.args[1].values[0])];
            }
            if (this.args[1].type == "v") {
                for (var vars of userVars) {
                    if (vars.name == this.args[1].values[0]) {
                        return userArrays[parseInt(vars.value)];
                    }
                }
                throw "v(" + this.args[1].values[0] + ") does not have a previous value to copy from";
            }
        }

        if (this.args[0].type == "S") {
            if (this.args[1].type == "r")
                return randomStringFromSize(this.args[1].values[0]);
            else if (this.args[1].type == "lorem")
                throw "not implemnted";
            else if (this.args[1].type == "person")
                throw "not implemnted";
            else
                throw "not implemnted";
        }

        if (this.args[0].type == "C") {
            var concat = "";
            var varName;

            if (this.args[1].type == "n") {
                var varInitValue = 0;
                var varFinalValue;
                var isRandom = false;

                for (var i = 2; i < this.args.length; i++) {
                    if (this.args[i].type == "r") {
                        isRandom = true;
                    }
                    if (this.args[i].type == "u") {
                        if (isRandom)
                            varFinalValue = randomIntFromInterval(0, this.args[i].values[0]);
                        else
                            varFinalValue = this.args[i].values[0];
                    }
                    if (this.args[i].type == "ul") {
                        if (isRandom) {
                            varFinalValue = randomIntFromInterval(this.args[i].values[0], this.args[i].values[1]);
                        } else {
                            varInitValue = this.args[i].values[0];
                            varFinalValue = this.args[i].values[1];
                        }
                    }
                    if (this.args[i].type == "v") {
                        varName = this.args[i].values[0];
                    }
                }

                var clonedVars;
                varInitValue = parseInt(varInitValue);
                varFinalValue =  parseInt(varFinalValue)
                for (var i = varInitValue; i < varFinalValue; i++) {
                    if (varName)
                        clonedVars = addUserVar(userVars.slice(0), new UserVar(varName, i));
                    else
                        clonedVars = userVars.slice(0);

                    for (var part of this.nestedParts)
                        concat += part.giveIndex(clonedVars);
                }
            } else if (this.args[1].type == "a") {
                if (this.args[2] && this.args[2].type == "v") {
                    varName = this.args[2].values[0];
                }

                var clonedVars;
                for (var arrayItem of userArrays) {
                    if (varName)
                        clonedVars = addUserVar(userVars.slice(0), new UserVar(varName, arrayItem));
                    else
                        clonedVars = userVars.slice(0);

                    for (var part of this.nestedParts)
                        concat += part.giveIndex(clonedVars);
                }
            }
            return concat;
        }

        if(this.args[0].type == "EC") {
            return "";
        }
    }

    getOutput() {
        var userVars = [];
        return this.giveIndex(userVars);
    }

    printWithColors(elementToPrint, isRoot) {
        var scriptEl = document.createElement("span");

        //if (this.type == "string") {
        if (!isRoot) {
            var textEl = document.createElement("span");

            var textChild = document.createTextNode(this.str);
            textEl.appendChild(textChild);
            scriptEl.appendChild(textEl);
        }
        //} else {
        if (this.type != "string" && this.args[0].type == "C") {
            var nestedElementsChildren = document.createElement("span");
            nestedElementsChildren.classList.add("nested");

            for (var part of this.nestedParts)
                part.printWithColors(nestedElementsChildren, false);

            scriptEl.appendChild(nestedElementsChildren);
        } //

        if (this.isSelected)
            scriptEl.classList.add("selectable");

        elementToPrint.appendChild(scriptEl);
    }

    getElementFromTextOffset(offset, isRoot) {
        var newOffset = offset;
        if (!isRoot) {
            newOffset = offset - this.str.length;

            if (newOffset <= 0) {
                this.isSelected = true;
                return [newOffset, this];
            } else {
                this.isSelected = false;
            }
        }

        if (this.type != "string" && this.args[0].type == "C") {
            for (var part of this.nestedParts) {
                var result = part.getElementFromTextOffset(newOffset, false);
                if (result[1] != null)
                    return result;
                newOffset = result[0];
            }
        }
        return [newOffset, null];
    }
}

class SubArgType {
    constructor(stringArg) {
        var splitArgs = stringArg.split(".");
        this.type = splitArgs[0];
        this.values = splitArgs.slice(1, splitArgs.length);
    }
}

class UserVar {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

var splitPattern = /(\$.*?\$)/g;

var rootContext = new TypePattern("$C n u.1$");

var userArrays = [];

function colorPrint() {
    stringInput = document.getElementById("input").value;
    stringInput += " ";
    var elementToPrint = document.getElementById("colorPrint");
    if (elementToPrint.children.length > 0)
        elementToPrint.removeChild(elementToPrint.children[0]);
    try {
        createNestedParts(stringInput);
        $('.inputErrorMessage').html("");
    } catch (e) {
        console.log(e);
        $('.inputErrorMessage').html(e);
    }

    var elementSelected = rootContext.getElementFromTextOffset(document.getElementById("input").selectionStart, true);
    onMouseEnterElement(elementSelected[1]);

    rootContext.printWithColors(elementToPrint, true);
    handleScroll();
}

function onMouseEnterElement(element) {
    var elementToPrint = document.getElementById("colorPrintPropertiesTable");
    if (elementToPrint.children.length > 0)
        elementToPrint.removeChild(elementToPrint.children[0]);
    if (!element)
        return;
    var elementToPrintBody = elementToPrint.createTBody();

    var trTitle = creteTr2Elm("Name", "Value");
    var trEl = creteTr2Elm("Type", element.type);
    elementToPrintBody.appendChild(trTitle);
    elementToPrintBody.appendChild(trEl);

    if (element.type != "string") {
        for (var i = 0; i < element.args.length; i++) {
            var concat = "";
            for (var j = 0; j < element.args[i].values.length; j++) {
                concat += element.args[i].values[j];
                if (j != element.args[i].values.length - 1)
                    concat += ", "
            }
            var trEl = creteTr2Elm(element.args[i].type, concat);
            elementToPrintBody.appendChild(trEl);
        }
    }
}

function creteTr2Elm(fEl, sEl) {
    var trEl = document.createElement("tr");

    var tdElName = document.createElement("td");
    tdElName.appendChild(document.createTextNode(fEl));
    tdElName.classList.add("colorPrintPropertyName");
    var tdElValue = document.createElement("td");
    tdElValue.appendChild(document.createTextNode(sEl));
    tdElValue.classList.add("colorPrintPropertyValue");

    trEl.appendChild(tdElName);
    trEl.appendChild(tdElValue);
    return trEl;
}

function deleteFromName(userVars, varName) {
    var newArray = [];
    for (var i = 0; i < userVars.length; i++) {
        if (userVars[i].name == varName)
            return newArray;
        newArray.push(userVars[i]);
    }
    throw 'Unknown variable "' + varName + '"';
}

function addUserVar(userArray, toAdd) {
    for (var i = 0; i < userArray.length; i++) {
        if (userArray[i].name == toAdd.name)
            throw 'Variable "' + toAdd.name + '" already exists';
    }
    userArray.push(toAdd);
    return userArray;
}

function testMustContain(args, musts) {
    for (var must of musts) {
        var wasFound = false;
        for (var arg of args) {
            if (must.type == arg.type) {
                wasFound = true;
                continue;
            }
        }
        if (!wasFound)
            throw 'The mandatory argument "' + must.type + '" was not found';
    }
}

function testMustContainEither(args, musts) {
    var wasFound = false;
    var lastFound;
    for (var must of musts) {
        for (var arg of args) {
            if (must.type == arg.type && wasFound) {
                throw 'The arguments "' + must.type + '" and "' + lastFound.type + '" cannot coexist';
            } else if (must.type == arg.type && !wasFound) {
                wasFound = true;
                lastFound = must;
            }
        }
    }
    if (!wasFound) {
        var errorString = "One of the following must be present: ";
        for (var must of musts) {
            errorString += '"' + must.type + "', ";
        }
        throw errorString;
    }
}

function testNotContainMoreThanCapable(args, capables) {
    for (var arg of args) {
        var wasFound = false;
        for (var capable of capables) {
            if (capable.type == arg.type) {
                wasFound = true;
                continue;
            }
        }
        if (!wasFound)
            throw '"' + arg.type + '" is not supported in the context';
    }
}

function randomIntFromInterval(min, max) { //min included and max excluded
    min = parseInt(min);
    max = parseInt(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function randomStringFromSize(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function copyFunction() {
    var copyText = document.getElementById("output");

    copyText.select();

    document.execCommand("copy");
}











var ua = window.navigator.userAgent.toLowerCase();
var isIE = !!ua.match(/msie|trident\/7|edge/);
var isWinPhone = ua.indexOf('windows phone') !== -1;
var isIOS = !isWinPhone && !!ua.match(/ipad|iphone|ipod/);

// yeah, browser sniffing sucks, but there are browser-specific quirks to handle that are not a matter of feature detection
var ua = window.navigator.userAgent.toLowerCase();
var isIE = !!ua.match(/msie|trident\/7|edge/);
var isWinPhone = ua.indexOf('windows phone') !== -1;
var isIOS = !isWinPhone && !!ua.match(/ipad|iphone|ipod/);

function applyHighlights(text) {
    text = text
        .replace(/\n$/g, '\n\n')
        .replace(/[A-Z].*?\b/g, '<mark>$&</mark>');

    if (isIE) {
        // IE wraps whitespace differently in a div vs textarea, this fixes it
        text = text.replace(/ /g, ' <wbr>');
    }

    return text;
}

function handleScroll() {
    var scrollTop = $textarea.scrollTop();
    $backdrop.scrollTop(scrollTop);

    var scrollLeft = $textarea.scrollLeft();
    $backdrop.scrollLeft(scrollLeft);
}

function fixIOS() {
    // iOS adds 3px of (unremovable) padding to the left and right of a textarea, so adjust highlights div to match
    $highlights.css({
        'padding-left': '+=3px',
        'padding-right': '+=3px'
    });
}

function bindEvents() {
    $textarea.on({
        'keyup': colorPrint,
        'scroll': handleScroll,
        'click': colorPrint
    });
}

if (isIOS) {
    fixIOS();
}

bindEvents();
colorPrint();