import * as services from '/services/index.js';

export let TOKEN          = localStorage.getItem('pz_token') || '';
export let USUARIO_LOGADO = JSON.parse(localStorage.getItem('pz_usuario') || 'null');
const telaLogin = document.getElementById("tela-login")

export async function fazerLogin() {
  const email = document.getElementById('l-email').value.trim(); 
  const senha = document.getElementById('l-senha').value;
  const btn   = document.getElementById('btn-login');
  const erro  = document.getElementById('login-erro');
  const tela_erro = document.getElementById('tela-erro')
  const tela_login = document.getElementById('tela-login')

  if (!email || !senha) {
    erro.style.display = 'block';
    erro.textContent   = 'Preencha e-mail e senha.';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Entrando...';
  erro.style.display = 'none';

  try {
    const res  = await fetch(API + '/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Credenciais inválidas');

    // 💾 salva sessão
    localStorage.setItem('pz_token', data.token);
    localStorage.setItem('pz_usuario', JSON.stringify(data.usuario));
    localStorage.setItem('pz_perfil', data.usuario.perfil);
    window.location.href = '/metaltech';

  } catch (e) {
    erro.style.display = 'block';

    if (e.message === 'Failed to fetch') {
      erro.textContent = 'Erro de conexão com o servidor';
      tela_login.style.display = 'none'
      tela_erro.style.display = 'block'
    } else {
      erro.textContent = e.message;
    }

  } finally {
    btn.disabled    = false;
    btn.textContent = 'Entrar';
  }
}

//====================================
//função de fazer logout
//====================================

export function sair() {
  TOKEN = null;
  USUARIO_LOGADO = null;
  localStorage.removeItem('pz_token');
  localStorage.removeItem('pz_usuario');
  window.location.href = '/';
}

if (TOKEN && USUARIO_LOGADO) {
  aplicarPerfil(USUARIO_LOGADO);
  document.body.classList.add('logado');
}

export function aplicarPerfil(usuario) {
  carregarFoto()
  document.getElementById('sb-nome').textContent   = usuario.nome;
  document.getElementById('sb-perfil').textContent = usuario.perfil;
  const sb_perfil = document.getElementById('sb-perfil')
  const bntCreateOrdens = document.getElementById('novaOrdem')
  const p_ordens = document.getElementById('p-ordens')
  const btn_sm = document.getElementById('btn-sm')

  const perfil  = usuario.perfil;
  const isAdmin = perfil === 'Administrador';
  const isGar   = perfil === 'Garcom';
  const isAten   = perfil === 'Atendente';

  function show(id, visible, type = 'flex') {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? type : 'none';
  }

  function showEl(el, visible, type = 'flex') {
    if (el) el.style.display = visible ? type : 'none';
  }

  if (perfil === 'Atendente'){
    bntCreateOrdens.style.display = 'none'
    btn_sm.style.display = 'none'
    p_ordens.textContent = 'Acompanhe as Ordens de produção'
    sb_perfil.style.background = 'rgba(59,130,246,.18)'
    sb_perfil.style.color = '#93c5fd'
  }

  show('menu-usuarios',   isAdmin, 'block');
  show('btn-usuarios',    isAdmin, 'flex');
  show('sb-group-garcom', isGar,   'block');
  show('btn-nav-mesas',   isGar,   'flex');

  const canShow = isAten || isAdmin;

  showEl(document.querySelector('[onclick*="clientes"]'), canShow);
  showEl(document.querySelector('[onclick*="ordens"]'), canShow);
  showEl(document.querySelector('[onclick*="dashboard"]'), canShow);

  // se for classe:
  showEl(document.querySelector('.sb-group'), canShow, 'block');

  // se também existir um elemento com ID "sb-group":
  showEl(document.getElementById('sb-group'), canShow, 'block');

  const tituloProdutos = document.getElementById('pg-Produtos-titulo');
  const subProdutos    = document.getElementById('pg-Produtos-sub');
  if (tituloProdutos) tituloProdutos.textContent = isAten ? 'Cardápio' : 'Produtos';
  if (subProdutos)    subProdutos.textContent    = isAten ? 'Produtos disponíveis hoje' : 'Gerencie o cardápio';
  show('btn-nova-Produto', !isGar, 'inline-flex');

  show('stat-fat', novaOrdem, 'block');
  show('stat-cli', novaOrdem, 'block');

  ir('dashboard', document.querySelector('[onclick*="dashboard"]'))
}