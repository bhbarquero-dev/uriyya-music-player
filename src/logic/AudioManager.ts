import { Song } from "./Song";
import { Channel, FADE_DURATION_MS } from "./Channel";

export type AudioChannel = 1 | 2;

export interface AudioManagerEvents {
    onEnded: (channelId: AudioChannel) => void;
    onError: (channelId: AudioChannel, error: any) => void;
    onFadeFinished: (channelId: AudioChannel) => void;
}

export class AudioManager {
    private channel1: Channel;
    private channel2: Channel;
    private activeChannelId: AudioChannel = 1;

    constructor(events: AudioManagerEvents, channel1?: Channel, channel2?: Channel) {
        this.channel1 = channel1 ?? new Channel(1, events);
        this.channel2 = channel2 ?? new Channel(2, events);
    }

    private getActiveChannel(): Channel {
        return this.activeChannelId === 1 ? this.channel1 : this.channel2;
    }

    private getInactiveChannel(): Channel {
        return this.activeChannelId === 1 ? this.channel2 : this.channel1;
    }

    public getActiveAudio(): HTMLAudioElement {
        return this.getActiveChannel().getAudioElement();
    }

    public getActiveChannelId(): AudioChannel {
        return this.activeChannelId;
    }

    public play(song: Song) {
        const newChannel = this.getInactiveChannel();
        const oldChannel = this.getActiveChannel();

        // Setup and play on new channel
        newChannel.play(song);

        // Fade out old channel if it was playing
        const oldAudio = oldChannel.getAudioElement();
        if (!oldAudio.paused) {
            oldChannel.startFadeOut();
        }

        this.activeChannelId = newChannel.getId();
    }

    public pause() {
        this.getActiveChannel().pause();
    }

    public stopWithFade(durationMs: number = FADE_DURATION_MS) {
        const activeChannel = this.getActiveChannel();
        const audio = activeChannel.getAudioElement();

        if (!audio.paused) {
            activeChannel.startFadeOut(durationMs);
        }
    }

    public seek(time: number) {
        this.getActiveChannel().getAudioElement().currentTime = time;
    }

    public cleanup() {
        this.channel1.cleanup();
        this.channel2.cleanup();
    }
}
