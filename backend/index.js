require('dotenv').config();  //Importa o aruivo .env

const express = require('express');   //importa o express
const cors    = require('cors');  //importa o cors
const path    = require('path');   //importa o path

const app  = express();  //Adiciona o express a uma variavel
const PORT = process.env.PORT || 3000;   //porta

app.use(cors());
app.use(express.json());

const { ready } = require('./src/database/sqlite');  //importa requisições do banco de dados
const routes    = require('./src/routes/routes');   //importa as rotas no arquivo de rotas


ready.then(() => {
  app.get("/api", (req, res) => {
    res.sendFile(path.join(__dirname, "src/pages/api.html"));
  });
  
  app.get("/verificar", (req, res) => {
      res.json({
          status: "success",
          message: "Servidor está online e respondendo!"
      });
  });

  app.use('/api', routes);  //define /api/(rota) para requisições da API


  app.listen(PORT, () => {  
    console.log('=================================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse em: http://localhost:${PORT}/api`);
    console.log('=================================');
  });
}).catch(err => {
  console.error('Erro ao inicializar banco:', err);
  process.exit(1);
});