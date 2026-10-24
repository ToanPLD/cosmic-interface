import * as THREE from 'three';
import { SceneManager } from '../core/SceneManager';
import { RomanticAudioPlayer, TrackInfo } from '../utils/audioPlayer';

/**
 * Romantic Minimalist Glassmorphic UI Overlay for 20/10 Gift Presentation
 * Clean presentation focused entirely on the 3D bouquet with header controls and letter modal.
 */
export class GiftUIOverlay {
  private sceneManager: SceneManager;
  private audioPlayer: RomanticAudioPlayer;
  private container: HTMLElement;

  private musicBtn!: HTMLButtonElement;
  private playlistBtn!: HTMLButtonElement;
  private openLetterBtn!: HTMLButtonElement;
  private musicTrackTitle!: HTMLElement;
  private musicTrackArtist!: HTMLElement;

  private letterModal!: HTMLElement;
  private playlistModal!: HTMLElement;
  private playlistPlayBtn!: HTMLButtonElement;
  private hoverTooltip!: HTMLElement;
  private trackItemElements: HTMLElement[] = [];

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
    this.audioPlayer = new RomanticAudioPlayer();
    (window as any).__audioPlayer = this.audioPlayer;

    this.container = document.createElement('div');
    this.container.id = 'gift-ui-root';
    this.container.className = 'gift-ui-container';
    document.body.appendChild(this.container);

