import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
}

const articlesDirectory = path.join(process.cwd(), 'content/articles');

export function getArticleBySlug(slug: string): Article | undefined {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content,
      date: data.date,
      readTime: data.readTime,
    };
  } catch {
    return undefined;
  }
}

const articles: Article[] = [
  {
    slug: "guia-presupuestos-inteligentes",
    title: "Guía Completa para Crear Presupuestos Inteligentes",
    excerpt: "Aprende a elaborar presupuestos que se adapten a tu estilo de vida y te ayuden a alcanzar tus metas financieras.",
    content: `# Guía Completa para Crear Presupuestos Inteligentes

## Introducción

Crear un presupuesto no significa vivir con restricciones constantes ni eliminar todo aquello que te genera placer. Pensar así es uno de los principales motivos por los que muchas personas abandonan sus presupuestos a las pocas semanas. En realidad, un presupuesto inteligente funciona más como un sistema de navegación, similar al GPS de un automóvil: no te dice a dónde no puedes ir, sino cuál es la mejor ruta para llegar a donde deseas.

Cuando no tienes un presupuesto, tomas decisiones financieras a ciegas. Cuando lo tienes, cada gasto deja de ser impulsivo y pasa a ser una elección consciente. Esa diferencia, aunque parece pequeña, tiene un impacto enorme a largo plazo.

## ¿Qué es realmente un presupuesto?

Un presupuesto es un plan financiero personal, pero también es una herramienta psicológica. No solo ordena números, sino que cambia tu relación con el dinero.

Desde una perspectiva práctica, un presupuesto te permite:

- Anticiparte a problemas financieros antes de que ocurran.
- Reducir la ansiedad relacionada con gastos inesperados.
- Priorizar lo que realmente importa en tu vida.

Desde una perspectiva más profunda, un presupuesto es una declaración de valores. Refleja qué es importante para ti hoy y qué quieres construir mañana.

Como decía Peter Drucker, referente en gestión:

"Lo que no se mide, no se puede mejorar."

Un presupuesto es, precisamente, la forma de medir tu realidad financiera.

## Paso 1: Conoce tus ingresos reales

Muchas personas creen conocer sus ingresos, pero en la práctica solo conocen su sueldo nominal. Un presupuesto inteligente trabaja con ingresos reales y sostenibles, no con escenarios optimistas.

Por ejemplo:

- Si recibes bonificaciones esporádicas, no deberían ser la base de tu presupuesto.
- Si eres independiente o freelance, debes considerar meses bajos y meses altos.

### Ejemplo práctico

Si tus ingresos mensuales han sido:

- $1,200
- $1,500
- $1,300
- $1,100

El ingreso real no es el mejor mes, sino el promedio. Presupuestar con el máximo te expone al estrés; presupuestar con el promedio te da estabilidad.

## Paso 2: Identifica y clasifica tus gastos

Aquí ocurre uno de los mayores despertares financieros. Muchas personas subestiman el impacto de los gastos pequeños y frecuentes.

Una metáfora útil es imaginar tu dinero como un balde con pequeños agujeros. No notas cada gota que se escapa, pero al final el balde queda vacío.

### Gastos fijos

Son el esqueleto de tu presupuesto. Si estos consumen demasiado, cualquier ajuste será difícil.

### Gastos variables

Aquí vive la flexibilidad, pero también el riesgo. Son necesarios, pero requieren límites claros.

### Gastos ocasionales

Son los más ignorados y los más peligrosos. Un presupuesto inteligente los anticipa, aunque no ocurran cada mes.

## Paso 3: Define objetivos financieros claros

Ahorrar "por ahorrar" rara vez funciona. El cerebro necesita un propósito.

Un objetivo financiero bien definido responde a tres preguntas:

- ¿Para qué?
- ¿Cuánto?
- ¿Cuándo?

### Ejemplo

❌ "Quiero ahorrar más"
✅ "Quiero ahorrar $1,000 en 10 meses para un fondo de emergencia"

Warren Buffett resume esto de forma sencilla:

"No ahorres lo que te queda después de gastar; gasta lo que te queda después de ahorrar."

Un presupuesto inteligente convierte esta idea en un sistema automático.

## Paso 4: Elige un método de presupuesto sostenible

El error no está en elegir mal un método, sino en elegir uno imposible de mantener.

### Método 50/30/20

Funciona como una guía general, no como una ley. Puedes adaptarlo a tu realidad.

### Presupuesto por categorías

Ideal para quienes necesitan mayor control visual y límites claros.

### Presupuesto cero

Útil para personas que desean maximizar cada unidad de dinero, pero requiere disciplina.

📌 Regla clave: si el método te genera estrés constante, no es el correcto para ti.

## Paso 5: Apóyate en herramientas, no en fuerza de voluntad

La fuerza de voluntad es limitada. Los sistemas bien diseñados no dependen de ella.

Hoy existen herramientas que:

- Registran gastos automáticamente.
- Visualizan patrones de consumo.
- Alertan cuando te desvías del plan.

James Clear, autor de Hábitos Atómicos, explica:

"No te elevas al nivel de tus objetivos, caes al nivel de tus sistemas."

Un presupuesto es exactamente eso: un sistema.

## Paso 6: Ajusta tu presupuesto con el tiempo

Un presupuesto no es una fotografía, es un proceso en movimiento.

Cambian:

- Tus ingresos.
- Tus responsabilidades.
- Tus prioridades.

Revisarlo no significa fallar, significa evolucionar. Incluso los mejores planes requieren ajustes.

## Errores comunes al crear un presupuesto

- Intentar cambiar todos los hábitos de golpe.
- No dejar espacio para disfrute personal.
- Compararse con presupuestos ajenos.
- Abandonar el sistema tras un error.

📌 Un presupuesto no se rompe por un mal mes; se rompe cuando lo abandonas.

## Cómo saber si tu presupuesto funciona

Más allá de los números, un presupuesto funciona si:

- Te sientes más tranquilo con tu dinero.
- Tomas decisiones con mayor claridad.
- Dejas de vivir "al día".
- Empiezas a planificar el futuro.

La verdadera señal de éxito es la reducción del estrés financiero.

## Conclusión

Un presupuesto inteligente no busca controlarte, busca liberarte. Te da claridad, dirección y tranquilidad. No se trata de perfección, sino de constancia.

Empieza simple, mejora con el tiempo y recuerda: el control financiero no es un destino, es un hábito.

## Aviso importante

Este contenido es únicamente informativo y educativo. No constituye asesoramiento financiero profesional.`,
    date: "2024-12-24",
    readTime: 8
  },
  {
    slug: "estrategias-ahorro-efectivas",
    title: "10 Estrategias de Ahorro que Realmente Funcionan",
    excerpt: "Descubre técnicas probadas para aumentar tus ahorros y construir un fondo de emergencia sólido.",
    content: `# 10 Estrategias de Ahorro que Realmente Funcionan

Ahorrar dinero requiere disciplina y estrategias inteligentes. Aquí te presentamos 10 métodos efectivos para aumentar tus ahorros mes a mes.

## 1. El método del 50/30/20
Asigna el 50% de tus ingresos a necesidades, 30% a deseos y 20% a ahorros e inversiones.

## 2. Automatiza tus ahorros
Configura transferencias automáticas a tu cuenta de ahorros el día de pago.

## 3. Redondeo de compras
Redondea tus compras al dólar superior y ahorra la diferencia.

## 4. Desafío del cambio
Guarda el cambio de tus compras diarias.

## 5. Regla de los 24 meses
Ahorra el equivalente a 24 meses de gastos esenciales.

## 6. Ahorro por categorías
Establece metas de ahorro específicas para diferentes objetivos.

## 7. Reduce gastos innecesarios
Identifica y elimina suscripciones y gastos que no aportan valor.

## 8. Cocina en casa
Prepara comidas en casa para reducir gastos en restaurantes.

## 9. Compra inteligente
Compara precios y usa cupones para maximizar tus ahorros.

## 10. Invierte en ti mismo
Educa tus finanzas para tomar mejores decisiones.

Implementar estas estrategias consistentemente te llevará a una mayor estabilidad financiera.`,
    date: "2024-12-23",
    readTime: 10
  },
  {
    slug: "gestion-deudas-efectiva",
    title: "Cómo Gestionar y Eliminar Deudas de Manera Inteligente",
    excerpt: "Estrategias prácticas para reducir deudas, mejorar tu crédito y recuperar el control de tus finanzas.",
    content: `# Cómo Gestionar y Eliminar Deudas de Manera Inteligente

Las deudas pueden ser una carga pesada, pero con una estrategia adecuada, puedes eliminarlas y mejorar tu salud financiera.

## Tipos de deudas

### Deudas buenas vs malas
- **Buenas**: hipotecas, educación, inversiones
- **Malas**: tarjetas de crédito con intereses altos, compras impulsivas

## Estrategias para eliminar deudas

### 1. Método de la bola de nieve
Paga primero las deudas más pequeñas para ganar momentum.

### 2. Método de avalancha
Paga primero las deudas con mayor interés.

### 3. Consolidación de deudas
Combina múltiples deudas en una con mejor tasa.

### 4. Negociación con acreedores
Contacta a tus acreedores para mejores términos.

## Prevención de nuevas deudas

- Evita compras impulsivas
- Usa efectivo en lugar de tarjetas
- Construye un fondo de emergencia
- Educa sobre finanzas personales

## Beneficios de estar libre de deudas

- Mayor libertad financiera
- Mejor salud mental
- Oportunidades de inversión
- Mayor estabilidad

Recuerda que eliminar deudas requiere tiempo y disciplina, pero los beneficios valen el esfuerzo.`,
    date: "2024-12-22",
    readTime: 12
  }
];

export function getAllArticles(): Article[] {
  const fileArticles: Article[] = [];

  try {
    const fileNames = fs.readdirSync(articlesDirectory);
    const allArticlesData = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(articlesDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          slug,
          title: data.title,
          excerpt: data.excerpt,
          content,
          date: data.date,
          readTime: data.readTime,
        };
      });

    fileArticles.push(...allArticlesData);
  } catch {
    // Directory doesn't exist or no files
  }

  // For now, also include the old hardcoded articles
  fileArticles.push(...articles);

  return fileArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveArticle(article: Omit<Article, 'slug'> & { slug?: string }): string {
  const slug = article.slug || generateSlug(article.title);
  const fullPath = path.join(articlesDirectory, `${slug}.md`);

  const frontmatter = {
    title: article.title,
    excerpt: article.excerpt,
    date: article.date,
    readTime: article.readTime,
  };

  const fileContent = matter.stringify(article.content, frontmatter);
  fs.writeFileSync(fullPath, fileContent, 'utf8');

  return slug;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}