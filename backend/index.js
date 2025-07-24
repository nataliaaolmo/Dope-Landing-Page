const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs/promises');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ejecutar el contenido de schema.sql al iniciar
async function runSchemaMigration() {
  try {
    const schema = await fs.readFile('./schema.sql', 'utf8');
    await pool.query(schema);
    console.log('✅ Tabla comprobada/creada correctamente.');
  } catch (err) {
    console.error('❌ Error ejecutando schema.sql:', err);
  }
}

// Iniciar el servidor después de ejecutar schema.sql
runSchemaMigration().then(() => {
  app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
  });
});