    this.buildHeader();
    this.buildLetterModal();
    this.buildPlaylistModal();
    this.buildHoverTooltip();
    this.bindEvents();
    this.setupAutoplay();
  }

  /**
   * Top Floating Glassmorphic Header
   */
  private buildHeader(): void {
    const header = document.createElement('header');
    header.className = 'gift-header glass-card ui-interactive';

    const currentTrack = this.audioPlayer.getCurrentTrack();

    header.innerHTML = `
      <div class="header-left">
        <div class="rose-icon-badge">🌹</div>
        <div class="header-titles">
          <div class="header-badge-row">
            <span class="edition-badge">20 · 10 Edition</span>
            <span class="edition-sub">Quà Tặng Tri Ân</span>
          </div>
          <h1 class="header-main-title">Chúc Mừng Ngày Phụ Nữ Việt Nam</h1>
        </div>
      </div>
      <div class="header-right header-music-cluster">
        <button id="btn-open-letter" class="action-btn glass-pill ui-interactive header-letter-pill" title="Mở bức thư chúc mừng 20/10">
          <span class="action-icon">💌</span>
          <span class="action-text">Mở Thiệp</span>
        </button>
        <button id="btn-music" class="music-toggle-btn ui-interactive" title="Bật/Tắt phát nhạc">
          <span class="music-icon">🎵</span>
          <div class="audio-wave-bars">
            <span class="wave-bar bar-1"></span>
            <span class="wave-bar bar-2"></span>
            <span class="wave-bar bar-3"></span>
            <span class="wave-bar bar-4"></span>
          </div>
          <div class="music-info-text">
            <span id="music-track-title" class="music-track-title">${currentTrack.title}</span>
            <span id="music-track-artist" class="music-track-artist">${currentTrack.artist}</span>
          </div>
        </button>
        <button id="btn-open-playlist" class="playlist-toggle-btn ui-interactive" title="Danh sách bài hát">
          <span class="playlist-icon">☰</span>
        </button>
      </div>
    `;

    this.container.appendChild(header);
    this.openLetterBtn = header.querySelector('#btn-open-letter') as HTMLButtonElement;
    this.musicBtn = header.querySelector('#btn-music') as HTMLButtonElement;
    this.playlistBtn = header.querySelector('#btn-open-playlist') as HTMLButtonElement;
    this.musicTrackTitle = header.querySelector('#music-track-title') as HTMLElement;
    this.musicTrackArtist = header.querySelector('#music-track-artist') as HTMLElement;
  }

  /**
   * Interactive Letter Modal (Greeting Message)
   */
  private buildLetterModal(): void {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'gift-letter-modal';
    modalBackdrop.className = 'gift-modal-backdrop hidden ui-interactive';

    modalBackdrop.innerHTML = `
      <div class="letter-card-container">
        <button id="btn-close-letter" class="letter-close-btn ui-interactive">✕</button>

        <div class="letter-envelope-header">
          <div class="wax-seal">20·11</div>
          <div class="letter-pre-title">THIỆP CHÚC MỪNG YÊU THƯƠNG</div>
          <h2 class="letter-title">Gửi Những Cô Gái Tuyệt Vời 🌷</h2>
        </div>

        <div class="letter-body">
          <p class="letter-greeting">20/11, chúc tất cả những cô gái một ngày thật vui.</p>
          <p class="letter-paragraph">
            Không cần phải lúc nào cũng xinh đẹp, cũng mạnh mẽ hay lúc nào cũng phải tỏ ra ổn.
          </p>
          <p class="letter-paragraph">
            Mong các bạn có thể sống đúng với con người mình, vui thì cứ cười, mệt thì cứ nghỉ, buồn thì cứ cho phép mình buồn. Không cần phải cố gắng trở thành một người khác chỉ để được ai đó yêu quý.
          </p>
          <p class="letter-paragraph">
            Mong những điều các bạn âm thầm cố gắng sẽ có ngày được nhìn thấy.<br />
            Những điều các bạn chịu đựng sẽ có người thấu hiểu.<br />
            Và những lần các bạn lựa chọn tử tế, dù chẳng ai biết, vẫn sẽ được cuộc đời đối xử tử tế lại.
          </p>
          <p class="letter-paragraph">
            Có thể hôm nay chỉ là một ngày bình thường với nhiều người.<br />
            Nhưng nếu bạn đọc được những dòng này, thì hãy nhớ rằng:<br />
            <span class="letter-highlight">Bạn không cần phải trở nên đặc biệt mới xứng đáng được trân trọng. Cứ là bạn thôi.</span>
          </p>
          <p class="letter-paragraph">
            Chúc những cô gái đang vui sẽ tiếp tục vui.<br />
            Những cô gái đang mệt sẽ sớm tìm được một nơi để bình yên.<br />
            Và những cô gái đang chờ một điều tốt đẹp…<br />
            Mong điều tốt đẹp ấy cũng đang trên đường tìm đến bạn.
          </p>
          <div class="letter-signature">
            <div class="sig-note">Với tất cả sự dịu dàng & trân quý,</div>
            <div class="sig-name">Chúc mừng 20/11 🌷</div>
          </div>
        </div>

        <div class="letter-footer">
          <button id="btn-letter-ok" class="letter-ack-btn ui-interactive">Cảm Ơn Món Quà ✨</button>
        </div>
      </div>
    `;

    this.container.appendChild(modalBackdrop);
    this.letterModal = modalBackdrop;
  }

  /**
   * Glassmorphic Music Playlist Drawer Modal
   */
  private buildPlaylistModal(): void {
    const playlistBackdrop = document.createElement('div');
    playlistBackdrop.id = 'gift-playlist-modal';
    playlistBackdrop.className = 'gift-playlist-modal hidden ui-interactive';

    const playlist = this.audioPlayer.getPlaylist();
    const currentIndex = this.audioPlayer.getCurrentTrackIndex();

    let trackListHtml = '';
    playlist.forEach((track, idx) => {
      const isActive = idx === currentIndex;
      const numStr = (idx + 1).toString().padStart(2, '0');
      let tagHtml = '';
      if (idx === 0) {
        tagHtml = `<span class="track-tag">Mặc định</span>`;
      } else if (track.isProcedural) {
        tagHtml = `<span class="track-tag">Hộp nhạc</span>`;
      }

      trackListHtml += `
        <div class="track-item ${isActive ? 'active' : ''} ui-interactive" data-track-index="${idx}">
          <div class="track-left">
            <span class="track-num">${numStr}</span>
            <span class="track-play-indicator">${isActive ? '▶' : '•'}</span>
            <div class="track-meta">
              <span class="track-name">${track.title}</span>
              <span class="track-author">${track.artist}</span>
            </div>
          </div>
          <div class="track-right">
            ${tagHtml}
          </div>
        </div>
      `;
    });

    playlistBackdrop.innerHTML = `
      <div class="playlist-panel ui-interactive">
        <div class="playlist-header">
          <div class="playlist-header-title">
            <span class="playlist-badge">DANH SÁCH BÀI HÁT</span>
            <h3>Giai Điệu 20/10 Yêu Thương</h3>
          </div>
          <button id="btn-close-playlist" class="playlist-close-btn ui-interactive" title="Đóng danh sách">✕</button>
        </div>

        <!-- Quick Controls -->
        <div class="playlist-quick-controls">
          <div class="playlist-ctrl-group">
            <button id="btn-playlist-prev" class="playlist-ctrl-btn ui-interactive" title="Bài trước">⏮</button>
            <button id="btn-playlist-play" class="playlist-ctrl-btn play-btn ui-interactive" title="Phát / Tạm dừng">▶</button>
            <button id="btn-playlist-next" class="playlist-ctrl-btn ui-interactive" title="Bài kế tiếp">⏭</button>
          </div>
          <div class="playlist-volume-row">
            <span class="vol-icon">🔊</span>
            <input type="range" id="playlist-volume-slider" min="0" max="1" step="0.05" value="${this.audioPlayer.getVolume()}" class="volume-slider ui-interactive" title="Âm lượng" />
          </div>
        </div>

        <!-- Tracks list -->
        <div class="playlist-track-list">
          ${trackListHtml}
        </div>

        <div class="playlist-footer-hint">
          <span>💡</span>
          <div>Nhạc phát từ file MP3 trong <code>public/audio/</code>. Nếu file chưa có sẵn, hệ thống tự động phát giai điệu Hộp nhạc pha lê lãng mạn.</div>
        </div>
      </div>
    `;

    this.container.appendChild(playlistBackdrop);
    this.playlistModal = playlistBackdrop;
    this.playlistPlayBtn = playlistBackdrop.querySelector('#btn-playlist-play') as HTMLButtonElement;
    this.trackItemElements = Array.from(playlistBackdrop.querySelectorAll('.track-item'));
  }

  /**
   * Bind DOM interactions
   */
  private bindEvents(): void {
    // 1. Audio toggle in header
    this.musicBtn.addEventListener('click', () => {
      const isPlaying = this.audioPlayer.toggle();
      this.updateMusicUI(isPlaying, this.audioPlayer.getCurrentTrack());
    });

    // 2. Open Playlist Drawer
    this.playlistBtn.addEventListener('click', () => {
      this.playlistModal.classList.remove('hidden');
    });

    // Close Playlist Drawer
    const closePlaylistBtn = this.playlistModal.querySelector('#btn-close-playlist') as HTMLButtonElement;
    closePlaylistBtn?.addEventListener('click', () => {
      this.playlistModal.classList.add('hidden');
    });

    this.playlistModal.addEventListener('click', (e) => {
      if (e.target === this.playlistModal) {
        this.playlistModal.classList.add('hidden');
      }
    });

    // Playlist Quick Controls
    this.playlistPlayBtn.addEventListener('click', () => {
      const isPlaying = this.audioPlayer.toggle();
      this.updateMusicUI(isPlaying, this.audioPlayer.getCurrentTrack());
    });

    const prevBtn = this.playlistModal.querySelector('#btn-playlist-prev') as HTMLButtonElement;
    prevBtn?.addEventListener('click', () => {
      this.audioPlayer.prevTrack();
    });

    const nextBtn = this.playlistModal.querySelector('#btn-playlist-next') as HTMLButtonElement;
    nextBtn?.addEventListener('click', () => {
      this.audioPlayer.nextTrack();
    });

    const volumeSlider = this.playlistModal.querySelector('#playlist-volume-slider') as HTMLInputElement;
    volumeSlider?.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.audioPlayer.setVolume(val);
    });

    // Track item selection
    this.trackItemElements.forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.trackIndex || '0', 10);
        this.audioPlayer.selectTrack(idx);
        this.audioPlayer.play();
      });
    });

    // Audio Player Listeners
    this.audioPlayer.onStateChange((playing, track) => {
      this.updateMusicUI(playing, track);
    });

    this.audioPlayer.onTrackChange((track, index) => {
      this.updateTrackUI(track, index);
    });

    // Listen to SceneManager 3D card opening callback
    this.sceneManager.setOnCardOpenModal(() => {
      this.showLetterModal();
    });

    // 3. Open Letter Modal from Header Pill (triggers 3D card animation)
    this.openLetterBtn.addEventListener('click', () => {
      this.sceneManager.openGreetingCard(() => {
        this.showLetterModal();
      });
    });

    const closeLetterBtn = this.container.querySelector('#btn-close-letter') as HTMLButtonElement;
    closeLetterBtn?.addEventListener('click', () => {
      this.hideLetterModal();
    });

    const okLetterBtn = this.container.querySelector('#btn-letter-ok') as HTMLButtonElement;
    okLetterBtn?.addEventListener('click', () => {
      this.hideLetterModal();
    });

    this.letterModal.addEventListener('click', (e) => {
      if (e.target === this.letterModal) {
        this.hideLetterModal();
      }
    });
  }

  public showLetterModal(): void {
    if (this.hoverTooltip) this.hoverTooltip.classList.add('hidden');
    this.letterModal.classList.remove('hidden', 'closing');
    this.sceneManager.setModalOpen(true);
  }

  public hideLetterModal(): void {
    this.letterModal.classList.add('closing');
    setTimeout(() => {
      this.letterModal.classList.add('hidden');
      this.letterModal.classList.remove('closing');
    }, 320);
    this.sceneManager.setModalOpen(false);
    this.sceneManager.closeGreetingCard();
  }

  private buildHoverTooltip(): void {
    const tooltip = document.createElement('div');
    tooltip.id = 'card-hover-tooltip';
    tooltip.className = 'card-hover-tooltip hidden';
    tooltip.innerHTML = `
      <span class="tooltip-icon">💌</span>
      <span class="tooltip-text">Chạm bức thư để mở</span>
    `;
    this.container.appendChild(tooltip);
    this.hoverTooltip = tooltip;

    this.sceneManager.onCardHover((isHovered) => {
      if (isHovered && this.letterModal.classList.contains('hidden')) {
        this.hoverTooltip.classList.remove('hidden');
      } else {
        this.hoverTooltip.classList.add('hidden');
      }
    });
  }

  private updateMusicUI(isPlaying: boolean, track: TrackInfo): void {
    const waveBars = this.musicBtn.querySelectorAll('.wave-bar');
    if (isPlaying) {
      this.musicBtn.classList.add('playing');
      waveBars.forEach((bar) => bar.classList.add('animate-wave'));
      this.playlistPlayBtn.innerText = '⏸';
      this.playlistPlayBtn.title = 'Tạm dừng';
    } else {
      this.musicBtn.classList.remove('playing');
      waveBars.forEach((bar) => bar.classList.remove('animate-wave'));
      this.playlistPlayBtn.innerText = '▶';
      this.playlistPlayBtn.title = 'Tiếp tục phát';
    }

    if (this.musicTrackTitle && this.musicTrackArtist) {
      this.musicTrackTitle.innerText = track.title;
      this.musicTrackArtist.innerText = track.artist;
    }
  }

  private updateTrackUI(track: TrackInfo, activeIndex: number): void {
    if (this.musicTrackTitle && this.musicTrackArtist) {
      this.musicTrackTitle.innerText = track.title;
      this.musicTrackArtist.innerText = track.artist;
    }

    this.trackItemElements.forEach((item, idx) => {
      const indicator = item.querySelector('.track-play-indicator') as HTMLElement;
      if (idx === activeIndex) {
        item.classList.add('active');
        if (indicator) indicator.innerText = '▶';
      } else {
        item.classList.remove('active');
        if (indicator) indicator.innerText = '•';
      }
    });
  }

  /**
   * Sets up seamless audio autoplay with fallback to first user interaction
   */
  private setupAutoplay(): void {
    // 1. Attempt immediate playback upon loading
    this.audioPlayer.play();

    // 2. If the browser blocks unmuted audio before user interaction,
    // trigger playback automatically on the recipient's very first interaction anywhere on screen.
    const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'wheel'];
    const unlockAudio = () => {
      if (!this.audioPlayer.isPlaying()) {
        this.audioPlayer.play();
      }
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, unlockAudio);
      });
    };

    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, unlockAudio, { passive: true });
    });
  }
}
