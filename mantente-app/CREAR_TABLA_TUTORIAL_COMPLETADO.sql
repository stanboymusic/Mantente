-- Crear tabla para rastrear tutoriales completados
CREATE TABLE IF NOT EXISTS tutorial_completado (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    tutorial_version TEXT DEFAULT '1.0',
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP DEFAULT NULL,
    created TIMESTAMP DEFAULT NOW(),
    updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Políticas RLS
ALTER TABLE tutorial_completado ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios registros
CREATE POLICY "Users can view own tutorial status" ON tutorial_completado
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own tutorial status" ON tutorial_completado
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own tutorial status" ON tutorial_completado
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Índice para optimización
CREATE INDEX IF NOT EXISTS idx_tutorial_user_id ON tutorial_completado(user_id);