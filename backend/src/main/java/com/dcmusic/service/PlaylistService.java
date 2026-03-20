package com.dcmusic.service;

import com.dcmusic.entity.Playlist;
import com.dcmusic.entity.Song;
import com.dcmusic.entity.User;
import com.dcmusic.repository.PlaylistRepository;
import com.dcmusic.repository.SongRepository;
import com.dcmusic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SongRepository songRepository;

    public Playlist createPlaylist(String name, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Playlist playlist = new Playlist();
        playlist.setName(name);
        playlist.setUser(user);
        return playlistRepository.save(playlist);
    }
    
    public Playlist addSongToPlaylist(Long playlistId, Long songId, String userEmail) {
        Playlist playlist = playlistRepository.findById(playlistId).orElseThrow();
        if (!playlist.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized to modify this playlist");
        }
        Song song = songRepository.findById(songId).orElseThrow();
        if (!playlist.getSongs().contains(song)) {
            playlist.getSongs().add(song);
        }
        return playlistRepository.save(playlist);
    }

    public Playlist removeSongFromPlaylist(Long playlistId, Long songId, String userEmail) {
        Playlist playlist = playlistRepository.findById(playlistId).orElseThrow();
        if (!playlist.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized to modify this playlist");
        }
        playlist.getSongs().removeIf(s -> s.getId().equals(songId));
        return playlistRepository.save(playlist);
    }

    public List<Playlist> getUserPlaylists(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return playlistRepository.findByUser(user);
    }

    public Playlist getPlaylistById(Long playlistId) {
        return playlistRepository.findById(playlistId).orElseThrow();
    }

    public void deletePlaylist(Long playlistId, String userEmail) {
        Playlist playlist = playlistRepository.findById(playlistId).orElseThrow();
        if (!playlist.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized to delete this playlist");
        }
        playlistRepository.delete(playlist);
    }
}
