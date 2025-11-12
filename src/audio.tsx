const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

let limitReachedBuffer: AudioBuffer | null = null;
let nextImageBuffer: AudioBuffer | null = null;

async function loadAudioBuffer(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

export async function initAudio() {
    if (!limitReachedBuffer) {
        limitReachedBuffer = await loadAudioBuffer(
            import.meta.env.BASE_URL + 'limit-reached.mp3'
        );
    }
    if (!nextImageBuffer) {
        nextImageBuffer = await loadAudioBuffer(
            import.meta.env.BASE_URL + 'next.mp3'
        );
    }
}

function playBuffer(buffer: AudioBuffer, volume: number = 1) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode).connect(audioContext.destination);
    source.start(0);
    // Restore volume after playback if needed
    source.onended = () => {
        gainNode.gain.value = 1;
    };
}

export async function unlockAudio() {
    await initAudio();
    if (limitReachedBuffer) playBuffer(limitReachedBuffer, 0);
    if (nextImageBuffer) playBuffer(nextImageBuffer, 0);
}

export async function playSound(
    name: 'limitReached' | 'nextImage',
    volume: number = 1
) {
    await initAudio();
    if (name === 'limitReached' && limitReachedBuffer) {
        playBuffer(limitReachedBuffer, volume);
    }
    if (name === 'nextImage' && nextImageBuffer) {
        playBuffer(nextImageBuffer, volume);
    }
}
