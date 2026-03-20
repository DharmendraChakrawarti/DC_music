package com.dcmusic.controller;

import com.dcmusic.entity.Song;
import com.dcmusic.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    @Autowired
    private SongService songService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadSong(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value="artist", required=false) String artist,
            @RequestParam(value="album", required=false) String album) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            Song song = songService.uploadSong(file, title, artist, album, email, isAdmin);
            return ResponseEntity.ok(song);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/upload-bulk")
    public ResponseEntity<?> uploadBulkSongs(
            @RequestParam("files") MultipartFile[] files) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            int count = 0;
            for(MultipartFile file : files) {
                String title = file.getOriginalFilename();
                if(title != null && title.contains(".")) {
                    title = title.substring(0, title.lastIndexOf("."));
                }
                songService.uploadSong(file, title, "Unknown Artist", "Unknown Album", email, isAdmin);
                count++;
            }
            return ResponseEntity.ok("Successfully uploaded " + count + " songs.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/global")
    public ResponseEntity<List<Song>> getGlobalSongs() {
        return ResponseEntity.ok(songService.getAllGlobalSongs());
    }

    @GetMapping("/my-songs")
    public ResponseEntity<List<Song>> getMySongs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(songService.getUserSongs(auth.getName()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Song>> searchSongs(@RequestParam("q") String query) {
        return ResponseEntity.ok(songService.searchSongs(query));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSong(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            songService.deleteSong(id, auth.getName(), isAdmin);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/stream/{fileName:.+}")
    public ResponseEntity<Resource> streamAudio(@PathVariable String fileName) {
        try {
            Resource resource = songService.loadSongAsResource(fileName);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
