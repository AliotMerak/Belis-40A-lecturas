const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Registro instantáneo actual
let ultimosDatos = {
    temp1ra: 0, temp2da: 0, temp3ra: 0,
    tempAgua: 0, tempAceite: 0, presionAceite: 0,
    fecha: "Esperando Compresor No.1..."
};

// Historial en memoria RAM (960 muestras = 8 horas a ritmo de 30 segundos)
let historialDatos = [];
const MAX_HISTORIAL = 960; 

app.get('/api/enviar', (req, res) => {
    const { temp1ra, temp2da, temp3ra, tempAgua, tempAceite, presionAceite } = req.query;
    
    // Captura estricta con la hora local de México configurada en Render
    const horaActual = new Date().toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City" });

    ultimosDatos = {
        temp1ra: parseFloat(temp1ra) || 0,
        temp2da: parseFloat(temp2da) || 0,
        temp3ra: parseFloat(temp3ra) || 0,
        tempAgua: parseFloat(tempAgua) || 0,
        tempAceite: parseFloat(tempAceite) || 0,
        presionAceite: parseFloat(presionAceite) || 0,
        fecha: horaActual
    };

    // Almacenamiento en matriz histórica
    historialDatos.unshift({ ...ultimosDatos }); // .unshift inserta al inicio para ver lo más nuevo primero
    
    if (historialDatos.length > MAX_HISTORIAL) {
        historialDatos.pop(); // Elimina el registro más antiguo (exceso de 8 horas)
    }

    res.status(200).json({ estatus: "COMPRESOR_OK" });
});

// Ruta pública para que la web descargue las 960 filas del historial
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
    console.log(`Servidor de registro histórico activo en puerto ${PORT}`);
});
