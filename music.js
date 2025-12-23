initStrudel();
let track;
document.addEventListener('DOMContentLoaded', () => {
    track = stack(
        note('<c a f e>(3,8)').jux(rev)
    );
    track.play();
});