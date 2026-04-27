const PORT = 3010;

const os = require('os');
const express = require("express");
const cors = require("cors");
const path = require("path");
let IP = null

const app = express();

app.use(cors());

// 🌐 Rotas HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/index.html"));
});

app.get("/style/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/style/style.css"));
});

app.get("/style/responsividade.css", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/style/responsividade.css"));
});
app.get("/style/geral.css", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/style/geral.css"));
});

app.get("/js/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/script.js"));
});

function obterIP() {
  // Obtém as interfaces de rede
  const interfaces = os.networkInterfaces();

  // Itera pelas interfaces
  for (const iface in interfaces) {
    if (iface.toLowerCase() === 'ethernet 3') { // verifica o nome do adaptador
      for (const ifaceDetails of interfaces[iface]) {
        // Filtra a interface IPv4 e que esteja ativa (não "internal")
        if (ifaceDetails.family === 'IPv4' && !ifaceDetails.internal) {
            IP = ifaceDetails.address; 
            return IP // Retorna o IP
        }
      }
    }
  }
  return 'Adaptador Ethernet 3 não encontrado ou sem IP atribuído';
}

// 🚀 Inicia servidor
app.listen(PORT, "0.0.0.0", () => {
    obterIP()
    console.log(`Frontend rodando em http://${IP}:${PORT}`);
});