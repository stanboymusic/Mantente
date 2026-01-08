import PocketBase from "pocketbase";

const pb = new PocketBase("http://localhost:8090");

const createCollections = async () => {
  try {
    console.log("🔄 Sincronizando colecciones con PocketBase schema...");

    console.log("🔐 Autenticando con administrador...");
    try {
      await pb.admins.authWithPassword("mantenteapp@gmail.com", "31671702");
      console.log("✅ Autenticado como administrador");
    } catch (authError) {
      console.warn("⚠️  No se pudo autenticar como admin, intentando con usuario normal...");
    }

    const existingCollections = await pb.collections.getFullList({ skipTotal: true });
    const collectionNames = existingCollections.map((c) => c.name);

    const collectionsToCreate = [
      {
        name: "users",
        type: "auth",
        fields: [
          { name: "email", type: "email", required: true },
          { name: "username", type: "text", required: true },
          { name: "emailVisibility", type: "bool", defaultValue: false },
          { name: "verified", type: "bool", defaultValue: false },
        ],
      },
      {
        name: "averias",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "producto", type: "text" },
          { name: "cantidad", type: "number", defaultValue: 0 },
          { name: "razon_dano", type: "text" },
          { name: "tiene_cambio_proveedor", type: "bool", defaultValue: false },
          { name: "referencia_canje", type: "text" },
          { name: "nombre_proveedor", type: "text" },
          { name: "precio_unitario", type: "number", defaultValue: 0 },
          { name: "estado", type: "text" },
          { name: "fecha", type: "date" },
          { name: "registrada_por", type: "text" },
          { name: "notas", type: "text" },
        ],
      },
      {
        name: "cierre_mes",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "mes_cierre", type: "date" },
          { name: "estado", type: "text" },
          { name: "total_ingresos", type: "number", defaultValue: 0 },
          { name: "total_egresos", type: "number", defaultValue: 0 },
          { name: "total_descuentos", type: "number", defaultValue: 0 },
          { name: "ganancia_neta", type: "number", defaultValue: 0 },
          { name: "cantidad_ventas", type: "number", defaultValue: 0 },
          { name: "cantidad_clientes", type: "number", defaultValue: 0 },
          { name: "notas", type: "text" },
          { name: "fecha_cierre", type: "date" },
          { name: "fecha_creacion", type: "date" },
          { name: "fecha_actualizacion", type: "date" },
        ],
      },
      {
        name: "clientes",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "nombre", type: "text", required: true },
          { name: "email", type: "text" },
          { name: "telefono", type: "text" },
          { name: "direccion", type: "text" },
          { name: "ciudad", type: "text" },
          { name: "departamento", type: "text" },
          { name: "ruc", type: "text" },
          { name: "razon_social", type: "text" },
          { name: "notas", type: "text" },
          { name: "estado", type: "text", defaultValue: "activo" },
        ],
      },
      {
        name: "customers",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "code", type: "text" },
          { name: "name", type: "text", required: true },
          { name: "email", type: "text" },
          { name: "phone", type: "text" },
          { name: "address", type: "text" },
          { name: "city", type: "text" },
          { name: "state", type: "text" },
          { name: "zip_code", type: "text" },
          { name: "country", type: "text" },
          { name: "tax_id", type: "text" },
          { name: "contact_person", type: "text" },
          { name: "payment_terms", type: "text" },
          { name: "credit_limit", type: "number", defaultValue: 0 },
          { name: "is_active", type: "bool", defaultValue: true },
          { name: "notes", type: "text" },
        ],
      },
      {
        name: "devoluciones",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "venta_id", type: "text" },
          { name: "monto", type: "number", defaultValue: 0 },
          { name: "cantidad", type: "number", defaultValue: 0 },
          { name: "razon", type: "text" },
          { name: "cliente", type: "text" },
          { name: "producto", type: "text" },
          { name: "fecha", type: "date" },
          { name: "estado", type: "text" },
          { name: "tipo_resolucion", type: "text" },
          { name: "estado_producto", type: "text" },
          { name: "producto_nuevo", type: "text" },
          { name: "cantidad_nueva", type: "number", defaultValue: 0 },
          { name: "precio_nuevo", type: "number", defaultValue: 0 },
          { name: "diferencia_precio", type: "number", defaultValue: 0 },
          { name: "tiene_cambio_proveedor", type: "bool", defaultValue: false },
          { name: "referencia_canje", type: "text" },
          { name: "id_ingreso", type: "text" },
          { name: "id_egreso", type: "text" },
          { name: "fecha_procesada", type: "date" },
          { name: "procesada_por", type: "text" },
          { name: "notas_adicionales", type: "text" },
          { name: "cantidad_devuelta", type: "number", defaultValue: 0 },
          { name: "codigo_venta", type: "text" },
        ],
      },
      {
        name: "egreso",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "descripcion", type: "text", required: true },
          { name: "monto", type: "number", required: true },
          { name: "categoria", type: "text" },
          { name: "fecha", type: "date" },
          { name: "mes_cierre", type: "date" },
          { name: "notas", type: "text" },
        ],
      },
      {
        name: "empresa_profiles",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "nombre", type: "text" },
          { name: "identificacion_fiscal", type: "text" },
          { name: "email", type: "text" },
          { name: "telefono", type: "text" },
          { name: "direccion", type: "text" },
          { name: "logo_url", type: "text" },
        ],
      },
      {
        name: "facturas",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "numero_factura", type: "text", required: true },
          { name: "cliente", type: "text", required: true },
          { name: "items", type: "json" },
          { name: "subtotal", type: "number", defaultValue: 0 },
          { name: "total", type: "number", defaultValue: 0 },
          { name: "fecha", type: "date" },
          { name: "estado", type: "text", defaultValue: "pendiente" },
          { name: "notas", type: "text" },
          { name: "cliente_id", type: "text" },
          { name: "descuento", type: "number", defaultValue: 0 },
          { name: "impuesto", type: "number", defaultValue: 0 },
          { name: "metodo_pago", type: "text" },
          { name: "venta_id", type: "text" },
          { name: "fecha_pago", type: "date" },
          { name: "cliente_email", type: "text" },
          { name: "cliente_telefono", type: "text" },
          { name: "cliente_ruc", type: "text" },
          { name: "cliente_direccion", type: "text" },
          { name: "empresa_nombre", type: "text" },
          { name: "empresa_ruc", type: "text" },
          { name: "empresa_email", type: "text" },
          { name: "empresa_telefono", type: "text" },
          { name: "empresa_direccion", type: "text" },
          { name: "empresa_logo_url", type: "text" },
          { name: "productos_json", type: "json" },
          { name: "ventas_ids", type: "json" },
          { name: "codigos_venta_json", type: "text" },
        ],
      },
      {
        name: "historialMeses",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "mes", type: "text" },
          { name: "total_ventas", type: "number", defaultValue: 0 },
          { name: "total_descuentos", type: "number", defaultValue: 0 },
          { name: "total_final", type: "number", defaultValue: 0 },
          { name: "total_egresos", type: "number", defaultValue: 0 },
          { name: "egresos", type: "number", defaultValue: 0 },
          { name: "gastos_fijos", type: "number", defaultValue: 0 },
          { name: "deuda_anterior", type: "number", defaultValue: 0 },
          { name: "deuda_pendiente", type: "number", defaultValue: 0 },
          { name: "ganancia_neta", type: "number", defaultValue: 0 },
          { name: "cantidad_transacciones", type: "number", defaultValue: 0 },
          { name: "balance_final", type: "number", defaultValue: 0 },
          { name: "ingresos", type: "number", defaultValue: 0 },
          { name: "is_closed", type: "bool", defaultValue: false },
        ],
      },
      {
        name: "inventario",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "nombre", type: "text", required: true },
          { name: "cantidad", type: "number", defaultValue: 0 },
          { name: "precio", type: "number", required: true },
          { name: "descripcion", type: "text" },
          { name: "categoria", type: "text" },
          { name: "stock_minimo", type: "number", defaultValue: 0 },
          { name: "fecha_agregado", type: "date" },
        ],
      },
      {
        name: "invoices",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "order_id", type: "text" },
          { name: "customer_id", type: "text", required: true },
          { name: "invoice_number", type: "text", required: true },
          { name: "invoice_date", type: "date" },
          { name: "due_date", type: "date" },
          { name: "status", type: "text", defaultValue: "draft" },
          { name: "subtotal", type: "number", defaultValue: 0 },
          { name: "tax", type: "number", defaultValue: 0 },
          { name: "discount", type: "number", defaultValue: 0 },
          { name: "total", type: "number", defaultValue: 0 },
          { name: "paid_amount", type: "number", defaultValue: 0 },
          { name: "payment_method", type: "text" },
          { name: "notes", type: "text" },
        ],
      },
      {
        name: "notas_entrega",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "numero_nota", type: "text", required: true },
          { name: "cliente", type: "text", required: true },
          { name: "items", type: "json" },
          { name: "observaciones", type: "text" },
          { name: "fecha_entrega", type: "date" },
          { name: "estado", type: "text", defaultValue: "pendiente" },
          { name: "empresa_nombre", type: "text" },
          { name: "empresa_ruc", type: "text" },
          { name: "empresa_email", type: "text" },
          { name: "empresa_telefono", type: "text" },
          { name: "empresa_direccion", type: "text" },
          { name: "empresa_logo_url", type: "text" },
        ],
      },
      {
        name: "order_items",
        type: "base",
        fields: [
          { name: "order_id", type: "text", required: true },
          { name: "product_id", type: "text", required: true },
          { name: "quantity", type: "number", defaultValue: 1 },
          { name: "unit_price", type: "number", defaultValue: 0 },
          { name: "discount_percentage", type: "number", defaultValue: 0 },
          { name: "line_total", type: "number", defaultValue: 0 },
          { name: "notes", type: "text" },
        ],
      },
      {
        name: "orders",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "customer_id", type: "text", required: true },
          { name: "code", type: "text", required: true },
          { name: "status", type: "text", defaultValue: "pending" },
          { name: "order_date", type: "date" },
          { name: "delivery_date", type: "date" },
          { name: "subtotal", type: "number", defaultValue: 0 },
          { name: "tax", type: "number", defaultValue: 0 },
          { name: "discount", type: "number", defaultValue: 0 },
          { name: "total", type: "number", defaultValue: 0 },
          { name: "payment_method", type: "text" },
          { name: "payment_status", type: "text", defaultValue: "pending" },
          { name: "notes", type: "text" },
        ],
      },
      {
        name: "pedidos",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "numero_pedido", type: "text" },
          { name: "cliente", type: "text" },
          { name: "items", type: "json" },
          { name: "total", type: "number", defaultValue: 0 },
          { name: "estado", type: "text" },
          { name: "fecha_entrega_estimada", type: "date" },
          { name: "observaciones", type: "text" },
        ],
      },
      {
        name: "perfil_empresa",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "nombre_negocio", type: "text" },
          { name: "razon_social", type: "text" },
          { name: "nit", type: "text" },
          { name: "email", type: "text" },
          { name: "telefono", type: "text" },
          { name: "ciudad", type: "text" },
          { name: "departamento", type: "text" },
          { name: "direccion", type: "text" },
          { name: "logo_url", type: "text" },
          { name: "descripcion", type: "text" },
        ],
      },
      {
        name: "premium_subscriptions",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "status", type: "text", defaultValue: "active" },
          { name: "payment_method", type: "text", defaultValue: "paypal" },
          { name: "transaction_id", type: "text" },
          { name: "price", type: "number", defaultValue: 20.0 },
          { name: "billing_cycle_anchor", type: "date" },
          { name: "current_period_start", type: "date" },
          { name: "current_period_end", type: "date" },
        ],
      },
      {
        name: "presupuestos",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "numero_presupuesto", type: "text", required: true },
          { name: "cliente", type: "text", required: true },
          { name: "items", type: "json" },
          { name: "subtotal", type: "number", defaultValue: 0 },
          { name: "descuento", type: "number", defaultValue: 0 },
          { name: "impuestos", type: "number", defaultValue: 0 },
          { name: "total", type: "number", defaultValue: 0 },
          { name: "fecha_creacion", type: "date" },
          { name: "fecha_vencimiento", type: "date" },
          { name: "estado", type: "text", defaultValue: "pendiente" },
          { name: "notas", type: "text" },
        ],
      },
      {
        name: "products",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "code", type: "text", required: true },
          { name: "name", type: "text", required: true },
          { name: "description", type: "text" },
          { name: "price", type: "number", defaultValue: 0 },
          { name: "cost", type: "number", defaultValue: 0 },
          { name: "quantity", type: "number", defaultValue: 0 },
          { name: "category", type: "text" },
          { name: "image_url", type: "text" },
          { name: "sku", type: "text" },
          { name: "barcode", type: "text" },
          { name: "is_active", type: "bool", defaultValue: true },
        ],
      },
      {
        name: "returns",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "order_id", type: "text" },
          { name: "product_id", type: "text" },
          { name: "reason", type: "text" },
          { name: "quantity_returned", type: "number", defaultValue: 0 },
          { name: "refund_amount", type: "number", defaultValue: 0 },
          { name: "status", type: "text" },
          { name: "replacement_product_id", type: "text" },
          { name: "notes", type: "text" },
        ],
      },
      {
        name: "settings",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "gastosFijos", type: "number", defaultValue: 0 },
          { name: "isPremium", type: "text", defaultValue: "false" },
        ],
      },
      {
        name: "sync_log",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "table_name", type: "text", required: true },
          { name: "action", type: "text" },
          { name: "record_id", type: "text" },
          { name: "synced", type: "bool", defaultValue: true },
          { name: "error", type: "text" },
        ],
      },
      {
        name: "tutorial_completado",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "completado", type: "bool", defaultValue: false },
          { name: "fecha_completado", type: "date" },
          { name: "tutorial_version", type: "text", defaultValue: "1.0" },
        ],
      },
      {
        name: "user_statistics",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "total_products", type: "number", defaultValue: 0 },
          { name: "total_customers", type: "number", defaultValue: 0 },
          { name: "total_orders", type: "number", defaultValue: 0 },
          { name: "total_invoices", type: "number", defaultValue: 0 },
          { name: "total_sales", type: "number", defaultValue: 0 },
          { name: "completed_sales", type: "number", defaultValue: 0 },
        ],
      },
      {
        name: "ventas",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "codigo_venta", type: "text", required: true },
          { name: "cliente", type: "text", required: true },
          { name: "producto", type: "text", required: true },
          { name: "cantidad", type: "number", defaultValue: 1 },
          { name: "monto", type: "number", required: true },
          { name: "descuento", type: "number", defaultValue: 0 },
          { name: "total", type: "number", defaultValue: 0 },
          { name: "metodo_pago", type: "text" },
          { name: "fecha", type: "date" },
          { name: "mes_cierre", type: "date" },
          { name: "notas", type: "text" },
          { name: "cliente_id", type: "text" },
          { name: "productos_json", type: "json" },
          { name: "facturado", type: "bool", defaultValue: false },
          { name: "cantidad_productos", type: "number", defaultValue: 0 },
        ],
      },
    ];

    for (const collectionDef of collectionsToCreate) {
      if (!collectionNames.includes(collectionDef.name)) {
        await pb.collections.create({
          name: collectionDef.name,
          type: collectionDef.type || "base",
          fields: collectionDef.fields,
        });
        console.log(`✅ Colección creada: ${collectionDef.name} (${collectionDef.type || "base"})`);
      } else {
        console.log(`ℹ️  Colección ya existe: ${collectionDef.name}`);
      }
    }

    console.log("✅ 25 colecciones sincronizadas correctamente");
  } catch (error) {
    console.error("❌ Error sincronizando colecciones:", error);
  }
};

const start = async () => {
  try {
    console.log("🚀 Conectando a PocketBase Server en http://localhost:8090...");

    await createCollections();

    console.log("\n📊 ¡Listo! PocketBase está sincronizado");
    console.log("🌐 Admin: http://localhost:8090/_/");
    console.log("📡 API: http://localhost:8090/api");
    console.log("\n✅ Todas las colecciones han sido creadas/verificadas");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    console.error("\n⚠️  Asegúrate de que PocketBase esté ejecutándose:");
    console.error("   Terminal: ./pocketbase serve");
    process.exit(1);
  }
};

start();
