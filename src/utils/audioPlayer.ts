/**
 * Hybrid Audio Player: Offline MP3 Playlist + Procedural Romantic Chimes Synthesizer
 * Provides an 8-track curated playlist with automatic fallback to Web Audio chimes.
 */

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  src: string;
  isProcedural?: boolean;
}

export const CURATED_PLAYLIST: TrackInfo[] = [
  {
    id: 'flower',
    title: 'Flower',
    artist: 'Johnny Stimson',
    src: '/audio/flower.mp3'
  },
  {
    id: 'wonderful-u',
    title: 'Wonderful U',
    artist: 'AGA',
    src: '/audio/wonderful-u.mp3'
  },
  {
    id: 'berlin',
    title: 'BERLIN',
    artist: 'Khoi Vu',
    src: '/audio/berlin.mp3'
  },
  {
    id: 'cho-trong-trang',
    title: 'Chờ trong trăng (Remix)',
    artist: 'Wren Evans x Htingale',
    src: '/audio/cho-trong-trang.mp3'
  },
  {
    id: 'nhe-buong',
    title: 'Nhẹ Buông (Remix)',
    artist: 'Hằng Ssi x AM',
    src: '/audio/nhe-buong.mp3'
  },
  {
    id: 'bien-dao-va-em',
    title: '[Mashup] Biển Đảo Và Em',
    artist: 'QuinVy Remix',
    src: '/audio/bien-dao-va-em.mp3'
  },
  {
    id: 'em-la',
    title: 'Em Là (Kirimi Remix)',
    artist: 'MONO',
    src: '/audio/em-la.mp3'
  },
  {
    id: 'tinh-yeu-mau-nang',
    title: 'Tình Yêu Màu Nắng',
    artist: 'MCK x Obito Beat',
    src: '/audio/tinh-yeu-mau-nang.mp3'
  },
  {
    id: 'music-box',
    title: 'Giai Điệu Hộp Nhạc (Chimes)',
    artist: 'Bản Không Lời',
    src: '',
    isProcedural: true
  }
];

export class RomanticAudioPlayer {
  private playlist: TrackInfo[] = CURATED_PLAYLIST;
  private currentTrackIndex: number = 0; // Starts with "Flower" (Index 0)
  private isPlayingState: boolean = false;
  private volume: number = 0.8;
  private usingFallback: boolean = false;

  // HTML5 Audio element for local MP3 playback
  private htmlAudio: HTMLAudioElement | null = null;

  // Web Audio API Procedural Synthesizer for chimes fallback
  private audioCtx: AudioContext | null = null;
  private chimeTimerId: number | null = null;
  private currentNoteIndex: number = 0;

  private stateListeners: Array<(playing: boolean, track: TrackInfo) => void> = [];
  private trackListeners: Array<(track: TrackInfo, index: number) => void> = [];

  // Romantic music box melody (D5, F#5, A5, D6, A4, C#5, E5, A5, ...)
  private readonly melody: number[] = [
    587.33, 739.99, 880.00, 1174.66,
    440.00, 554.37, 659.25, 880.00,
    493.88, 587.33, 739.99, 987.77,
    369.99, 440.00, 554.37, 739.99,
    392.00, 493.88, 587.33, 783.99,
    293.66, 369.99, 440.00, 587.33,
    392.00, 493.88, 587.33, 783.99,
    440.00, 554.37, 659.25, 880.00
  ];

  constructor() {
    this.initHtmlAudio();
  }

  private initHtmlAudio(): void {
    if (typeof window === 'undefined') return;

    this.htmlAudio = new Audio();
    this.htmlAudio.volume = this.volume;

    this.htmlAudio.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.htmlAudio.addEventListener('error', () => {
      // If MP3 file is not yet uploaded or unreadable, smoothly fall back to procedural chimes
      if (this.isPlayingState) {
        this.usingFallback = true;
        this.startProceduralChimes();
        this.notifyTrackListeners();
      }
    });
  }

  public getPlaylist(): TrackInfo[] {
    return this.playlist;
  }

