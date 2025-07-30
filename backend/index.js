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

// GET /count – número total de correos
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

// POST /subscribe – guardar suscripción
app.post('/subscribe', async (req, res) => {
  const { name, email, phone, interests } = req.body;

  // Validaciones
  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y email son requeridos' });
  }

  if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return res.status(400).json({ message: 'Email inválido' });
  }

  // Validar formato de teléfono si se proporciona
  if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ message: 'Formato de teléfono inválido' });
  }

  try {
    await pool.query(
      'INSERT INTO subscribers (name, email, phone_number, interests, subscribed_at) VALUES ($1, $2, $3, $4, NOW())',
      [name, email, phone || null, interests || null]
    );
    res.status(200).json({ message: 'Suscripción registrada con éxito' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Este email ya está registrado.' });
    }
    console.error('Error al insertar suscripción:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ejecutar schema.sql al iniciar
async function runSchemaMigration() {
  try {
    const schema = await fs.readFile('./schema.sql', 'utf8');
    await pool.query(schema);
    console.log('✅ Tabla comprobada/creada correctamente.');
  } catch (err) {
    console.error('❌ Error ejecutando schema.sql:', err);
  }
}

runSchemaMigration().then(() => {
  app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
  });
});
