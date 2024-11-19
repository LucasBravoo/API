const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const bodyP = bodyParser.json();
const app = express();
app.use(bodyP); // Middleware para parsear solicitudes con contenido tipo JSON
const port = 3000;

// Función para leer datos de la base de datos (archivo JSON)
const leerDatos = () => {
    try {
        const datos = fs.readFileSync("./datos.json");
        return JSON.parse(datos); // Convierte la cadena JSON a objeto
    } catch (error) {
        console.log(error); // Manejo de errores en la lectura
    }
}

// Función para escribir datos en la base de datos (archivo JSON)
const escribir = (datos) => {
    try {
        fs.writeFileSync("./datos.json", JSON.stringify(datos)); // Convierte objeto a JSON y lo guarda
    } catch (error) {
        console.log(error); // Manejo de errores en la escritura
    }
}

// Ruta raíz que devuelve un mensaje simple
app.get('/', (req, res) => {
    res.send("API escuchando en el puerto 3000");
});

// Eventos
// Muestra todos los eventos
app.get('/Evento', (req, res) => {
    const datos = leerDatos();
    res.json(datos.evento);
});

// Busca evento por su ID
app.get('/BuscarEvento/:idEvento', (req, res) => {
    const datos = leerDatos();
    const idEvento = parseInt(req.params.idEvento); // Recupera el ID del parámetro
    const evento = datos.eventos.find((evento) => evento.idEvento === idEvento);
    if (evento) {
        res.json(evento);
    } else {
        res.status(404).send("Evento no encontrado."); // Mensaje de error si no se encuentra el evento
    }
});

// Actualiza un evento
app.put('/ActualizarEvento/:idEvento', (req, res) => {
    const datos = leerDatos();
    const body = req.body;
    const idEvento = parseInt(req.params.idEvento);
    const buscarIndex = datos.eventos.findIndex((evento) => evento.idEvento === idEvento);
    datos.eventos[buscarIndex] = {
        ...datos.eventos[buscarIndex],
        ...body, // Actualiza el evento con los nuevos datos
    };
    escribir(datos);
    res.json({ message: "Actualizado" });
});

// Cambia el estado de un evento
app.delete('/EstadoEvento/:idEvento', (req, res) => {
    const datos = leerDatos();
    const idEvento = parseInt(req.params.idEvento);
    const evento = datos.eventos.find((evento) => evento.idEvento === idEvento);
    if (evento) {
        let estado = evento.estado;
        if (estado === "Sin entregar") {
            evento.estado = "Entregado"; // Cambia el estado del evento
        } else {
            res.status(500).send("No se puede cambiar el evento."); // Mensaje de error si no se puede cambiar
        }
        escribir(datos);
        res.json({ message: "Evento cambiado" });
    }
});

// Carga un nuevo evento
app.post('/Subirevento', (req, res) => {
    const datos = leerDatos();
    let evento = datos.evento;
    let ultimoEvento = evento[datos.evento.length - 1];
    const body = req.body;
    const nuevoEvento = {
        idEvento: ultimoEvento.idEvento + 1, // Genera un nuevo ID automáticamente
        ...body,
    };
    datos.evento.push(nuevoEvento);
    escribir(datos);
    res.json(nuevoEvento);
});

// Participantes
// Muestra todos los participantes
app.get('/ListarParticipantes', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    res.json(datos.participante); // Devuelve la lista de participantes
});

// Busca participante por su DNI
app.get('/Buscarparticipante/:dni', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    const id = parseInt(req.params.dni); // Obtiene el DNI del parámetro
    const participante = datos.participantes.find((p) => p.id === id); // Busca el participante
    if (participante) {
        res.json(participante); // Devuelve el participante encontrado
    } else {
        res.status(404).send("Participante no encontrado."); // Error si no se encuentra
    }
});

// Carga un nuevo participante
app.post('/SubirParticipante', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    const body = req.body; // Obtiene el cuerpo de la solicitud
    const nuevoParticipante = {
        id_participante: datos.participante.length + 1, // Genera un nuevo ID
        ...body, // Agrega los datos del nuevo participante
    };
    datos.participante.push(nuevoParticipante); // Agrega el nuevo participante a la lista
    escribir(datos); // Guarda los datos actualizados
    res.json(nuevoParticipante); // Devuelve el nuevo participante
});

