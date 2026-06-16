const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Estructura para almacenar el último dato actual
let ultimosDatos = {
    temp1ra: 0, temp2da: 0, temp3ra: 0,
    tempAgua: 0, tempAceite: 0, presionAceite: 0,
    fecha: "Esperando Compresor No.1..."
};

// Historial en memoria RAM (Máximo 1440 registros = 4 horas a ritmo de 10s)
let historialDatos = [];
const MAX_HISTORIAL = 1440; 

// CONFIGURACIÓN DE LÍMITES PARA ALERTAS INDUSTRIALES
const LIMITES = {
    temp3ra: { max: 140, msg: "¡ALERTA! Alta temperatura en 3ra Etapa del Compresor No.1" },
    presionAceite: { min: 4.0, msg: "¡ALERTA! Baja presión de aceite en Compresor No.1" }
};

// Ruta GET que recibe los datos del ESP32
app.get('/api/enviar', (req, res) => {
    const { temp1ra, temp2da, temp3ra, tempAgua, tempAceite, presionAceite } = req.query;
    
    // Obtener hora local de México explícitamente sin importar dónde esté el servidor
    const horaActual = new Date().toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City" });

    // IMPORTANTE: parseFloat() convierte el texto a número puro para Chart.js
    ultimosDatos = {
        temp1ra: parseFloat(temp1ra) || 0,
        temp2da: parseFloat(temp2da) || 0,
        temp3ra: parseFloat(temp3ra) || 0,
        tempAgua: parseFloat(tempAgua) || 0,
        tempAceite: parseFloat(tempAceite) || 0,
        presionAceite: parseFloat(presionAceite) || 0,
        fecha: horaActual
    };

    // Agregar al historial asegurando que sean números puros
    historialDatos.push({ ...ultimosDatos });
    if (historialDatos.length > MAX_HISTORIAL) {
        historialDatos.shift(); // Borra el más antiguo si excede las 4 horas
    }

    // Monitoreo de alertas en consola de Render
    evaluarAlertas(ultimosDatos);

    res.status(200).json({ estatus: "COMPRESOR_OK" });
});

function evaluarAlertas(datos) {
    if (datos.temp3ra > LIMITES.temp3ra.max) {
        console.log(`[ALERTA] ${LIMITES.temp3ra.msg}: ${datos.temp3ra} °C`);
    }
    if (datos.presionAceite < LIMITES.presionAceite.min) {
        console.log(`[ALERTA] ${LIMITES.presionAceite.msg}: ${datos.presionAceite} PSI`);
    }
}

// Ruta para obtener el historial numérico completo de 4 horas
app.get('/api/historial', (req, res) => {
    res.json(historialDatos);
});

app.get('/api/datos', (req, res) => {
    res.json(ultimosDatos);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor industrial corriendo en puerto ${PORT}`);
});
