package com.dcmusic.repository;

import com.dcmusic.entity.Playlist;
import com.dcmusic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByUser(User user);
}
