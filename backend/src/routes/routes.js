const express  = require('express');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const auth     = require('../middlewares/auth');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📁 configuração de armazenamento

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../database/uploads/usuarios'));
  },
  filename: (req, file, cb) => {
    const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, nomeUnico + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const Usuario  = require('../models/usuario');
const Produto  = require('../models/produto');
const Cliente  = require('../models/cliente');
const Ordem = require('../models/ordem');
const Atividades = require('../models/atividades');

// ================================
// LOGIN
// ================================
router.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const autenticar = (await Usuario.findByEmail(email))?.ativo;

    if (!email || !senha)
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });

    if (autenticar === 0)
      return res.status(400).json({ erro: 'Este Usuario esta com o perfil inativo' });

    const usuario = await Usuario.findByEmail(email);
    if (!usuario)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const ok = await Usuario.verificarSenha(senha, usuario.senha);
    if (!ok)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        foto: usuario.foto
      }
    });

  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/auth/me', auth, (req, res) => {
  res.json(req.usuario);
});

// ================================
// ATIVIDADES
// ================================
router.get('/atividades', auth, async (req, res) => {
  try {
    res.json(await Atividades.findAll());
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.delete('/atividades/:id', auth, async (req, res) => {
  try {
    res.json(await Atividades.delete(req.params.id));
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/produtos', auth, async (req, res) => {
  try {
    res.json(await Produto.findAll());
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/produtos/:id', auth, async (req, res) => {
  try {
    const p = await Produto.findById(req.params.id);
    if (!p) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(p);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.post('/produtos', auth, async (req, res) => {
  try {
    if (!req.body.nome)
      return res.status(400).json({ erro: 'Nome é obrigatório' });

    const novo = await Produto.create(req.body);
    res.status(201).json(novo);

  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.put('/produtos/:id', auth, async (req, res) => {
  try {
    const p = await Produto.update(req.params.id, req.body);
    if (!p) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(p);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.delete('/produtos/:id', auth, async (req, res) => {
  try {
    const ok = await Produto.delete(req.params.id, req.body.usuarioId);
    if (!ok) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json({ mensagem: 'Produto deletado' });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ================================
// CLIENTES
// ================================

router.get('/clientes', auth, async (req, res) => {
  try {
    res.json(await Cliente.findAll());
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/clientes/:id', auth, async (req, res) => {
  try {
    const c = await Cliente.findById(req.params.id);
    if (!c) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(c);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.post('/clientes', auth, async (req, res) => {
  try {
    if (!req.body.nome || !req.body.telefone)
      return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' });

    const novo = await Cliente.create(req.body);
    res.status(201).json(novo);

  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.put('/clientes/:id', auth, async (req, res) => {
  try {
    const c = await Cliente.update(req.params.id, req.body);
    if (!c) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(c);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.delete('/clientes/:id', auth, async (req, res) => {
  try {
    const ok = await Cliente.delete(req.params.id, req.body.usuarioId);
    if (!ok) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json({ mensagem: 'Cliente deletado' });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ================================
// PEDIDOS
// ================================
router.get('/ordens', auth, async (req, res) => {
  try {
    res.json(await Ordem.findAll());
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/ordens/:id', auth, async (req, res) => {
  try {
    const p = await Ordem.findById(req.params.id);
    if (!p) return res.status(404).json({ erro: 'Ordem não encontrada' });
    res.json(p);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.post('/ordens', auth, async (req, res) => {
  try {
    const { cliente, itens, observacoes, userId } = req.body;
    if (!cliente || !itens?.length)
      return res.status(400).json({ erro: 'cliente e itens são obrigatórios' });

    const novo = await Ordem.create({
      clienteId: cliente,
      itens,
      observacoes,
      userId
    });

    res.status(201).json(novo);

  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

router.patch('/ordens/:id/status', auth, async (req, res) => {
  try {
    const status = req.body.status;

    const validos = ['recebido','em_producao','entregue','cancelado'];

    if (!status || !validos.includes(status))
      return res.status(400).json({ erro: 'Status inválido' });

    const p = await Ordem.updateStatus(req.params.id, status);

    if (!p) return res.status(404).json({ erro: 'Ordem não encontrada' });

    res.json(p);

  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.delete('/ordens/:id', auth, async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.body.userId);
    const ok = await Ordem.delete(req.params.id, req.body.userId);
    if (!ok) return res.status(404).json({ erro: 'Ordem não encontrada' });
    res.json({ mensagem: 'Ordem deletada' });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ================================
// USUÁRIOS
// ================================
router.get('/usuarios', auth, async (req, res) => {
  try {
    // if (req.usuario?.perfil !== 'Administrador')
    //   return res.status(403).json({ erro: 'Acesso restrito' });

    res.json(await Usuario.findAll());

  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/usuarios/:id', auth, async (req, res) => {
  try {
    // if (req.usuario?.perfil !== 'Administrador')
    //   return res.status(403).json({ erro: 'Acesso restrito' });

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.post('/usuarios', auth, upload.single('foto'), async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });

    const { nome, email, senha, perfil, usuarioId } = req.body;

    if (!nome || !email || !senha)
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });

    // 📸 pega o nome do arquivo se existir
    let foto = null;
    if (req.file) {
      foto = req.file.filename;
    }

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha,
      perfil,
      usuarioId,
      foto
    });

    res.status(201).json(novoUsuario);

  } catch (e) {
    if (e.message?.includes('UNIQUE'))
      return res.status(400).json({ erro: 'E-mail já cadastrado' });

    res.status(500).json({ erro: e.message });
  }
});

router.put('/usuarios/:id', auth, upload.single('foto'), async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrador') {
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    }

    const { nome, email, senha, perfil, usuarioId } = req.body;

    const usuarioAtual = await Usuario.findById(req.params.id);
    if (!usuarioAtual) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // 🖼️ mantém a foto atual por padrão
    let fotoPath = usuarioAtual.foto;

    // 🔥 só altera se uma nova foto foi enviada
    if (req.file) {
      const nomeAntigo = req.file.filename;
      const extensao = path.extname(nomeAntigo);

      const novoNome = `${usuarioAtual.nome}_${Date.now()}${extensao}`;

      const caminhoAntigo = path.join(
        __dirname,
        '../database/uploads/usuarios',
        nomeAntigo
      );

      const caminhoNovo = path.join(
        __dirname,
        '../database/uploads/usuarios',
        novoNome
      );

      // 🔁 renomeia o arquivo físico
      fs.renameSync(caminhoAntigo, caminhoNovo);

      // agora sim você atualiza a variável
      fotoPath = novoNome;

      // 🧹 remove foto antiga
      if (usuarioAtual.foto && usuarioAtual.foto !== 'default.png') {
        const caminhoFotoAntiga = path.join(
          __dirname,
          '../database/uploads/usuarios',
          usuarioAtual.foto
        );

        if (fs.existsSync(caminhoFotoAntiga)) {
          try {
            fs.unlinkSync(caminhoFotoAntiga);
          } catch (err) {
            console.error('Erro ao remover foto antiga:', err);
          }
        }
      }
    }

    const u = await Usuario.update(req.params.id, {
      nome,
      email,
      senha,
      perfil,
      usuarioId,
      foto: fotoPath
    });

    res.json(u);

  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: e.message });
  }
});

//====================================
//Rota para atualizar ID 
//====================================

// router.put('/usuarios/:id', auth, async (req, res) => {
//   try {
//     if (req.usuario.perfil !== 'Administrador') {
//       return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
//     }

//     const u = await Usuario.update(req.params.id, req.body);

//     if (!u) {
//       return res.status(404).json({ erro: 'Usuário não encontrado' });
//     }

//     res.json(u);
//   } catch (e) {
//     console.error(e); // 🔥 importante pra debug
//     res.status(500).json({ erro: e.message });
//   }
// });

//====================================
//Rota para deletar os usuarios 
//====================================

router.delete('/usuarios/:id', auth, async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    const ok = await Usuario.delete(req.params.id, req.body.usuarioId);
    if (!ok) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ mensagem: 'Usuário deletado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

router.delete('/usuarios/:id/foto', auth, async (req, res) => {
  try {
    // if (req.usuario.perfil !== 'Administrador') {
    //   return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    // }

    const result = await Usuario.resetFoto(req.params.id);

    if (!result) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    if(result === 'defalt.png'){
      return res.status(404).json({erro: 'Este usuario não possui foto de perfil'})
    }

    res.json({
      mensagem: 'Foto removida com sucesso',
      usuario: result
    });

  } catch (e) {
    console.error('ERRO COMPLETO:', e);
    res.status(500).json({ erro: e.message });
  }
});

// ================================
// DEBUG
// ================================
router.get('/debug', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    const produtos = await Produto.findAll();
    const clientes = await Cliente.findAll();
    const ordens  = await Ordem.findAll();

    res.json({
      status: 'OK',
      resumo: {
        usuarios: usuarios.length,
        produtos: produtos.length,
        clientes: clientes.length,
        pedidos: ordens.length
      },
      dados: { usuarios, produtos, clientes, ordens }
    });

  } catch (e) {
    res.status(500).json({
      status: 'ERRO',
      mensagem: e.message
    });
  }
});

module.exports = router;