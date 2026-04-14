const PORT = 3010;

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());

// 🌐 Rotas HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/index.html"));
});

app.get("/style/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/style/style.css"));
});

app.get("/style/geral.css", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/style/geral.css"));
});

app.get("/js/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "./site/js/script.js"));
});


// 🚀 Inicia servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});