const express  = require('express');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const auth     = require('../middlewares/auth');
const { Op } = require('sequelize');

const Usuario  = require('../models/usuario');
const Produto  = require('../models/produto');
const Cliente  = require('../models/cliente');
const Ordem = require('../models/ordem');

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
        perfil: usuario.perfil
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
// PRODUTOS
// ================================
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
    const ok = await Produto.delete(req.params.id);
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
    const ok = await Cliente.delete(req.params.id);
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
    const { cliente, itens, observacoes } = req.body;

    if (!cliente || !itens?.length)
      return res.status(400).json({ erro: 'cliente e itens são obrigatórios' });

    const novo = await Ordem.create({
      clienteId: cliente,
      itens,
      observacoes
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
    const ok = await Ordem.delete(req.params.id);
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
    if (req.usuario?.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito' });

    res.json(await Usuario.findAll());

  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

router.post('/usuarios', auth, async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    res.status(201).json(await Usuario.create({ nome, email, senha, perfil }));
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return res.status(400).json({ erro: 'E-mail já cadastrado' });
    res.status(500).json({ erro: e.message });
  }
});

//====================================
//Rota para atualizar ID 
//====================================

router.put('/usuarios/:id', auth, async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrador') {
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    }

    const u = await Usuario.update(req.params.id, req.body);

    if (!u) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(u);
  } catch (e) {
    console.error(e); // 🔥 importante pra debug
    res.status(500).json({ erro: e.message });
  }
});

//====================================
//Rota para deletar os usuarios 
//====================================

router.delete('/usuarios/:id', auth, async (req, res) => {
  try {
    if (req.usuario.perfil !== 'Administrador')
      return res.status(403).json({ erro: 'Acesso restrito a Administradores' });
    const ok = await Usuario.delete(req.params.id);
    if (!ok) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json({ mensagem: 'Usuário deletado' });
  } catch (e) { res.status(500).json({ erro: e.message }); }
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