  public getCurrentTrack(): TrackInfo {
    return this.playlist[this.currentTrackIndex];
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public isUsingFallback(): boolean {
    return this.usingFallback;
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  public toggle(): boolean {
    if (this.isPlayingState) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlayingState;
  }

  public play(): void {
    this.isPlayingState = true;
    this.playCurrentTrack();
    this.notifyStateListeners();
  }

  public pause(): void {
    this.isPlayingState = false;
    this.stopHtmlAudio();
    this.stopProceduralChimes();
    this.notifyStateListeners();
  }

  public nextTrack(): void {
    this.selectTrack((this.currentTrackIndex + 1) % this.playlist.length);
  }

  public prevTrack(): void {
    this.selectTrack((this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length);
  }

  public selectTrack(index: number): void {
    if (index < 0 || index >= this.playlist.length) return;
    this.currentTrackIndex = index;
    this.usingFallback = false;

    this.stopHtmlAudio();
    this.stopProceduralChimes();

    this.notifyTrackListeners();

    if (this.isPlayingState) {
      this.playCurrentTrack();
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0.0, Math.min(1.0, volume));
    if (this.htmlAudio) {
      this.htmlAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public onStateChange(callback: (playing: boolean, track: TrackInfo) => void): () => void {
    this.stateListeners.push(callback);
    return () => {
      this.stateListeners = this.stateListeners.filter(cb => cb !== callback);
    };
  }

  public onTrackChange(callback: (track: TrackInfo, index: number) => void): () => void {
    this.trackListeners.push(callback);
    return () => {
      this.trackListeners = this.trackListeners.filter(cb => cb !== callback);
    };
  }

  private notifyStateListeners(): void {
    const track = this.getCurrentTrack();
    for (const cb of this.stateListeners) {
      cb(this.isPlayingState, track);
    }
  }

  private notifyTrackListeners(): void {
    const track = this.getCurrentTrack();
    for (const cb of this.trackListeners) {
      cb(track, this.currentTrackIndex);
    }
  }

  private playCurrentTrack(): void {
    if (!this.isPlayingState) return;

    const track = this.getCurrentTrack();

    if (track.isProcedural) {
      this.stopHtmlAudio();
      this.usingFallback = false;
      this.startProceduralChimes();
      return;
    }

    if (!this.htmlAudio) {
      this.initHtmlAudio();
    }

    if (this.htmlAudio) {
      this.stopProceduralChimes();
      this.usingFallback = false;
      this.htmlAudio.src = track.src;
      this.htmlAudio.volume = this.volume;
      this.htmlAudio.play().then(() => {
        this.isPlayingState = true;
        this.notifyStateListeners();
      }).catch((err: any) => {
        if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
          // Browser autoplay restriction: keep state ready, await user interaction
          this.isPlayingState = false;
          this.notifyStateListeners();
          return;
        }
        // Fall back gracefully if file not found or corrupted
        this.usingFallback = true;
        this.startProceduralChimes();
        this.notifyTrackListeners();
      });
    } else {
      this.startProceduralChimes();
    }
  }

  private stopHtmlAudio(): void {
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
  }

  // --- Procedural Chimes Synthesizer Logic ---

  private startProceduralChimes(): void {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.chimeTimerId === null) {
      this.scheduleNextChimeNote();
    }
  }

  private stopProceduralChimes(): void {
    if (this.chimeTimerId !== null) {
      window.clearTimeout(this.chimeTimerId);
      this.chimeTimerId = null;
    }
  }

  private scheduleNextChimeNote(): void {
    if (!this.isPlayingState) return;

    const freq = this.melody[this.currentNoteIndex];
    this.playChime(freq);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;

    this.chimeTimerId = window.setTimeout(() => {
      this.scheduleNextChimeNote();
    }, 340);
  }

  private playChime(frequency: number): void {
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const baseGain = 0.18 * this.volume;

    // Primary fundamental tone (sine)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(baseGain, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc1.connect(gain1);
    gain1.connect(this.audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 1.7);

    // Harmonic overtone chime (triangle, 2x freq)
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2.0, now);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(baseGain * 0.28, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc2.connect(gain2);
    gain2.connect(this.audioCtx.destination);
    osc2.start(now);
    osc2.stop(now + 0.85);
  }
}
