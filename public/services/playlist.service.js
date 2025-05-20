class PlaylistService {
  constructor() {
    this.baseUrl = '/api/playlists';
  }

  async getPlaylists() {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch playlists');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  async createPlaylist(name) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create playlist');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async addVideoToPlaylist(playlistId, video) {
    try {
      const response = await fetch(`${this.baseUrl}/${playlistId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(video)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add video to playlist');
      }
      return response.json();
    } catch (error) {
      console.error('Error adding video to playlist:', error);
      throw error;
    }
  }

  async removeVideoFromPlaylist(playlistId, videoId) {
    try {
      const response = await fetch(`${this.baseUrl}/${playlistId}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove video from playlist');
      }
      return response.json();
    } catch (error) {
      console.error('Error removing video from playlist:', error);
      throw error;
    }
  }

  async renamePlaylist(playlistId, name) {
    try {
      const response = await fetch(`${this.baseUrl}/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename playlist');
      }
      return response.json();
    } catch (error) {
      console.error('Error renaming playlist:', error);
      throw error;
    }
  }

  async moveVideo(playlistId, videoId, targetPlaylistId) {
    try {
      const response = await fetch(`${this.baseUrl}/${playlistId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ videoId, targetPlaylistId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move video');
      }
      return response.json();
    } catch (error) {
      console.error('Error moving video:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const playlistService = new PlaylistService();
module.exports = playlistService; 