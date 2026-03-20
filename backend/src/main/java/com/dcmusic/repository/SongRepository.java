package com.dcmusic.repository;

import com.dcmusic.entity.Song;
import com.dcmusic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SongRepository extends JpaRepository<Song, Long> {
    List<Song> findByVisibility(Song.Visibility visibility);
    List<Song> findByUploadedBy(User uploadedBy);
    List<Song> findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCase(String title, String artist);
}
