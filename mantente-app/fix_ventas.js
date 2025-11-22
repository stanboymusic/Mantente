const fs = require('fs');
const path = require('path');

const filePath = 'src/components/Ventas.jsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/crearFactura/g, 'createFactura');
  content = content.replace(/crearCliente/g, 'createCliente');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Ventas.jsx actualizado');
} catch (err) {
  console.error('Error:', err.message);
}
