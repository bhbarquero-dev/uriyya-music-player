import { Song } from "./Song";

const FADE_DURATION_MS = 6000;
const FADE_STEP_INTERVAL_MS = 100;

export type AudioChannel = 1 | 2;

export interface AudioManagerEvents {
    onEnded: (channelId: AudioChannel) => void;
    onError: (channelId: AudioChannel, error: any) => void;
    onFadeFinished: (channelId: AudioChannel) => void;
}

export class AudioManager {
    private channels: Record<AudioChannel, HTMLAudioElement>;
    private fadeIntervals: Record<AudioChannel, number | null> = { 1: null, 2: null };
    private activeChannelId: AudioChannel = 1;
    private events: AudioManagerEvents;

    constructor(events: AudioManagerEvents) {
        this.events = events;
        this.channels = {
            1: new Audio(),
            2: new Audio()
        };

        this.setupListeners(1);
        this.setupListeners(2);
    }

    private setupListeners(id: AudioChannel) {
        const audio = this.channels[id];
        audio.addEventListener("ended", () => this.events.onEnded(id));
        audio.addEventListener("error", (e) => this.events.onError(id, e));
    }

    public getActiveAudio(): HTMLAudioElement {
        return this.channels[this.activeChannelId];
    }

    public getActiveChannelId(): AudioChannel {
        return this.activeChannelId;
    }

    public getInactiveChannelId(): AudioChannel {
        return this.activeChannelId === 1 ? 2 : 1;
    }

    public play(song: Song) {
        const newChannelId = this.getInactiveChannelId();
        const newAudio = this.channels[newChannelId];
        const oldAudio = this.getActiveAudio();

        // Clear any existing fade on the new channel
        this.clearFade(newChannelId);

        // Setup new audio
        newAudio.src = song.toMediaUrl();
        newAudio.volume = 1.0;
        newAudio.currentTime = 0;
        newAudio.play().catch(e => this.events.onError(newChannelId, e));

        // Fade out old audio if it was playing
        if (!oldAudio.paused && !this.fadeIntervals[this.activeChannelId]) {
            this.startFadeOut(this.activeChannelId);
        }

        this.activeChannelId = newChannelId;
    }

    public pause() {
        const audio = this.getActiveAudio();
        if (audio && !audio.paused) {
            audio.pause();
        }
    }

    public stopWithFade(durationMs: number = FADE_DURATION_MS) {
        const id = this.activeChannelId;
        const audio = this.channels[id];

        if (audio && !audio.paused && !this.fadeIntervals[id]) {
            this.startFadeOut(id, durationMs);
        }
    }

    private startFadeOut(id: AudioChannel, durationMs: number = FADE_DURATION_MS) {
        const audio = this.channels[id];
        const steps = durationMs / FADE_STEP_INTERVAL_MS;
        const fadeStep = 1.0 / steps;

        this.fadeIntervals[id] = window.setInterval(() => {
            if (audio.volume > fadeStep) {
                audio.volume -= fadeStep;
            } else {
                this.clearFade(id);
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 1.0;
                this.events.onFadeFinished(id);
            }
        }, FADE_STEP_INTERVAL_MS);
    }

    private clearFade(id: AudioChannel) {
        if (this.fadeIntervals[id] !== null) {
            clearInterval(this.fadeIntervals[id]!);
            this.fadeIntervals[id] = null;
        }
    }

    public cleanup() {
        this.clearFade(1);
        this.clearFade(2);
        this.channels[1].pause();
        this.channels[2].pause();
        this.channels[1].src = "";
        this.channels[2].src = "";
    }
}
