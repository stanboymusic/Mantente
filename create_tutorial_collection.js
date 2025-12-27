import PocketBase from "pocketbase";

const pb = new PocketBase("https://mantente-pocketbase.fly.dev");

const tutorialCollection = {
  name: "tutorial_completado",
  fields: [
    { name: "user_id", type: "text", required: true },
    { name: "tutorial_version", type: "text" },
    { name: "completado", type: "bool" },
    { name: "fecha_completado", type: "date" },
  ],
};

async function createTutorialCollection() {
  try {
    await pb.collection("_superusers").authWithPassword("mantenteapp@gmail.com", "31671702");
    console.log("✅ Autenticado");

    const existing = await pb.collections.getFullList();
    const existingNames = existing.map((c) => c.name);

    if (existingNames.includes(tutorialCollection.name)) {
      console.log(`ℹ️  ${tutorialCollection.name} ya existe`);
      return;
    }

    await pb.collections.create({
      name: tutorialCollection.name,
      type: "base",
      fields: tutorialCollection.fields,
    });
    console.log(`✅ Creada: ${tutorialCollection.name}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createTutorialCollection();