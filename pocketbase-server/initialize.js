import PocketBase from "pocketbase";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";
const ADMIN_EMAIL = "mantenteapp@gmail.com";
const ADMIN_PASSWORD = "31671702";

const pb = new PocketBase(POCKETBASE_URL);

async function ensureAdminExists() {
  try {
    console.log("🔐 Verificando cuenta de administrador...");
    
    const admins = await pb.admins.getFullList();
    const adminExists = admins.some(a => a.email === ADMIN_EMAIL);
    
    if (adminExists) {
      console.log("✅ Cuenta de admin ya existe");
      return true;
    }
    
    console.log("⚠️  No existe cuenta de admin, intentando crear...");
    await pb.admins.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      passwordConfirm: ADMIN_PASSWORD,
    });
    console.log("✅ Cuenta de admin creada");
    return true;
  } catch (error) {
    console.warn("⚠️  No se pudo verificar/crear admin:", error.message);
    return false;
  }
}

async function authenticateAdmin() {
  try {
    console.log("🔐 Autenticando como administrador...");
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Autenticado exitosamente");
    return true;
  } catch (error) {
    console.error("❌ Error de autenticación:", error.message);
    return false;
  }
}

async function createCollections() {
  try {
    console.log("\n📊 Iniciando sincronización de colecciones...\n");

    const existingCollections = await pb.collections.getFullList({ skipTotal: true });
    const existingNames = existingCollections.map(c => c.name);

    const collections = [
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
        name: "settings",
        type: "base",
        fields: [
          { name: "user_id", type: "text", required: true },
          { name: "gastosFijos", type: "number", defaultValue: 0 },
          { name: "isPremium", type: "text", defaultValue: "false" },
        ],
      },
    ];

    let createdCount = 0;
    for (const collection of collections) {
      if (existingNames.includes(collection.name)) {
        console.log(`ℹ️  ${collection.name} ya existe`);
        continue;
      }

      try {
        await pb.collections.create({
          name: collection.name,
          type: collection.type || "base",
          fields: collection.fields,
        });
        console.log(`✅ ${collection.name} (${collection.type || "base"})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creando ${collection.name}:`, error.message);
      }
    }

    console.log(`\n✅ Inicialización completada!`);
    console.log(`📊 Colecciones nuevas: ${createdCount}`);
    console.log(`📋 Total de colecciones: ${existingNames.length + createdCount}`);
    return true;
  } catch (error) {
    console.error("❌ Error fatal:", error.message);
    return false;
  }
}

async function main() {
  try {
    console.log("========================================");
    console.log("  MANTENTE - PocketBase Initialization");
    console.log("========================================\n");

    console.log(`Conectando a: ${POCKETBASE_URL}\n`);

    // Step 1: Check admin
    await ensureAdminExists();

    // Step 2: Authenticate
    const authenticated = await authenticateAdmin();
    if (!authenticated) {
      console.log("\n⚠️  No se pudo autenticar como admin");
      console.log("Por favor, asegúrate de que:");
      console.log("1. PocketBase está ejecutándose");
      console.log("2. La cuenta admin existe en PocketBase");
      process.exit(1);
    }

    // Step 3: Create collections
    await createCollections();

    console.log("\n========================================");
    console.log("  ✅ ¡Listo para usar!");
    console.log("========================================\n");
    console.log("Accede a: http://localhost:8090/_/\n");

  } catch (error) {
    console.error("\n❌ Error crítico:", error.message);
    process.exit(1);
  }
}

main();
