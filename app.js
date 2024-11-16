const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;

// Cargar variables de entorno desde .env
require('dotenv').config();

// Conexión a MongoDB
 //conexion local   /*mongoose.connect('mongodb://localhost:27017/CatalogoAlumnos', {  */
 mongoose.connect(process.env.MONGO_URI, {
})
.then(() => {
  console.log('Conexión exitosa a MongoDB');
})
.catch(err => console.error('Error de conexión a MongoDB', err));

// Esquema de la colección Estudiantes
const estudianteSchema = new mongoose.Schema({
  nombre: String,
  edad: Number,
  carrera: String,
  promedio: Number,
  materias: [
    {
      nombre: String,
      calificacion: Number
    }
  ]
}, { collection: 'Estudiantes' });

const Estudiante = mongoose.model('Estudiantes', estudianteSchema);

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Nueva ruta para obtener todos los estudiantes en formato JSON
app.get('/api/estudiantes', async (req, res) => {
  try {
    const estudiantes = await Estudiante.find(); // Obtiene todos los estudiantes
    res.json(estudiantes); // Responde con JSON
  } catch (error) {
    res.status(500).send('Error al obtener los estudiantes, el servidor esta apagado');
  }
});

// Middleware para parsear JSON en las solicitudes
app.use(express.json());



//PARA LA ACTUALIZACIÓN
// Ruta para obtener los datos de un estudiante específico
app.get('/api/estudiantes/:id', async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id);
    if (!estudiante) {
      return res.status(404).send('Estudiante no encontrado');
    }
    res.json(estudiante); // Enviar los datos del estudiante
  } catch (error) {
    res.status(500).send('Error al obtener los datos del estudiante, servidor apagado');
  }
});


// Ruta para actualizar un estudiante
app.put('/api/estudiantes/:id', async (req, res) => {
  const { nombre, edad, carrera, promedio } = req.body;

  try {
    // Encuentra al estudiante por ID y actualiza los campos
    const estudianteActualizado = await Estudiante.findByIdAndUpdate(
      req.params.id,
      { nombre, edad, carrera, promedio },
      { new: true } // Devuelve el documento actualizado
    );

    if (!estudianteActualizado) {
      return res.status(404).send('Estudiante no encontrado');
    }

    res.json(estudianteActualizado); // Devuelve el estudiante actualizado
  } catch (error) {
    res.status(500).send('Error al actualizar el estudiante');
  }
});

//PARA ELIMINAR
// Ruta para eliminar un estudiante
app.delete('/api/estudiantes/:id', async (req, res) => {
  try {
    const estudianteEliminado = await Estudiante.findByIdAndDelete(req.params.id);
    if (!estudianteEliminado) {
      return res.status(404).send('Estudiante no encontrado');
    }
    res.json({ message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    res.status(500).send('Error al eliminar el estudiante');
  }
});

app.post('/api/estudiantes', async (req, res) => {
  try {
    let jsonData = req.body;

    // Si no es un array, lo convierte en uno
    if (!Array.isArray(jsonData)) {
      jsonData = [jsonData];
    }

    // Insertar datos en la base de datos
    const estudiantesAgregados = await Estudiante.insertMany(jsonData);
    res.status(201).json({
      message: 'Datos subidos y agregados a la base de datos con éxito',
      estudiantes: estudiantesAgregados
    });
  } catch (error) {
    console.error('Error al agregar los datos a la base de datos:', error);
    res.status(500).json({ message: 'Hubo un error al procesar los datos' });
  }
});




app.get('/registro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});


// Servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));




// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/registro.html`);
});
