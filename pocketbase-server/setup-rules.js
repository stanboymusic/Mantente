import PocketBase from "pocketbase";

const pb = new PocketBase("http://localhost:8090");

const setupRules = async () => {
  try {
    console.log("🔐 Configurando reglas de acceso en PocketBase...");

    // Autenticar como admin
    await pb.admins.authWithPassword("mantenteapp@gmail.com", "31671702");
    console.log("✅ Autenticado como administrador");

    // Obtener todas las colecciones
    const collections = await pb.collections.getFullList({ skipTotal: true });

    for (const collection of collections) {
      if (collection.name === 'users') {
        // Users collection ya tiene reglas por defecto
        console.log("ℹ️  Saltando colección users (reglas por defecto)");
        continue;
      }

      // Configurar reglas de acceso para cada colección
      const rules = {
        listRule: `user_id = @request.auth.id`,
        viewRule: `user_id = @request.auth.id`,
        createRule: `user_id = @request.auth.id`,
        updateRule: `user_id = @request.auth.id`,
        deleteRule: `user_id = @request.auth.id`,
      };

      await pb.collections.update(collection.id, {
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
      });

      console.log(`✅ Reglas configuradas para: ${collection.name}`);
    }

    console.log("🎉 Todas las reglas de acceso han sido configuradas correctamente");
    console.log("🔒 Cada colección ahora requiere user_id = @request.auth.id");

  } catch (error) {
    console.error("❌ Error configurando reglas:", error.message);
    process.exit(1);
  }
};

setupRules();