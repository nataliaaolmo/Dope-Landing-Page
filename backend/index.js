const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs/promises');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM subscribers');
    const count = parseInt(result.rows[0].count, 10);
    res.json({ count });
  } catch (err) {
    console.error('Error al obtener el contador:', err);
    res.status(500).json({ message: 'Error al obtener el contador' });
  }
});

app.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  // Validación simple
  if (!email || !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return res.status(400).json({ message: 'Email inválido' });
  }

  try {
    await pool.query(
      'INSERT INTO subscribers (email, subscribed_at) VALUES ($1, NOW())',
      [email]
    );
    res.status(200).json({ message: 'Email registrado con éxito' });
  } catch (error) {
    if (error.code === '23505') {
      // Código de error PostgreSQL para duplicados
      return res.status(409).json({ message: 'Este email ya está registrado.' });
    }
    console.error('Error al insertar email:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

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
