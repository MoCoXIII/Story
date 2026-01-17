initStrudel();
let track;
let defaultMusic = {
    cpm: 30,
    orbits: {
        a: {
            note: "<c a f e>(3,8)",
            room: 0.7,
            gain: "0.9 0.5 0.1"
        },
        b: {
            note: "<f e c a>(5,8)",
            room: 0.3,
            pan: "<0 1>"
        }
    }
};
let music = { ...defaultMusic };
document.addEventListener('DOMContentLoaded', () => {
    update();
});

function update() {
    if (musicActive) {
        evaluate(
            `
            setcpm(music.cpm)
            stack(
                ...Object.entries(music.orbits).map(([key, orbit]) =>
                    playOrbit(orbit).orbit(orbitIndex(key))
                )
            );
            `
        );
    }
}

function playOrbit(orbit) {
    let p = note(orbit.note)

    Object.entries(orbit).forEach(([key, value]) => {
        if (key !== 'note' && typeof p[key] === 'function') {
            p = p[key](value)
        }
    })

    return p
}

function orbitIndex(key) {
    return key.charCodeAt(0) - 97 // a=0, b=1, c=2
}
