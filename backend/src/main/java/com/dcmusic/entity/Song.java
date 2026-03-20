package com.dcmusic.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "songs")
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String artist;
    private String album;

    @Column(nullable = false)
    private String fileUrl;
    
    private String coverImage;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by")
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User uploadedBy;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;
    
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public enum Status {
        PENDING, APPROVED, REJECTED
    }

    public enum Visibility {
        PRIVATE, GLOBAL
    }
}
