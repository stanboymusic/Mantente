// Script de prueba para verificar la colección tutorial_completado
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://mantente-pocketbase.fly.dev');

async function testTutorialCollection() {
  try {
    console.log('🔍 Probando conexión a PocketBase...');

    // Intentar autenticar
    await pb.collection('_superusers').authWithPassword('mantenteapp@gmail.com', '31671702');
    console.log('✅ Autenticado como admin');

    // Verificar que la colección existe
    const collections = await pb.collections.getFullList();
    const tutorialCollection = collections.find(c => c.name === 'tutorial_completado');

    if (!tutorialCollection) {
      console.error('❌ La colección tutorial_completado NO existe');
      return;
    }

    console.log('✅ Colección tutorial_completado encontrada:', tutorialCollection);

    // Verificar permisos
    console.log('📋 Permisos de la colección:');
    console.log('  - listRule:', tutorialCollection.listRule);
    console.log('  - viewRule:', tutorialCollection.viewRule);
    console.log('  - createRule:', tutorialCollection.createRule);
    console.log('  - updateRule:', tutorialCollection.updateRule);
    console.log('  - deleteRule:', tutorialCollection.deleteRule);

    // Intentar crear un registro de prueba
    console.log('🔄 Intentando crear registro de prueba...');
    const testRecord = await pb.collection('tutorial_completado').create({
      user_id: 'test_user_123',
      tutorial_version: '1.0',
      completado: false
    });
    console.log('✅ Registro de prueba creado:', testRecord);

    // Intentar consultar el registro
    console.log('🔄 Intentando consultar registro...');
    const foundRecord = await pb.collection('tutorial_completado').getFirstListItem(`user_id='test_user_123'`);
    console.log('✅ Registro encontrado:', foundRecord);

    // Limpiar registro de prueba
    await pb.collection('tutorial_completado').delete(testRecord.id);
    console.log('🧹 Registro de prueba eliminado');

    console.log('🎉 ¡La colección tutorial_completado funciona correctamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Error details:', error);
  }
}

testTutorialCollection();