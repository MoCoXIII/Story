let urlParams = new URLSearchParams(window.location.search);
let chapterIndex = urlParams.get('c') || "0000";
let musicActive = false;

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

    let newSeperator = seperator.cloneNode(true);
    ceiling.appendChild(newSeperator);

    musicActive = localStorage.getItem("music") === "true" || false;
    let musicToggle = document.createElement("span");
    musicToggle.classList.add("pointer")
    musicToggle.innerHTML = `${musicActive ? "Music On" : "Music Off"}`;
    ceiling.appendChild(musicToggle);
    musicToggle.addEventListener("click", function () {
        musicActive = !musicActive;
        musicToggle.innerHTML = `${musicActive ? "Music On" : "Music Off"}`;
        localStorage.setItem("music", musicActive);
        if (musicActive) {
            update();
        } else {
            strudel.hush();
        }
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
            let i = 0;
            let element = document.createElement(elementType);

            const text = snippet[i++];
            if (elementType === "img") {
                element.src = text;
            } else if (elementType === "svg" && text.endsWith(".svg")) {
                fetch(text)
                    .then(response => response.text())
                    .then(svgContent => element.outerHTML = svgContent);
            } else {
                element.innerHTML = text;
            }

            if (elementType === "abbr") {
                element.title = snippet[i++];
            }

            const classes = snippet[i++];
            if (classes) {
                for (let htmlclass of classes.split(/\s+/)) {
                    element.classList.add(htmlclass);
                }
                if (classes.includes("translate")) {
                    element.innerHTML = translate(text);
                }
                if (classes.includes("base128")) {
                    element.innerHTML = translate(text, true)
                }
                if (classes.includes("newline")) {
                    chapterDiv.appendChild(document.createElement("br"));
                }
            }

            const link = snippet[i++];
            if (link) {
                appendAndLink(chapterDiv, element, link);
                continue;
            }
            chapterDiv.appendChild(element);
        }
    }

    if (error) {
        const closestChapters = Object.keys(data).filter(cid => !cid.includes("!") && !cid.endsWith("-")).sort((a, b) => {
            const distanceA = levenshteinDistance(a, chapterIndex);
            const distanceB = levenshteinDistance(b, chapterIndex);
            if (distanceA === distanceB) {
                const sameCapitalizationA = a.toLowerCase() === chapterIndex.toLowerCase();
                const sameCapitalizationB = b.toLowerCase() === chapterIndex.toLowerCase();
                return (sameCapitalizationA && !sameCapitalizationB) ? -1 : (sameCapitalizationB && !sameCapitalizationA) ? 1 : a.localeCompare(b);
            }
            return distanceA - distanceB;
        });
        for (let closestChapter of closestChapters) {  // .slice(0, 5)
            const chapterLink = document.createElement("span")
            let linkContent = data[closestChapter];
            for (let i of [0, 1, 0, 0]) {
                linkContent = linkContent[i] || linkContent;
            }
            chapterLink.innerHTML = linkContent;
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
    const INSERTION_COST = 1;
    const DELETION_COST = 2;
    const REPLACEMENT_COST = 2;
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
            const cost = a[i - 1] === b[j - 1] ? 0 : REPLACEMENT_COST;
            d[i][j] = Math.min(d[i - 1][j] + INSERTION_COST, d[i][j - 1] + DELETION_COST, d[i - 1][j - 1] + cost);
        }
    }
    return d[m][n];
}


function translate(text, onlyNumbers = false) {
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
    if (onlyNumbers) {
        return text;
    }
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
