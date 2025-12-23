-- MySQL schema for project persistence with version history
-- Run this in your studai_works database
-- Compatible with existing projects table structure

-- Versions table - version history for each project (using INT for project_id)
CREATE TABLE IF NOT EXISTS versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  version_number INT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_project_version (project_id, version_number),
  INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Artifacts table - actual file contents for each version (using INT for IDs)
CREATE TABLE IF NOT EXISTS artifacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  version_id INT NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  content LONGTEXT NOT NULL,
  sha256 VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_version_path (version_id, file_path),
  INDEX idx_project_id (project_id),
  INDEX idx_version_id (version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversations table - chat sessions per project (using INT for IDs)
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  phase ENUM('refine', 'generate', 'edit') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table - chat messages per conversation (using INT for IDs)
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  role ENUM('system', 'user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns to existing projects table (run separately if these fail)
-- ALTER TABLE projects ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER name;
-- ALTER TABLE projects ADD COLUMN status ENUM('draft', 'ready', 'failed') DEFAULT 'draft' AFTER description;
-- UPDATE projects SET title = name WHERE title IS NULL OR title = '';
