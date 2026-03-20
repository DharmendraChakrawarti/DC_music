package com.dcmusic.controller;

import com.dcmusic.entity.Playlist;
import com.dcmusic.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @PostMapping
    public ResponseEntity<?> createPlaylist(@RequestParam String name) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return ResponseEntity.ok(playlistService.createPlaylist(name, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{playlistId}/add/{songId}")
    public ResponseEntity<?> addSong(@PathVariable Long playlistId, @PathVariable Long songId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return ResponseEntity.ok(playlistService.addSongToPlaylist(playlistId, songId, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{playlistId}/remove/{songId}")
    public ResponseEntity<?> removeSong(@PathVariable Long playlistId, @PathVariable Long songId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return ResponseEntity.ok(playlistService.removeSongFromPlaylist(playlistId, songId, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Playlist>> getMyPlaylists() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(playlistService.getUserPlaylists(auth.getName()));
    }

    @GetMapping("/{playlistId}")
    public ResponseEntity<?> getPlaylist(@PathVariable Long playlistId) {
        try {
            return ResponseEntity.ok(playlistService.getPlaylistById(playlistId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{playlistId}")
    public ResponseEntity<?> deletePlaylist(@PathVariable Long playlistId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            playlistService.deletePlaylist(playlistId, auth.getName());
            return ResponseEntity.ok("Playlist deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
