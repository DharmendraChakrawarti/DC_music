-- Database: `dcmusic`

CREATE DATABASE IF NOT EXISTS `dcmusic`;
USE `dcmusic`;

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `songs`
CREATE TABLE `songs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `album` varchar(255) DEFAULT NULL,
  `artist` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) NOT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  `visibility` enum('GLOBAL','PRIVATE') DEFAULT NULL,
  `uploaded_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKq0t20x6j15q3q7b2643a6ndk4` (`uploaded_by`),
  CONSTRAINT `FKq0t20x6j15q3q7b2643a6ndk4` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `playlists`
CREATE TABLE `playlists` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhq3hicxy90g3dweudwvy1l0na` (`user_id`),
  CONSTRAINT `FKhq3hicxy90g3dweudwvy1l0na` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `playlist_songs`
CREATE TABLE `playlist_songs` (
  `playlist_id` bigint NOT NULL,
  `song_id` bigint NOT NULL,
  PRIMARY KEY (`playlist_id`,`song_id`),
  KEY `FKmrp6wve6goxokr0ty27qgwwc8` (`song_id`),
  CONSTRAINT `FKmrp6wve6goxokr0ty27qgwwc8` FOREIGN KEY (`song_id`) REFERENCES `songs` (`id`),
  CONSTRAINT `FKt9v87un10qoy4e71oep64f0p0` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
