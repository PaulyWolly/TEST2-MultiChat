const playlistService = require('../services/playlist.service.js');

class PlaylistManager {
  constructor() {
    this.dialog = null;
    this.currentVideo = null;
    this.playlists = [];
    this.selectedPlaylistId = null;
    this.init();
  }

  async init() {
    // Create dialog element
    this.dialog = document.createElement('div');
    this.dialog.className = 'playlist-manager-dialog';
    this.dialog.innerHTML = `
      <div class="playlist-manager-content">
        <div class="playlist-manager-header">
          <h2>Playlist Manager</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="playlist-manager-body">
          <div class="playlist-list">
            <div class="playlist-actions">
              <input type="text" class="new-playlist-input" placeholder="New playlist name">
              <button class="create-playlist-btn">Create Playlist</button>
            </div>
            <div class="playlists-container"></div>
          </div>
          <div class="playlist-content">
            <div class="current-playlist-header">
              <h3 class="current-playlist-name">Select a playlist</h3>
              <div class="playlist-actions">
                <input type="text" class="rename-playlist-input" placeholder="New name">
                <button class="rename-playlist-btn">Rename</button>
              </div>
            </div>
            <div class="videos-container"></div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .playlist-manager-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .playlist-manager-content {
        background: white;
        border-radius: 8px;
        width: 80%;
        max-width: 1200px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
      }

      .playlist-manager-header {
        padding: 16px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .playlist-manager-body {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .playlist-list {
        width: 300px;
        border-right: 1px solid #eee;
        padding: 16px;
        display: flex;
        flex-direction: column;
      }

      .playlist-content {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
      }

      .playlist-actions {
        margin-bottom: 16px;
      }

      .playlist-item {
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;
      }

      .playlist-item:hover {
        background: #f5f5f5;
      }

      .playlist-item.active {
        background: #e3f2fd;
      }

      .video-item {
        display: flex;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid #eee;
      }

      .video-thumbnail {
        width: 120px;
        margin-right: 16px;
      }

      .video-info {
        flex: 1;
      }

      .video-actions {
        display: flex;
        gap: 8px;
      }

      button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: #2196f3;
        color: white;
        cursor: pointer;
      }

      button:hover {
        background: #1976d2;
      }

      input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-right: 8px;
      }

      .error-message {
        color: #f44336;
        margin: 8px 0;
        padding: 8px;
        background: #ffebee;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    this.dialog.querySelector('.close-btn').addEventListener('click', () => this.hide());
    this.dialog.querySelector('.create-playlist-btn').addEventListener('click', () => this.createPlaylist());
    this.dialog.querySelector('.rename-playlist-btn').addEventListener('click', () => this.renamePlaylist());

    // Add to DOM
    document.body.appendChild(this.dialog);
  }

  async show(video) {
    this.currentVideo = video;
    try {
      await this.loadPlaylists();
      this.dialog.style.display = 'flex';
    } catch (error) {
      this.showError('Failed to load playlists. Please try again.');
    }
  }

  hide() {
    this.dialog.style.display = 'none';
    this.currentVideo = null;
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    this.dialog.querySelector('.playlist-manager-content').insertBefore(
      errorDiv,
      this.dialog.querySelector('.playlist-manager-body')
    );
    setTimeout(() => errorDiv.remove(), 5000);
  }

  async loadPlaylists() {
    try {
      const response = await playlistService.getPlaylists();
      this.playlists = response.playlists;
      this.renderPlaylists();
    } catch (error) {
      console.error('Failed to load playlists:', error);
      throw error;
    }
  }

  renderPlaylists() {
    const container = this.dialog.querySelector('.playlists-container');
    container.innerHTML = this.playlists.map(playlist => `
      <div class="playlist-item ${playlist._id === this.selectedPlaylistId ? 'active' : ''}" 
           data-id="${playlist._id}">
        ${playlist.name} (${playlist.videos.length})
      </div>
    `).join('');

    container.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => this.selectPlaylist(item.dataset.id));
    });
  }

  async selectPlaylist(playlistId) {
    this.selectedPlaylistId = playlistId;
    const playlist = this.playlists.find(p => p._id === playlistId);
    if (playlist) {
      this.dialog.querySelector('.current-playlist-name').textContent = playlist.name;
      this.renderVideos(playlist.videos);
    }
    this.renderPlaylists();
  }

  renderVideos(videos) {
    const container = this.dialog.querySelector('.videos-container');
    container.innerHTML = videos.map(video => `
      <div class="video-item">
        <img class="video-thumbnail" src="${video.thumbnail}" alt="${video.title}">
        <div class="video-info">
          <div class="video-title">${video.title}</div>
        </div>
        <div class="video-actions">
          <button class="remove-video-btn" data-id="${video.videoId}">Remove</button>
          <select class="move-to-playlist">
            <option value="">Move to...</option>
            ${this.playlists
              .filter(p => p._id !== this.selectedPlaylistId)
              .map(p => `<option value="${p._id}">${p.name}</option>`)
              .join('')}
          </select>
        </div>
      </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.remove-video-btn').forEach(btn => {
      btn.addEventListener('click', () => this.removeVideo(btn.dataset.id));
    });

    container.querySelectorAll('.move-to-playlist').forEach(select => {
      select.addEventListener('change', (e) => {
        if (e.target.value) {
          this.moveVideo(select.closest('.video-item').querySelector('.remove-video-btn').dataset.id, e.target.value);
          e.target.value = '';
        }
      });
    });
  }

  async createPlaylist() {
    const input = this.dialog.querySelector('.new-playlist-input');
    const name = input.value.trim();
    if (!name) return;

    try {
      await playlistService.createPlaylist(name);
      input.value = '';
      await this.loadPlaylists();
    } catch (error) {
      this.showError('Failed to create playlist. Please try again.');
    }
  }

  async renamePlaylist() {
    if (!this.selectedPlaylistId) return;
    const input = this.dialog.querySelector('.rename-playlist-input');
    const name = input.value.trim();
    if (!name) return;

    try {
      await playlistService.renamePlaylist(this.selectedPlaylistId, name);
      input.value = '';
      await this.loadPlaylists();
    } catch (error) {
      this.showError('Failed to rename playlist. Please try again.');
    }
  }

  async removeVideo(videoId) {
    if (!this.selectedPlaylistId) return;

    try {
      await playlistService.removeVideoFromPlaylist(this.selectedPlaylistId, videoId);
      await this.loadPlaylists();
    } catch (error) {
      this.showError('Failed to remove video. Please try again.');
    }
  }

  async moveVideo(videoId, targetPlaylistId) {
    if (!this.selectedPlaylistId) return;

    try {
      await playlistService.moveVideo(this.selectedPlaylistId, videoId, targetPlaylistId);
      await this.loadPlaylists();
    } catch (error) {
      this.showError('Failed to move video. Please try again.');
    }
  }
}

// Create and export a singleton instance
const playlistManager = new PlaylistManager();
module.exports = playlistManager; 