// Actualiza un participante
app.put('/ActualizarParticipante/:id', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    const body = req.body; // Obtiene el cuerpo de la solicitud
    const id = parseInt(req.params.id); // Obtiene el ID del parámetro
    const buscarIndex = datos.participante.findIndex((p) => p.id === id); // Busca el índice del participante
    datos.participante[buscarIndex] = {
        ...datos.participante[buscarIndex], // Mantiene los datos existentes
        ...body, // Actualiza con los nuevos datos
    };
    escribir(datos); // Guarda los datos actualizados
    res.json({ message: "Actualizado" }); // Responde con un mensaje de éxito
});

// Cambia el estado de un participante
app.delete('/EliminarParticipante/:id', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    const id = parseInt(req.params.id); // Obtiene el ID del parámetro
    const participante = datos.participante.find((p) => p.id === id); // Busca el participante
    if (participante) {
        let estado = participante.estado; // Obtiene el estado del participante
        if (estado === "Activo") {
            participante.estado = "Inactivo"; // Cambia el estado
        } else {
            res.status(500).send("No se puede cambiar el estado del participante."); // Error si no se puede cambiar
            return; // Sale de la función
        }
        escribir(datos); // Guarda los datos actualizados
        res.json({ message: "Estado cambiado" }); // Responde con un mensaje de éxito
    }
});

// Lugares
// Muestra todos los lugares
app.get('/Lugares', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    res.json(datos.lugares); // Devuelve la lista de lugares
});

// Busca lugar por su ID
app.get('/BuscarLugar/:idLugar', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    const idLugar = parseInt(req.params.idLugar); // Obtiene el ID del parámetro
    const lugar = datos.lugares.find((l) => l.idLugar === idLugar); // Busca el lugar
    if (lugar) {
        res.json(lugar); // Devuelve el lugar encontrado
    } else {
        res.status(404).send("Lugar no encontrado."); // Error si no se encuentra
    }
});

// Actualiza un lugar
app.put('/ActualizarLugar/:idLugar', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    const body = req.body; // Obtiene el cuerpo de la solicitud
    const idLugar = parseInt(req.params.idLugar); // Obtiene el ID del parámetro
    const buscarIndex = datos.lugares.findIndex((l) => l.idLugar === idLugar); // Busca el índice del lugar
    datos.lugares[buscarIndex] = {
        ...datos.lugares[buscarIndex], // Mantiene los datos existentes
        ...body, // Actualiza con los nuevos datos
    };
    escribir(datos); // Guarda los datos actualizados
    res.json({ message: "Actualizado" }); // Responde con un mensaje de éxito
});

// Cambia el estado del lugar
app.delete('/EstadoLugar/:idLugar', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    const idLugar = parseInt(req.params.idLugar); // Obtiene el ID del parámetro
    const lugar = datos.lugares.find((l) => l.idLugar === idLugar); // Busca el lugar
    if (lugar) {
        let estado = lugar.estado; // Obtiene el estado del lugar
        if (estado === "Sin entregar") {
            lugar.estado = "Entregado"; // Cambia el estado
        } else {
            res.status(500).send("No se puede cambiar el estado del lugar."); // Error si no se puede cambiar
            return; // Sale de la función
        }
        escribir(datos); // Guarda los datos actualizados
        res.json({ message: "Lugar cambiado" }); // Responde con un mensaje de éxito
    }
});

// Carga un nuevo lugar
app.post('/SubirLugar', (req, res) => {
    const datos = leerDatos(); // Lee los datos
    const lugar = datos.lugares; // Accede a la lista de lugares
    const ultimoLugar = lugar[lugar.length - 1]; // Obtiene el último lugar
    const body = req.body; // Obtiene el cuerpo de la solicitud
    const nuevoLugar = {
        idLugar: ultimoLugar.idLugar + 1, // Genera un nuevo ID automáticamente
        ...body, // Agrega los datos del nuevo lugar
    };
    datos.lugares.push(nuevoLugar); // Agrega el nuevo lugar a la lista
    escribir(datos); // Guarda los datos actualizados
    res.json(nuevoLugar); // Devuelve el nuevo lugar
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`); // Mensaje de inicio
});