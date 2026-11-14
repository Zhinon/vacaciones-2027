-- Participantes definidos por el organizador; elegir nombre no autentica identidad.
INSERT INTO participants(id,name,name_key) SELECT 'participant-vane','Vane','vane' WHERE NOT EXISTS(SELECT 1 FROM participants WHERE name_key='vane');
INSERT INTO participants(id,name,name_key) SELECT 'participant-ro','Ro','ro' WHERE NOT EXISTS(SELECT 1 FROM participants WHERE name_key='ro');
INSERT INTO participants(id,name,name_key) SELECT 'participant-charles','Charles','charles' WHERE NOT EXISTS(SELECT 1 FROM participants WHERE name_key='charles');
INSERT INTO participants(id,name,name_key) SELECT 'participant-rubio','Rubio','rubio' WHERE NOT EXISTS(SELECT 1 FROM participants WHERE name_key='rubio');
INSERT INTO participants(id,name,name_key) SELECT 'participant-chino','Chino','chino' WHERE NOT EXISTS(SELECT 1 FROM participants WHERE name_key='chino');
