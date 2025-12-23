initStrudel();
let track;
let trackString = `stack(
        note('<c a f e>(3,8)').jux(rev)
    )`;
document.addEventListener('DOMContentLoaded', () => {
    if (musicActive) {update()};
});

function update() {
    track = evaluate(trackString);
}