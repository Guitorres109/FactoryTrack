require('dotenv').config();

const os = require('os');
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require("helmet");
const { Server } = require('socket.io');
const app = express();
const PORT = process.env.PORT || 3000;
const { ready } = require('./src/database/sqlite');
const routes = require('./src/routes/routes');
let IP = null;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
  const ua = req.get("User-Agent") || "";
  if (ua.includes("curl") || ua.includes("python-requests")) {
    return res.status(403).json({ error: "Acesso bloqueado por firewall" });
  }
  next();
});

function obterIP() {
  const interfaces = os.networkInterfaces();

  for (const iface in interfaces) {
    if (iface.toLowerCase() === 'ethernet 3') {
      for (const ifaceDetails of interfaces[iface]) {
        if (ifaceDetails.family === 'IPv4' && !ifaceDetails.internal) {
          IP = ifaceDetails.address;
          return IP;
        }
      }
    }
  }
  return 'Adaptador Ethernet 3 não encontrado ou sem IP atribuído';
}

ready.then(() => {

  // =========================
  // HTTP + SOCKET.IO SERVER
  // =========================
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // =========================
  // CONEXÕES WEBSOCKET
  // =========================
  function printUsers() {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`Usuarios conectados: ${io.sockets.sockets.size}`);
  }

  io.on('connection', (socket) => {
    printUsers();

    socket.on('disconnect', () => {
      printUsers();
    });
  });

  // =========================
  // ROTAS
  // =========================
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src/pages/api.html"));
  });

  app.get("/docs", (req, res) => {
    res.sendFile(path.join(__dirname, "src/pages/documentacao.html"));
  });

  app.get("/api/verificar", (req, res) => {
    res.json({
      status: "success",
      message: "Servidor está online e respondendo!"
    });
  });

  app.use('/api', routes);

  app.use("/api/uploads",
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    express.static(path.join(__dirname, "src/database/uploads"))
  );

  // =========================
  // FUNÇÃO GLOBAL DE NOTIFICAÇÃO
  // =========================
  global.io = io;

  global.sync = (entity) => {
    io.emit('sync', { entity });
  };

  // =========================
  // START SERVER
  // =========================
  server.listen(PORT, () => {
    obterIP();

    console.log('=================================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse em: http://${IP}:${PORT}/api`);
    console.log('WebSocket ativo ✔');
    console.log('=================================');
  });

}).catch(err => {
  console.error('Erro ao inicializar banco:', err);
  process.exit(1);
});