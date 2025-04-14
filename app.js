const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const PORT = 8000;
app.use(express.json());

// Conexión a la base de datos sqlite
const db = new sqlite3.Database('./mi_base.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a la base de datos SQLite');
});

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    firstname TEXT NOT NULL,
	lastname TEXT NOT NULL,
	gender TEXT NOT NULL,
	age TEXT 
  )
`);

// Ruta GET - obtener todos los estudiantes
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, filas) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(filas);
  });
});

// Ruta POST - crear un nuevo estudiante
app.post('/students', (req, res) => {
  const { firstname, lastname, gender, age } = req.body;
  if (!firstname || !lastname || !gender) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  db.run('INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)', 
    [firstname, lastname, gender, age], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
        id: this.lastID,
        firstname,
        lastname,
        gender,
        age
    });
  });
});

// Ruta PUT - actualizar un estudiante
app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, gender, age } = req.body;
  
    db.run(
      'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?',
      [firstname, lastname, gender, age, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
        res.json({ id, firstname, lastname, gender, age });
      }
    );
  });

// Ruta DELETE - eliminar un estudiante
app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
  
    db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
      res.json({ mensaje: 'Estudiante eliminado' });
    });
  });

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});