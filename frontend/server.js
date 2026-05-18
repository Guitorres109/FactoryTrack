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
    res.sendFile(path.join(__dirname, "./site/login.html"));
});

app.get("/metaltech", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/index.html"));
});

app.get("/erro", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/inativo.html"));
});

app.get("/assets/img/icon1", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/assets/img/icon1.svg"));
});

app.get("/assets/img/icon2", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/assets/img/icon2.svg"));
});

app.get("/assets/img/icon3", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/assets/img/icon3.svg"));
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

app.get("/js/app.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/app.js"));
});

app.get("/js/api/api.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/api/api.js"));
});

app.get("/js/auth/auth.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/auth/auth.js"));
});

app.get("/js/modules/clientes.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/modules/clientes.js"));
});

app.get("/js/modules/ordens.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/modules/ordens.js"));
});

app.get("/js/modules/produtos.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/modules/produtos.js"));
});

app.get("/js/modules/usuarios.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/modules/usuarios.js"));
});

app.get("/js/services/index.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/services/index.js"));
});

app.get("/js/ui/ui.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/ui/ui.js"));
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