let urlParams = new URLSearchParams(window.location.search);
let chapterIndex = urlParams.get('c') || "0000";
fetch("dergrund.json")
    .then(response => response.json())
    .then(data => display(data, chapterIndex));

function display(data, chapterIndex) {
    let chapter = data[chapterIndex] || data["0000"];
    let possibleNewChapterDiv = document.createElement("div")
    possibleNewChapterDiv.id = "chapter"
    let chapterDiv = document.getElementById("chapter") || possibleNewChapterDiv;
    chapterDiv.innerHTML = "";
    document.body.appendChild(chapterDiv);

    for (let [elementType, texts] of chapter) {
        for (let snippet of texts) {
            let element = document.createElement(elementType);
            const text = snippet[0];
            element.innerHTML = text;
            const classes = snippet[1];
            if (classes) {
                for (let htmlclass of classes.split(/\s+/)) {
                    element.classList.add(htmlclass);
                }
                if (classes.includes("emqjeciv") && classes.includes("translate")) {
                    element.innerHTML = translate(text);
                }
                if (classes.includes("newline")) {
                    chapterDiv.appendChild(document.createElement("br"));
                }
            }
            const link = snippet[2];
            if (link) {
                let linker = document.createElement("a");
                linker.href = link;
                linker.appendChild(element);
                chapterDiv.appendChild(linker);
                continue;
            }
            chapterDiv.appendChild(element);
        }
    }
}

function translate(text) {
    const translator = {
        "a": "e",
        "e": "i",
        "i": "o",
        "o": "u",
        "u": "a",
        "b": "c",
        "c": "d",
        "d": "f",
        "f": "g",
        "g": "h",
        "h": "j",
        "j": "k",
        "k": "l",
        "l": "m",
        "m": "n",
        "n": "p",
        "p": "q",
        "q": "r",
        "r": "s",
        "s": "t",
        "t": "v",
        "v": "w",
        "w": "x",
        "x": "y",
        "y": "z",
        "z": "a",
        "ä": "ei",
        "ö": "ui",
        "ü": "ai",
        "ß": "tt",
    }
    text = text.replace(/\/(\d+)\//g, (match, base10int) => {
        return "/" + replaceWithBase128Chars(base10int) + "/";
    });
    let result = "";
    for (let char of text) {
        let replacement = translator[char];
        if (!replacement) {
            replacement = translator[char.toLowerCase()];
            if (replacement) {
                replacement = replacement.toUpperCase();
            } else {
                replacement = char;
            }
        }
        result += replacement;
    }

    return result;
}
function replaceWithBase128Chars(base10int) {
    let result = "";
    let decimalBase128Digits = [];
    while (base10int > 0) {
        decimalBase128Digits.push(base10int % 128);
        base10int = Math.floor(base10int / 128);
    }
    decimalBase128Digits.reverse();
    for (let decimalBase128Digit of decimalBase128Digits) {
        const hexDigit = 0x1E00 + decimalBase128Digit;
        console.log(hexDigit.toString(16).padStart(4, '0'));
        const base128Char = String.fromCharCode(hexDigit);
        result += base128Char;
    }
    return result;
}