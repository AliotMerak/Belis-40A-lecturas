const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// OBLIGATORIO: Permitir que Express entienda el texto JSON que manda el ESP32
app.use(express.json());

// Almacenamiento temporal en la memoria RAM del servidor
let ultimosDatos = {
    temp1ra: "0", temp2da: "0", temp3ra: "0",
    tempAgua: "0", tempAceite: "0", presionAceite: "0",
    fecha: "Esperando arranque de Compresor No.2..."
};

// AHORA USAMOS GET: Recibe las variables directamente en la URL
app.get('/api/enviar', (req, res) => {
    const { temp1ra, temp2da, temp3ra, tempAgua, tempAceite, presionAceite } = req.query;
    
    ultimosDatos = {
        temp1ra: temp1ra || "0",
        temp2da: temp2da || "0",
        temp3ra: temp3ra || "0",
        tempAgua: tempAgua || "0",
        tempAceite: tempAceite || "0",
        presionAceite: presionAceite || "0",
        fecha: new Date().toLocaleTimeString()
    };
    
    res.status(200).json({ estatus: "COMPRESOR_OK" });
});

// Mapear la ruta que el navegador usará mediante GET cada 3 segundos
app.get('/api/datos', (req, res) => {
    res.json(ultimosDatos);
});

// Servir la interfaz visual HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar la escucha en el puerto asignado por Render
app.listen(PORT, () => {
    console.log(`API en línea y escuchando en el puerto ${PORT}`);
});
