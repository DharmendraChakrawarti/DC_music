package com.dcmusic.controller;

import com.dcmusic.entity.Song;
import com.dcmusic.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private SongService songService;

    @GetMapping("/songs")
    public ResponseEntity<List<Song>> getAllSongs() {
        return ResponseEntity.ok(songService.getAllSongsAdmin());
    }

    @PostMapping("/songs/{id}/approve")
    public ResponseEntity<Song> approveSong(@PathVariable Long id) {
        return ResponseEntity.ok(songService.approveSong(id));
    }
}
