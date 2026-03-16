-- Migration: add tags column to documents table
ALTER TABLE `documents` ADD `tags` text NOT NULL DEFAULT '[]';
