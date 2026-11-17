-- EventX Database Migration
-- Target: Aiven Cloud MySQL (InnoDB)
-- Modules: Users, Movies, Movie Genres, Movie Cast, Events, Event Ticket Tiers

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `password` VARCHAR(255) NOT NULL,
  `profile_image` VARCHAR(500) NULL,
  `role` ENUM('super_admin', 'admin', 'user') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `last_login` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_status_idx` (`role`, `status`),
  KEY `users_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. MOVIES TABLE
CREATE TABLE IF NOT EXISTS `movies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `language` VARCHAR(100) NOT NULL,
  `director` VARCHAR(200) NOT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL,
  `certification` ENUM('U', 'UA', 'A', 'S') NOT NULL DEFAULT 'UA',
  `release_date` DATE NOT NULL,
  `release_status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `description` TEXT NOT NULL,
  `poster_url` VARCHAR(1000) NOT NULL,
  `banner_url` VARCHAR(1000) NULL,
  `trailer_url` VARCHAR(500) NULL,
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `movies_created_by_idx` (`created_by`),
  KEY `movies_release_status_idx` (`release_status`),
  KEY `movies_is_featured_idx` (`is_featured`),
  KEY `movies_release_date_idx` (`release_date`),
  CONSTRAINT `fk_movies_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MOVIE GENRES TABLE
CREATE TABLE IF NOT EXISTS `movie_genres` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `movie_id` BIGINT UNSIGNED NOT NULL,
  `genre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `movie_genres_unique` (`movie_id`, `genre`),
  KEY `movie_genres_genre_idx` (`genre`),
  CONSTRAINT `fk_movie_genres_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MOVIE CAST TABLE
CREATE TABLE IF NOT EXISTS `movie_cast` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `movie_id` BIGINT UNSIGNED NOT NULL,
  `actor_name` VARCHAR(200) NOT NULL,
  `character_name` VARCHAR(200) NULL,
  PRIMARY KEY (`id`),
  KEY `movie_cast_movie_id_idx` (`movie_id`),
  KEY `movie_cast_actor_name_idx` (`actor_name`),
  CONSTRAINT `fk_movie_cast_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. EVENTS TABLE
CREATE TABLE IF NOT EXISTS `events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `venue_address` VARCHAR(300) NOT NULL,
  `description` TEXT NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,
  `publication_status` ENUM('draft', 'published', 'cancelled') NOT NULL DEFAULT 'draft',
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `poster_url` VARCHAR(1000) NULL,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `events_created_by_idx` (`created_by`),
  KEY `events_publication_status_idx` (`publication_status`),
  KEY `events_city_category_idx` (`city`, `category`),
  KEY `events_start_datetime_idx` (`start_datetime`),
  KEY `events_is_featured_idx` (`is_featured`),
  CONSTRAINT `fk_events_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. EVENT TICKET TIERS TABLE
CREATE TABLE IF NOT EXISTS `event_ticket_tiers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `tier_name` VARCHAR(120) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `capacity` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_ticket_tiers_event_id_idx` (`event_id`),
  KEY `event_ticket_tiers_price_idx` (`price`),
  CONSTRAINT `chk_ticket_price_non_negative` CHECK (`price` >= 0),
  CONSTRAINT `chk_ticket_capacity_positive` CHECK (`capacity` > 0),
  CONSTRAINT `fk_event_ticket_tiers_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
