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
        window.location.href = `customcss.html?c=${chapterIndex}`;
    });

    let newSeperator = seperator.cloneNode(true);
    ceiling.appendChild(newSeperator);

    musicActive = localStorage.getItem("music") === "true" || false;

    if (musicActive) {
        let screenCover = document.createElement("div");
        screenCover.classList.add("screen-cover");
        screenCover.addEventListener("click", function () {
            screenCover.remove();
        });
        document.body.appendChild(screenCover);

        let style = document.createElement("style");
        style.innerHTML = `
        .screen-cover {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-image: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,1) 50%);
            display: flex;
            justify-content: flex-end;
            align-items: center;
        }
        `;
        screenCover.appendChild(style);

        let info = document.createElement("div");
        info.classList.add("info");
        info.innerHTML = "Click anywhere to resume music playback.";
        info.style.position = "fixed";
        info.style.top = "75%";
        info.style.left = "50%"
        info.style.transform = "translateY(-50%) translateX(-50%)";
        info.style.textAlign = "center";
        screenCover.appendChild(info);
    }

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

    fetch("story.story")
        .then(response => response.text())
        .then(storyText => {
            storyText = removeComments(storyText);
            const chapters = splitChapters(storyText);
            display(chapters, chapterIndex);
            console.log("Loaded everything.");
        });
});

function removeComments(storyText) {
    return storyText.replace(/\/\/.*?\/\//gms, '');
}

function splitChapters(storyText) {
    return Object.fromEntries(
        Array.from(storyText.matchAll(/´´(.+?);(.*?)(?=´´)/gms))
            .map(m => [m[1], m[2].trim()])
    );
}


function display(data, chapterIndex, parentChapter = document.body) {
    let chapter = data[chapterIndex];
    let error = false;
    if (!chapter) {
        chapter = data["!error"];
        error = true;
    }
    let newChapterDiv = document.createElement("div")
    newChapterDiv.classList.add("chapter");
    newChapterDiv.innerHTML = "";
    parentChapter.appendChild(newChapterDiv);

    for (const match of chapter.matchAll(/(?<=\s*?)\^\^(.+?);(.*?)(?=\s*?\^\^)/gms)) {
        const elementType = match[1];
        const content = match[2];
        if (content === "") {
            display(data, elementType, newChapterDiv);
            continue;
        }
        let lastElement = null;
        for (const match of content.matchAll(/(?<=;?\n*(?= *\S))((?:.*?(?:".*?")?(?:\[.*?\])?)+?);/gms)) {
            let token = match[1];
            if (token.startsWith("-")) {
                const [flag, value] = token.split(" ", 2);
                switch (flag) {
                    case "-abbr":
                        lastElement.title = value;
                        break;
                    case "-class":
                        applyClasses(value, lastElement);
                        break;
                    case "-normlink":
                        appendAndLink(newChapterDiv, lastElement, value);
                        break;
                    case "-link":
                        applyClasses("link", lastElement);
                        appendAndLink(newChapterDiv, lastElement, value);
                        break;
                    case "-unlink":
                        applyClasses("unlink", lastElement);
                        appendAndLink(newChapterDiv, lastElement, value);
                        break;
                    case "-unclink":
                        applyClasses("unlink", lastElement);
                        appendAndLink(newChapterDiv, lastElement, "?c=" + value);
                        break;
                    case "-clink":
                        applyClasses("clink", lastElement);
                        appendAndLink(newChapterDiv, lastElement, "?c=" + value);
                        break;
                    case "-style":
                        lastElement.style.cssText = JSON.parse(value);
                        break;
                    case "-ID":
                        lastElement.id = value;
                        break;
                    default:
                        console.log("Uncaught flag: ", flag, "\nwith value: ", value);
                        break;
                }
            } else {
                let text = token.replace(/\r?\n|\\n/g, '<br>').replace(/#cid#/g, chapterIndex);
                lastElement = document.createElement(elementType);

                // if (elementType === "music") {
                //     lastElement.dataset.obj = text;
                //     setInterval(function () {
                //         let musicElements = document.querySelectorAll("[data-obj]");
                //         let lowerBound = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight ? window.innerHeight : window.innerHeight / 3;
                //         let updatedMusic = JSON.parse(JSON.stringify(defaultMusic));  // clone music, not redundant
                //         function mergeObjects(target, source) {
                //             for (const key of Object.keys(source)) {
                //                 if (typeof source[key] === 'object' && typeof target[key] === 'object') {
                //                     mergeObjects(target[key], source[key]);
                //                 } else {
                //                     target[key] = source[key];
                //                 }
                //             }
                //             return target;
                //         }
                //         if (lastElement.getBoundingClientRect().top > lowerBound) {
                //             break;
                //         }
                //         const newMusic = JSON.parse(lastElement.dataset.obj);
                //         updatedMusic = mergeObjects(updatedMusic, newMusic);

                //         if (JSON.stringify(updatedMusic) !== JSON.stringify(music)) {
                //             Object.assign(music, updatedMusic);
                //             console.log("updating music to", music);
                //             update();
                //         }
                //     }, 1000);
                // }
                // else
                if (elementType === "img") {
                    lastElement.src = text;
                } else if (elementType === "svg" && text.endsWith(".svg")) {
                    fetch(text)
                        .then(response => response.text())
                        .then(svgContent => lastElement.outerHTML = svgContent);
                } else {
                    lastElement.innerHTML = text;
                }
                newChapterDiv.appendChild(lastElement);
            }
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
            const chapterLink = document.createElement("span");
            const chapterPreviewMatch = data[closestChapter].match(/\+(.*)\+/ms);
            let chapterPreview = "No chapter preview available.";
            if (chapterPreviewMatch) {
                chapterPreview = chapterPreviewMatch[1];
            }
            chapterLink.innerHTML = chapterPreview;
            chapterLink.classList.add("clink")
            const spoiler = document.createElement("details")
            spoiler.classList.add("spoiler")
            const summary = document.createElement("summary")
            summary.innerHTML = closestChapter;
            spoiler.appendChild(summary)
            appendAndLink(spoiler, chapterLink, "?c=" + closestChapter);
            newChapterDiv.appendChild(spoiler)
            newChapterDiv.appendChild(document.createElement("br"))
        }
    }

    function applyClasses(classesString, targetElement) {
        for (let htmlclass of classesString.split(/\s+/)) {
            targetElement.classList.add(htmlclass);
        }
        if (classesString.includes("translate")) {
            targetElement.innerHTML = translate(text);
        }
        if (classesString.includes("base128")) {
            targetElement.innerHTML = translate(text, true);
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
