-- Extensiones de esquema para adaptar funcionalidades de KRISDYL a mantente-app
-- Ejecutar en Supabase/PocketBase

-- 1. Extender tabla de usuarios (_pb_users ya existe, agregar campos)
-- Nota: En PocketBase, agregar campos via admin panel o migration
-- Campos a agregar: role (select), permissions (json), 2fa_secret (text), 2fa_enabled (bool), last_login (datetime), login_attempts (number), blocked_until (datetime), language (text)

-- 2. Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    module TEXT NOT NULL, -- ej: 'users', 'reports', 'settings'
    created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de asignación rol-permiso
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- 5. Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- referencia a _pb_users.id
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, warning, error, success
    is_read BOOLEAN DEFAULT FALSE,
    created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB -- datos adicionales
);

-- 6. Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    description TEXT,
    updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de intentos de login fallidos
CREATE TABLE IF NOT EXISTS failed_logins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    email TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT
);

-- 8. Tabla de actividad de usuarios
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabla de traducciones
CREATE TABLE IF NOT EXISTS translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    language_code TEXT NOT NULL, -- ej: 'es', 'en', 'ar'
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    UNIQUE(language_code, key)
);

-- Insertar roles básicos
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador completo'),
('moderator', 'Moderador con permisos limitados'),
('user', 'Usuario estándar')
ON CONFLICT (name) DO NOTHING;

-- Insertar permisos básicos
INSERT INTO permissions (name, description, module) VALUES
('users.view', 'Ver usuarios', 'users'),
('users.create', 'Crear usuarios', 'users'),
('users.edit', 'Editar usuarios', 'users'),
('users.delete', 'Eliminar usuarios', 'users'),
('reports.view', 'Ver informes', 'reports'),
('reports.export', 'Exportar informes', 'reports'),
('settings.view', 'Ver configuración', 'settings'),
('settings.edit', 'Editar configuración', 'settings'),
('notifications.view', 'Ver notificaciones', 'notifications'),
('notifications.manage', 'Gestionar notificaciones', 'notifications')
ON CONFLICT (name) DO NOTHING;

-- Asignar permisos a roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'moderator' AND p.name IN ('users.view', 'reports.view', 'reports.export', 'notifications.view')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' AND p.name IN ('reports.view', 'notifications.view')
ON CONFLICT DO NOTHING;

-- Configuración inicial del sistema
INSERT INTO system_settings (key, value, description) VALUES
('site_name', '"Mantente App"', 'Nombre del sitio'),
('site_logo', '"/material visual/logo.png"', 'URL del logo'),
('timezone', '"America/Caracas"', 'Zona horaria'),
('currency', '"VES"', 'Moneda'),
('language', '"es"', 'Idioma por defecto'),
('maintenance_mode', 'false', 'Modo mantenimiento'),
('email_verification', 'true', 'Verificación de email requerida'),
('2fa_enabled', 'false', '2FA habilitado globalmente')
ON CONFLICT (key) DO NOTHING;

-- Traducciones básicas
INSERT INTO translations (language_code, key, value) VALUES
('es', 'welcome', 'Bienvenido'),
('en', 'welcome', 'Welcome'),
('ar', 'welcome', 'مرحباً'),
('es', 'login', 'Iniciar Sesión'),
('en', 'login', 'Login'),
('ar', 'login', 'تسجيل الدخول')
ON CONFLICT DO NOTHING;