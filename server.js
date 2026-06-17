const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let ultimosDatos = {
    temp1ra: 0, temp2da: 0, temp3ra: 0,
    tempAgua: 0, tempAceite: 0, presionAceite: 0,
    fecha: "Esperando Compresor..."
};

// Historial en RAM (960 muestras = 16 horas con intervalos de 1 minuto)
let historialDatos = [];
const MAX_HISTORIAL = 960; 

// Variable auxiliar para controlar el almacenamiento histórico de un minuto
let ultimoMinutoRegistrado = "";

app.get('/api/enviar', (req, res) => {
    const { temp1ra, temp2da, temp3ra, tempAgua, tempAceite, presionAceite } = req.query;
    
    // Obtener marcas de tiempo local de México
    const ahora = new Date();
    const horaCompleta = ahora.toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City" });
    
    // Formato de hora limpio sin segundos para la tabla (Ej: 17:05 o 05:05 PM según navegador)
    const horaSinSegundos = ahora.toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City", hour: '2-digit', minute: '2-digit' });
    const fechaCompleta = ahora.toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" });

    ultimosDatos = {
        temp1ra: parseFloat(temp1ra) || 0,
        temp2da: parseFloat(temp2da) || 0,
        temp3ra: parseFloat(temp3ra) || 0,
        tempAgua: parseFloat(tempAgua) || 0,
        tempAceite: parseFloat(tempAceite) || 0,
        presionAceite: parseFloat(presionAceite) || 0,
        fecha: horaCompleta // Para las tarjetas mantiene el dinamismo total con segundos
    };

    // --- FILTRO DE ENTRADA INDUSTRIAL HISTÓRICA (1 MUESTRA POR MINUTO) ---
    if (horaSinSegundos !== ultimoMinutoRegistrado) {
        ultimoMinutoRegistrado = horaSinSegundos;

        historialDatos.unshift({
            ...ultimosDatos,
            fechaTabla: `${fechaCompleta} ${horaSinSegundos}` // Almacena Día y Hora sin segundos para la tabla
        });

        if (historialDatos.length > MAX_HISTORIAL) {
            historialDatos.pop(); // Mantener ventana estricta de las últimas 16 horas
        }
    }

    res.status(200).json({ estatus: "COMPRESOR_OK" });
});

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
    console.log(`Servidor industrial optimizado a 16 Horas corriendo en puerto ${PORT}`);
});
