export const limitReachedAudio = new Audio(
    import.meta.env.BASE_URL + 'limit-reached.mp3'
);
export const nextImageAudio = new Audio(import.meta.env.BASE_URL + 'next.mp3');

export const unlockAudio = () => {
    limitReachedAudio.play().then(() => {
        limitReachedAudio.pause();
        limitReachedAudio.currentTime = 0;
    });
    nextImageAudio.play().then(() => {
        nextImageAudio.pause();
        nextImageAudio.currentTime = 0;
    });
};
