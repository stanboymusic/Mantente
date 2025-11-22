#!/usr/bin/env python3
import re

file_path = r'c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app\src\components\Ventas.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('crearFactura', 'createFactura')
content = content.replace('crearCliente', 'createCliente')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Ventas.jsx actualizado")
