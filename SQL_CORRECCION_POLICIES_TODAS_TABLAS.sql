-- ========================================
-- 🔐 CORRECCIÓN DE ROW LEVEL SECURITY
-- Eliminar y recrear policies de TODAS las tablas
-- ========================================

-- PREMIUM_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Usuarios ven su propia suscripción" ON premium_subscriptions;
DROP POLICY IF EXISTS "Usuarios crean su suscripción" ON premium_subscriptions;
DROP POLICY IF EXISTS "Usuarios actualizan su suscripción" ON premium_subscriptions;

CREATE POLICY "Usuarios ven su propia suscripción" 
  ON premium_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios crean su suscripción" 
  ON premium_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios actualizan su suscripción" 
  ON premium_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- INVENTARIO
DROP POLICY IF EXISTS "Usuarios ven su inventario" ON inventario;
DROP POLICY IF EXISTS "Usuarios crean inventario" ON inventario;
DROP POLICY IF EXISTS "Usuarios actualizan su inventario" ON inventario;

CREATE POLICY "Usuarios ven su inventario" 
  ON inventario FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean inventario" 
  ON inventario FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan su inventario" 
  ON inventario FOR UPDATE USING (auth.uid() = owner);

-- VENTAS
DROP POLICY IF EXISTS "Usuarios ven sus ventas" ON ventas;
DROP POLICY IF EXISTS "Usuarios crean ventas" ON ventas;
DROP POLICY IF EXISTS "Usuarios actualizan sus ventas" ON ventas;

CREATE POLICY "Usuarios ven sus ventas" 
  ON ventas FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean ventas" 
  ON ventas FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus ventas" 
  ON ventas FOR UPDATE USING (auth.uid() = owner);

-- EGRESO
DROP POLICY IF EXISTS "Usuarios ven sus egresos" ON egreso;
DROP POLICY IF EXISTS "Usuarios crean egresos" ON egreso;
DROP POLICY IF EXISTS "Usuarios actualizan sus egresos" ON egreso;

CREATE POLICY "Usuarios ven sus egresos" 
  ON egreso FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean egresos" 
  ON egreso FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus egresos" 
  ON egreso FOR UPDATE USING (auth.uid() = owner);

-- HISTORIALMESES
DROP POLICY IF EXISTS "Usuarios ven su historial" ON "historialMeses";
DROP POLICY IF EXISTS "Usuarios crean historial" ON "historialMeses";
DROP POLICY IF EXISTS "Usuarios actualizan historial" ON "historialMeses";

CREATE POLICY "Usuarios ven su historial" 
  ON "historialMeses" FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean historial" 
  ON "historialMeses" FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan historial" 
  ON "historialMeses" FOR UPDATE USING (auth.uid() = owner);

-- CLIENTES
DROP POLICY IF EXISTS "Usuarios ven sus clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios crean clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios actualizan sus clientes" ON clientes;

CREATE POLICY "Usuarios ven sus clientes" 
  ON clientes FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean clientes" 
  ON clientes FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus clientes" 
  ON clientes FOR UPDATE USING (auth.uid() = owner);

-- FACTURAS
DROP POLICY IF EXISTS "Usuarios ven sus facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios crean facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios actualizan sus facturas" ON facturas;

CREATE POLICY "Usuarios ven sus facturas" 
  ON facturas FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean facturas" 
  ON facturas FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus facturas" 
  ON facturas FOR UPDATE USING (auth.uid() = owner);

-- DEVOLUCIONES
DROP POLICY IF EXISTS "Usuarios ven sus devoluciones" ON devoluciones;
DROP POLICY IF EXISTS "Usuarios crean devoluciones" ON devoluciones;
DROP POLICY IF EXISTS "Usuarios actualizan sus devoluciones" ON devoluciones;

CREATE POLICY "Usuarios ven sus devoluciones" 
  ON devoluciones FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean devoluciones" 
  ON devoluciones FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus devoluciones" 
  ON devoluciones FOR UPDATE USING (auth.uid() = owner);

-- PRESUPUESTOS
DROP POLICY IF EXISTS "Usuarios ven sus presupuestos" ON presupuestos;
DROP POLICY IF EXISTS "Usuarios crean presupuestos" ON presupuestos;
DROP POLICY IF EXISTS "Usuarios actualizan sus presupuestos" ON presupuestos;

CREATE POLICY "Usuarios ven sus presupuestos" 
  ON presupuestos FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean presupuestos" 
  ON presupuestos FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus presupuestos" 
  ON presupuestos FOR UPDATE USING (auth.uid() = owner);

-- NOTAS_ENTREGA
DROP POLICY IF EXISTS "Usuarios ven sus notas de entrega" ON notas_entrega;
DROP POLICY IF EXISTS "Usuarios crean notas de entrega" ON notas_entrega;
DROP POLICY IF EXISTS "Usuarios actualizan sus notas" ON notas_entrega;

CREATE POLICY "Usuarios ven sus notas de entrega" 
  ON notas_entrega FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean notas de entrega" 
  ON notas_entrega FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus notas" 
  ON notas_entrega FOR UPDATE USING (auth.uid() = owner);

-- PERFIL_EMPRESA
DROP POLICY IF EXISTS "Usuarios ven su perfil" ON perfil_empresa;
DROP POLICY IF EXISTS "Usuarios crean su perfil" ON perfil_empresa;
DROP POLICY IF EXISTS "Usuarios actualizan su perfil" ON perfil_empresa;

CREATE POLICY "Usuarios ven su perfil" 
  ON perfil_empresa FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean su perfil" 
  ON perfil_empresa FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan su perfil" 
  ON perfil_empresa FOR UPDATE USING (auth.uid() = owner);

-- AVERIAS
DROP POLICY IF EXISTS "Usuarios ven sus averias" ON averias;
DROP POLICY IF EXISTS "Usuarios crean averias" ON averias;
DROP POLICY IF EXISTS "Usuarios actualizan sus averias" ON averias;

CREATE POLICY "Usuarios ven sus averias" 
  ON averias FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean averias" 
  ON averias FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus averias" 
  ON averias FOR UPDATE USING (auth.uid() = owner);

-- PEDIDOS
DROP POLICY IF EXISTS "Usuarios ven sus pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios crean pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios actualizan sus pedidos" ON pedidos;

CREATE POLICY "Usuarios ven sus pedidos" 
  ON pedidos FOR SELECT USING (auth.uid() = owner);
CREATE POLICY "Usuarios crean pedidos" 
  ON pedidos FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY "Usuarios actualizan sus pedidos" 
  ON pedidos FOR UPDATE USING (auth.uid() = owner);
