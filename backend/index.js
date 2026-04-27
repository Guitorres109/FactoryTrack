require('dotenv').config();  //Importa o aruivo .env

const os = require('os');
const express = require('express');   //importa o express
const cors    = require('cors');  //importa o cors
const path    = require('path');   //importa o path

const app  = express();  //Adiciona o express a uma variavel
const PORT = process.env.PORT || 3000;   //porta
let IP = null

app.use(cors());
app.use(express.json());

const { ready } = require('./src/database/sqlite');  //importa requisições do banco de dados
const routes    = require('./src/routes/routes');   //importa as rotas no arquivo de rotas

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


ready.then(() => {
  app.get("/api", (req, res) => {
    res.sendFile(path.join(__dirname, "src/pages/api.html"));
  });
  
  app.get("/api/verificar", (req, res) => {
      res.json({
          status: "success",
          message: "Servidor está online e respondendo!"
      });
  });

  app.use('/api', routes);  //define /api/(rota) para requisições da API


  app.listen(PORT, () => {  
    obterIP()
    console.log('=================================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse em: http://${IP}:${PORT}/api`);
    console.log('=================================');
  });
}).catch(err => {
  console.error('Erro ao inicializar banco:', err);
  process.exit(1);
});