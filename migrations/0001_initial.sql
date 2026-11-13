PRAGMA foreign_keys = ON;
CREATE TABLE proposals (id TEXT PRIMARY KEY, data TEXT NOT NULL CHECK(json_valid(data)), revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE participants (id TEXT PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TRIGGER participants_limit BEFORE INSERT ON participants WHEN (SELECT COUNT(*) FROM participants) >= 5 BEGIN SELECT RAISE(ABORT, 'GROUP_FULL'); END;
CREATE TABLE votes (participant_id TEXT NOT NULL REFERENCES participants(id), proposal_id TEXT NOT NULL REFERENCES proposals(id), value TEXT NOT NULL CHECK(value IN ('yes','maybe','no')), revision INTEGER NOT NULL, updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), PRIMARY KEY(participant_id, proposal_id));
CREATE TABLE favorites (participant_id TEXT PRIMARY KEY REFERENCES participants(id), proposal_id TEXT NOT NULL REFERENCES proposals(id), revision INTEGER NOT NULL);
CREATE TABLE comments (id TEXT PRIMARY KEY, participant_id TEXT NOT NULL REFERENCES participants(id), proposal_id TEXT NOT NULL REFERENCES proposals(id), body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 1200), created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE INDEX comments_by_proposal ON comments(proposal_id, created_at);
CREATE TABLE suggestions (id TEXT PRIMARY KEY, participant_id TEXT NOT NULL REFERENCES participants(id), title TEXT NOT NULL, url TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
