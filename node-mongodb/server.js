// Importar el módulo Express
const express = require("express");
const app = express();

const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");


// Configurar el número de puerto para el servidor
const PORT = process.env.PORT || 3000;

// Configurar el middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next(); // Pasar al siguiente middleware o ruta
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la API del Supermercado");
});

// 4)a. Ruta para obtener todos los Artículos del Supermercado
app.get("/articulos", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección del supermercado y convertir los documentos a un array
    const db = client.db("supermercado");
    const articulos = await db.collection("supermercado").find().toArray();
    res.json(articulos);
  } catch (error) {
    // Manejo de errores al obtener los artículos del supermercado
    res.status(500).send("Error al obtener los artículos de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// 4)b. Ruta para obtener un artículo del supermercado por su Código
app.get("/articulo/:codigo", async (req, res) => {
  const articuloCod = parseInt(req.params.codigo);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de artículos del supermercado y buscar el artículo por su Código
    const db = client.db("supermercado");
    const articulo = await db.collection("supermercado").findOne({ codigo: articuloCod });
    if (articulo) {
      res.json(articulo);
    } else {
      res.status(404).send("Artículo no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el artículo del supermercado 
    res.status(500).send("Error al obtener el artículo de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// 4)c. Ruta para obtener un artículo del supermercado por su nombre
app.get("/articulos/nombre/:nombre", async (req, res) => {
  const articuloQuery = req.params.nombre.toLowerCase(); // 5) utilizo metodo.tolowerCase, porque un usuario puede mandar un parametro en minúscula o mayúscula
  let articuloNombre = RegExp(articuloQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección del supermercado y buscar el artículo por su Nombre
    const db = client.db("supermercado");
    const articulos = await db
      .collection("supermercado")
      .find({ nombre: articuloNombre })
      .toArray();
    
    if (articulos.length > 0) {
      res.json(articulos);
    } else {
      res.status(404).send("Artículo no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener un artículo
    res.status(500).send("Error al obtener un artículo  de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

//  4)d. Ruta para obtener los artículos del supermercado por su categoría
app.get("/articulos/categoria/:categoria", async (req, res) => {
  const articuloQuery = req.params.categoria.toLowerCase(); // 5) utilizo metodo.tolowerCase, porque un usuario puede mandar un parametro en minúscula o mayúscula
  let articuloCategoria = RegExp(articuloQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de artículos del supermercado y buscar los artículos por su categoría
    const db = client.db("supermercado");
    const articulos = await db
      .collection("supermercado")
      .find({ categoria: articuloCategoria })
      .toArray();

    if (articulos.length > 0) {
      res.json(articulos);
    } else {
      res.status(404).send("Artículos no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener un artículo del supermercado
    res.status(500).send("Error al obtener un artículo de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// 4)e. Ruta para crear un nuevo artículo del supermercado
app.post("/articulos", async (req, res) => {
  const nuevoArticulo = req.body;
  try {
    if (nuevoArticulo === undefined) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("supermercado");
    const collection = db.collection("supermercado");
    await collection.insertOne(nuevoArticulo);
    console.log("Nuevo Artículo Creado");
    res.status(201).send(nuevoArticulo);
  } catch (error) {
    // Manejo de errores al agregar el artículo del supermercado
    res.status(500).send("Error al intentar crear un nuevo Artículo");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// 4)f. Ruta para modificar solo el precio de un artículo del supermercado
app.patch("/articulos/:codigo", async (req, res) => {
  const articuloCod = parseInt(req.params.codigo);
  const nuevosDatos = req.body.precio;
  try {
    if (!nuevosDatos) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }
    // Obtener la colección de artículos del supermercado, buscar el artículo por su código y modificar su precio
    const db = client.db("supermercado");
    const collection = db.collection("supermercado");

    await collection.updateOne({ codigo: articuloCod }, { $set:{precio:nuevosDatos}});

    console.log("Artículo Modificado");
    res.status(200).send({precio:nuevosDatos});
  
  } catch (error) {
    // Manejo de errores al modificar un artículo del supermercado
    res.status(500).send("Error al modificar el Artículo");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// 4)g. Ruta para eliminar un artículo del supermercado
app.delete("/articulo/:codigo", async (req, res) => {
  const codigoArticulo = parseInt(req.params.id);
  try {
    if (!codigoArticulo) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de artículos del supermercado, buscar el artículo por su código y eliminarlo
    const db = client.db("supermercado");
    const collection = db.collection("supermercado");
    const resultado = await collection.deleteOne({ codigo: codigoArticulo });
    if (resultado.deletedCount === 0) {
      res
        .status(404)
        .send("No se encontró ningún artículo con el código seleccionado.");
    } else {
      console.log("Artículo Eliminado");
      res.status(204).send();
    }
  } catch (error) {
    // Manejo de errores al obtener los Artículos
    res.status(500).send("Error al eliminar el Artículo");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

 // 4)h. Ruta para manejar las solicitudes a rutas no existentes o erroneas
 app.get("*", (req, res) => {
  res.status(404).send("Lo sentimos, la página que buscas no existe.");
});

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
