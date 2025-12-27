initStrudel();
document.body.click()  // circumvent strudel only activating after a click event
let track;
let defaultMusic = {
    "cpm": 30,  // default cycle (bar of 4 beats in 4/4) is 2s (30 cpm = 30c / 60s)
    "room": 0,
    "delay": 0
};
let music = { ...defaultMusic };
document.addEventListener('DOMContentLoaded', () => {
    update();
});

function update() {
    if (musicActive) {
        evaluate(`
            setcpm(music.cpm)
            $: note("<c a f e>(3,8)").juxby(0, rev).room(music.room).delay(music.delay)
        `);
    }
}