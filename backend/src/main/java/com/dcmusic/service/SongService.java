package com.dcmusic.service;

import com.dcmusic.entity.Song;
import com.dcmusic.entity.User;
import com.dcmusic.repository.SongRepository;
import com.dcmusic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class SongService {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${upload.dir}")
    private String uploadDir;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!");
        }
    }

    public Song uploadSong(MultipartFile file, String title, String artist, String album, String userEmail, boolean isAdmin) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName = UUID.randomUUID().toString() + "_" + originalFilename;
        Path targetLocation = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Song song = new Song();
        song.setTitle(title);
        song.setArtist(artist != null ? artist : "Unknown Artist");
        song.setAlbum(album != null ? album : "Unknown Album");
        song.setFileUrl(fileName);
        song.setUploadedBy(user);
        
        if (isAdmin) {
            song.setStatus(Song.Status.APPROVED);
            song.setVisibility(Song.Visibility.GLOBAL);
        } else {
            song.setStatus(Song.Status.PENDING);
            song.setVisibility(Song.Visibility.PRIVATE);
        }
        
        return songRepository.save(song);
    }
    
    public List<Song> getAllGlobalSongs() {
        return songRepository.findByVisibility(Song.Visibility.GLOBAL);
    }
    
    public List<Song> getUserSongs(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return songRepository.findByUploadedBy(user);
    }
    
    public List<Song> getAllSongsAdmin() {
        return songRepository.findAll();
    }

    public List<Song> searchSongs(String query) {
        return songRepository.findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCase(query, query);
    }
    
    public Song approveSong(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found"));
        song.setStatus(Song.Status.APPROVED);
        song.setVisibility(Song.Visibility.GLOBAL);
        return songRepository.save(song);
    }
    
    public void deleteSong(Long songId, String userEmail, boolean isAdmin) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found"));
        if (isAdmin || song.getUploadedBy().getEmail().equals(userEmail)) {
            try {
                Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(song.getFileUrl());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                 e.printStackTrace();
            }
            songRepository.delete(song);
        } else {
            throw new RuntimeException("Not authorized to delete this song");
        }
    }
    
    public Resource loadSongAsResource(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }
}
