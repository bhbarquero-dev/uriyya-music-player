import { Song } from "./Song";
import type { AudioChannel, AudioManagerEvents } from "./AudioManager";

export const FADE_DURATION_MS = 6000;
const FADE_STEP_INTERVAL_MS = 100;

export class Channel {
    private audio: HTMLAudioElement;
    private fadeInterval: number | null = null;
    private id: AudioChannel;
    private events: AudioManagerEvents;
    private boundHandlers: {
        ended: () => void;
        error: (e: Event) => void;
    };

    constructor(id: AudioChannel, events: AudioManagerEvents) {
        this.id = id;
        this.events = events;
        this.audio = new Audio();
        
        // Store bound handlers so they can be removed later
        this.boundHandlers = {
            ended: () => this.events.onEnded(this.id),
            error: (e: Event) => this.events.onError(this.id, e)
        };
        
        this.setupListeners();
    }

    private setupListeners() {
        this.audio.addEventListener("ended", this.boundHandlers.ended);
        this.audio.addEventListener("error", this.boundHandlers.error);
    }

    public play(song: Song): void {
        this.clearFade();
        
        this.audio.src = song.toMediaUrl();
        this.audio.volume = 1.0;
        this.audio.currentTime = 0;
        this.audio.play().catch(e => this.events.onError(this.id, e));
    }

    public pause(): void {
        if (!this.audio.paused) {
            this.audio.pause();
        }
    }

    public startFadeOut(durationMs: number = FADE_DURATION_MS, onComplete?: () => void): void {
        if (this.fadeInterval !== null) {
            return; // Fade already in progress
        }

        // Validate duration - non-positive values should pause immediately
        if (durationMs <= 0) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio.volume = 1.0;
            this.events.onFadeFinished(this.id);
            onComplete?.();
            return;
        }

        const steps = durationMs / FADE_STEP_INTERVAL_MS;
        const fadeStep = 1.0 / steps;

        this.fadeInterval = window.setInterval(() => {
            if (this.audio.volume > fadeStep) {
                this.audio.volume -= fadeStep;
            } else {
                this.clearFade();
                this.audio.pause();
                this.audio.currentTime = 0;
                this.audio.volume = 1.0;
                this.events.onFadeFinished(this.id);
                onComplete?.();
            }
        }, FADE_STEP_INTERVAL_MS);
    }

    public clearFade(): void {
        if (this.fadeInterval !== null) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
    }

    public getAudioElement(): HTMLAudioElement {
        return this.audio;
    }

    public getId(): AudioChannel {
        return this.id;
    }

    public cleanup(): void {
        this.clearFade();
        this.audio.pause();
        this.audio.src = "";
        
        // Remove event listeners to prevent memory leaks
        this.audio.removeEventListener("ended", this.boundHandlers.ended);
        this.audio.removeEventListener("error", this.boundHandlers.error);
    }
}
