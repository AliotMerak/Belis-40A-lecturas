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

// --- BASE DE DATOS CENTRAL DE SETPOINTS EN RED ---
let setpointsCentrales = {
    temp1ra: 185,
    temp2da: 239,
    temp3ra: 284,
    tempAgua: 107,
    tempAceite: 161,
    presionAceite: 2.8
};

let historialDatos = [];
const MAX_HISTORIAL = 960; 
let ultimoMinutoRegistrado = "";

app.get('/api/enviar', (req, res) => {
    const { temp1ra, temp2da, temp3ra, tempAgua, tempAceite, presionAceite } = req.query;
    
    const ahora = new Date();
    const horaCompleta = ahora.toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City" });
    const horaSinSegundos = ahora.toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City", hour: '2-digit', minute: '2-digit' });
    const fechaCompleta = ahora.toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" });

    ultimosDatos = {
        temp1ra: parseFloat(temp1ra) || 0,
        temp2da: parseFloat(temp2da) || 0,
        temp3ra: parseFloat(temp3ra) || 0,
        tempAgua: parseFloat(tempAgua) || 0,
        tempAceite: parseFloat(tempAceite) || 0,
        presionAceite: parseFloat(presionAceite) || 0,
        fecha: horaCompleta
    };

    if (horaSinSegundos !== ultimoMinutoRegistrado) {
        ultimoMinutoRegistrado = horaSinSegundos;
        historialDatos.unshift({
            ...ultimosDatos,
            fechaTabla: `${fechaCompleta} ${horaSinSegundos}`
        });
        if (historialDatos.length > MAX_HISTORIAL) { historialDatos.pop(); }
    }
    res.status(200).json({ estatus: "COMPRESOR_OK" });
});

// Ruta para que los navegadores descarguen los setpoints actuales de la red
app.get('/api/setpoints', (req, res) => {
    res.json(setpointsCentrales);
});

// Ruta para que cualquier laptop/celular actualice los setpoints en la nube
app.get('/api/setpoints/actualizar', (req, res) => {
    const { temp1ra, temp2da, temp3ra, tempAgua, tempAceite, presionAceite } = req.query;
    if(temp1ra) setpointsCentrales.temp1ra = parseFloat(temp1ra);
    if(temp2da) setpointsCentrales.temp2da = parseFloat(temp2da);
    if(temp3ra) setpointsCentrales.temp3ra = parseFloat(temp3ra);
    if(tempAgua) setpointsCentrales.tempAgua = parseFloat(tempAgua);
    if(tempAceite) setpointsCentrales.tempAceite = parseFloat(tempAceite);
    if(presionAceite) setpointsCentrales.presionAceite = parseFloat(presionAceite);
    
    res.json({ estatus: "SETPOINTS_ACTUALIZADOS_EN_RED" });
});

app.get('/api/historial', (req, res) => { res.json(historialDatos); });
app.get('/api/datos', (req, res) => { res.json(ultimosDatos); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

app.listen(PORT, () => { console.log(`Servidor en puerto ${PORT}`); });
