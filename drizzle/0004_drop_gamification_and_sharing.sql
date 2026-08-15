-- Scope reduction: gamification (challenges) and shared work (document sharing)
-- were removed from the product. Document ownership lives on `documents.user_id`,
-- so `document_shares` no longer carries any information.
DROP TABLE IF EXISTS `challenge_participants`;--> statement-breakpoint
DROP TABLE IF EXISTS `challenges`;--> statement-breakpoint
DROP TABLE IF EXISTS `document_shares`;
