let urlParams = new URLSearchParams(window.location.search);
let chapterIndex = urlParams.get('c') || "0000";

document.addEventListener("DOMContentLoaded", function () {
    let ceiling = document.createElement("div");
    ceiling.classList.add("ceiling");

    let dark = true;
    let darkModeToggle = document.createElement("span");
    darkModeToggle.classList.add("pointer")
    darkModeToggle.innerHTML = `${dark ? "Dark" : "Light"} Mode`;
    ceiling.appendChild(darkModeToggle);
    darkModeToggle.addEventListener("click", function () {
        dark = !dark;
        darkModeToggle.innerHTML = `${dark ? "Dark" : "Light"} Mode`;
        document.documentElement.classList.toggle("light-mode");
    });
    document.body.insertAdjacentElement("afterbegin", ceiling);

    const seperator = document.createElement("span");
    seperator.innerHTML = " | ";
    ceiling.appendChild(seperator);

    let customCSSbutton = document.createElement("span");
    customCSSbutton.classList.add("pointer")
    customCSSbutton.innerHTML = "Custom CSS";
    ceiling.appendChild(customCSSbutton);
    let defaultCSS = "";
    fetch("style.css")
        .then(response => response.text())
        .then(css => defaultCSS = css);
    if (localStorage.getItem("css")) {
        let css = localStorage.getItem("css");
        let originalCSSLink = document.querySelector("link[href='style.css']");
        if (originalCSSLink) {
            originalCSSLink.remove();
        }
        let newStyleElement = document.createElement("style");
        newStyleElement.id = "custom-css";
        newStyleElement.innerHTML = css;
        document.head.appendChild(newStyleElement);
    }
    customCSSbutton.addEventListener("click", function () {
        // open this url but on customcss.html where you can modify your custom css, save it to localStorage, then returns you to this page (reloads the page to apply the changes)
        window.location.href = `customcss.html?c=${chapterIndex}`;
    });

    fetch("dergrund.json")
        .then(response => response.json())
        .then(data => display(data, chapterIndex));
});



function display(data, chapterIndex) {
    let chapter = data[chapterIndex];
    let error = false;
    if (!chapter) {
        chapter = data["error"];
        error = true;
    }
    let newChapterDiv = document.createElement("div")
    newChapterDiv.classList.add("chapter");
    let chapterDiv = newChapterDiv;
    chapterDiv.innerHTML = "";
    document.body.appendChild(chapterDiv);

    for (let [elementType, texts] of chapter) {
        if (texts === "") {
            display(data, elementType);
            continue;
        }
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
                appendAndLink(chapterDiv, element, link);
                continue;
            }
            chapterDiv.appendChild(element);
        }
    }

    if (error) {
        const closestChapters = Object.keys(data).filter(key => levenshteinDistance(key, chapterIndex) <= 3).sort((a, b) => levenshteinDistance(a, chapterIndex) - levenshteinDistance(b, chapterIndex));
        for (let closestChapter of closestChapters.slice(0, 5)) {
            const chapterLink = document.createElement("span")
            chapterLink.innerHTML = data[closestChapter][0][1][0][0];
            chapterLink.classList.add("clink")
            const spoiler = document.createElement("details")
            spoiler.classList.add("spoiler")
            const summary = document.createElement("summary")
            summary.innerHTML = closestChapter;
            spoiler.appendChild(summary)
            appendAndLink(spoiler, chapterLink, "?c=" + closestChapter);
            chapterDiv.appendChild(spoiler)
            chapterDiv.appendChild(document.createElement("br"))
        }
    }

    function appendAndLink(parent, element, link) {
        let linker = document.createElement("a");
        for (let htmlclass of element.classList) {
            linker.classList.add(htmlclass);
        }
        linker.href = link;
        linker.appendChild(element);
        parent.appendChild(linker);
    }
}

function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const d = Array.from({ length: m + 1 }, (v) => Array.from({ length: n + 1 }, (v2) => 0));
    for (let i = 1; i <= m; i++) {
        d[i][0] = i;
    }
    for (let j = 1; j <= n; j++) {
        d[0][j] = j;
    }
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        }
    }
    return d[m][n];
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
    let decimalBase128Digits;
    ({ decimalBase128Digits } = getBase128Digits(base10int));
    for (let decimalBase128Digit of decimalBase128Digits) {
        const hexDigit = 0x1E00 + decimalBase128Digit;
        console.log(hexDigit.toString(16).padStart(4, '0'));
        const base128Char = String.fromCharCode(hexDigit);
        result += base128Char;
    }
    return result;
}

function getBase128Digits(base10int) {
    let decimalBase128Digits = [];
    while (base10int > 0) {
        decimalBase128Digits.push(base10int % 128);
        base10int = Math.floor(base10int / 128);
    }
    decimalBase128Digits.reverse();
    return { decimalBase128Digits };
}
