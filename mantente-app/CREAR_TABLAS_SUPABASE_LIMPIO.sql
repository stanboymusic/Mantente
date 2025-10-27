CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  payment_method VARCHAR(50) DEFAULT 'paypal',
  transaction_id VARCHAR(255),
  price DECIMAL(10, 2) DEFAULT 20.00,
  billing_cycle_anchor TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON premium_subscriptions(status);

CREATE TABLE IF NOT EXISTS inventario (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL DEFAULT 0,
  precio DECIMAL(10, 2) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  stock_minimo INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventario_owner ON inventario(owner);
CREATE INDEX IF NOT EXISTS idx_inventario_nombre ON inventario(nombre);

CREATE TABLE IF NOT EXISTS ventas (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  codigo_venta VARCHAR(50) UNIQUE,
  cliente VARCHAR(255) NOT NULL,
  producto VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  monto DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) GENERATED ALWAYS AS (monto - descuento) STORED,
  metodo_pago VARCHAR(100),
  fecha DATE DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ventas_owner ON ventas(owner);
CREATE INDEX IF NOT EXISTS idx_ventas_codigo_venta ON ventas(codigo_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente);

CREATE TABLE IF NOT EXISTS egreso (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100),
  fecha DATE DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_egreso_owner ON egreso(owner);
CREATE INDEX IF NOT EXISTS idx_egreso_fecha ON egreso(fecha);
CREATE INDEX IF NOT EXISTS idx_egreso_categoria ON egreso(categoria);

CREATE TABLE IF NOT EXISTS "historialMeses" (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  mes VARCHAR(7) NOT NULL,
  ingresos DECIMAL(10, 2) DEFAULT 0,
  egresos DECIMAL(10, 2) DEFAULT 0,
  gastos_fijos DECIMAL(10, 2) DEFAULT 0,
  deuda_pendiente DECIMAL(10, 2) DEFAULT 0,
  balance_final DECIMAL(10, 2) DEFAULT 0,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_mes UNIQUE(owner, mes)
);

CREATE INDEX IF NOT EXISTS idx_historialMeses_owner ON "historialMeses"(owner);
CREATE INDEX IF NOT EXISTS idx_historialMeses_mes ON "historialMeses"(mes);

CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(20),
  direccion TEXT,
  ciudad VARCHAR(100),
  departamento VARCHAR(100),
  notas TEXT,
  estado VARCHAR(50) DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clientes_owner ON clientes(owner);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

CREATE TABLE IF NOT EXISTS facturas (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  numero_factura VARCHAR(50) UNIQUE,
  cliente VARCHAR(255) NOT NULL,
  items JSONB,
  subtotal DECIMAL(10, 2),
  impuestos DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2),
  fecha DATE DEFAULT CURRENT_DATE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_facturas_owner ON facturas(owner);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha);

CREATE TABLE IF NOT EXISTS devoluciones (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  codigo_venta VARCHAR(50) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  cantidad INT DEFAULT 1,
  razon TEXT,
  cliente VARCHAR(255),
  producto VARCHAR(255),
  fecha DATE DEFAULT CURRENT_DATE,
  estado VARCHAR(50) DEFAULT 'Pendiente Revisión',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT check_estado CHECK (estado IN ('Pendiente Revisión', 'Aprobada', 'Rechazada'))
);

CREATE INDEX IF NOT EXISTS idx_devoluciones_owner ON devoluciones(owner);
CREATE INDEX IF NOT EXISTS idx_devoluciones_codigo_venta ON devoluciones(codigo_venta);
CREATE INDEX IF NOT EXISTS idx_devoluciones_estado ON devoluciones(estado);
CREATE INDEX IF NOT EXISTS idx_devoluciones_fecha ON devoluciones(fecha);

CREATE TABLE IF NOT EXISTS presupuestos (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  numero_presupuesto VARCHAR(50) UNIQUE,
  cliente VARCHAR(255) NOT NULL,
  items JSONB,
  subtotal DECIMAL(10, 2),
  descuento DECIMAL(10, 2) DEFAULT 0,
  impuestos DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2),
  fecha_creacion DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_presupuestos_owner ON presupuestos(owner);
CREATE INDEX IF NOT EXISTS idx_presupuestos_numero ON presupuestos(numero_presupuesto);
CREATE INDEX IF NOT EXISTS idx_presupuestos_estado ON presupuestos(estado);

CREATE TABLE IF NOT EXISTS notas_entrega (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  numero_nota VARCHAR(50) UNIQUE,
  cliente VARCHAR(255) NOT NULL,
  items JSONB,
  observaciones TEXT,
  fecha_entrega DATE DEFAULT CURRENT_DATE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notas_entrega_owner ON notas_entrega(owner);
CREATE INDEX IF NOT EXISTS idx_notas_entrega_numero ON notas_entrega(numero_nota);

CREATE TABLE IF NOT EXISTS perfil_empresa (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL UNIQUE,
  nombre_negocio VARCHAR(255),
  razon_social VARCHAR(255),
  nit VARCHAR(50),
  email VARCHAR(255),
  telefono VARCHAR(20),
  ciudad VARCHAR(100),
  departamento VARCHAR(100),
  direccion TEXT,
  logo_url TEXT,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_perfil_empresa_owner ON perfil_empresa(owner);

ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su propia suscripción" ON premium_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios crean su suscripción" ON premium_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios actualizan su suscripción" ON premium_subscriptions FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su inventario" ON inventario FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean inventario" ON inventario FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan su inventario" ON inventario FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus ventas" ON ventas FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean ventas" ON ventas FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus ventas" ON ventas FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE egreso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus egresos" ON egreso FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean egresos" ON egreso FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus egresos" ON egreso FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE "historialMeses" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su historial" ON "historialMeses" FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean historial" ON "historialMeses" FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan historial" ON "historialMeses" FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus clientes" ON clientes FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean clientes" ON clientes FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus clientes" ON clientes FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus facturas" ON facturas FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean facturas" ON facturas FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus facturas" ON facturas FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus devoluciones" ON devoluciones FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean devoluciones" ON devoluciones FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus devoluciones" ON devoluciones FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus presupuestos" ON presupuestos FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean presupuestos" ON presupuestos FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus presupuestos" ON presupuestos FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE notas_entrega ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus notas de entrega" ON notas_entrega FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean notas de entrega" ON notas_entrega FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus notas" ON notas_entrega FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE perfil_empresa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su perfil" ON perfil_empresa FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean su perfil" ON perfil_empresa FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan su perfil" ON perfil_empresa FOR UPDATE USING (auth.uid() = owner);