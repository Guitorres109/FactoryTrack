//====================================
//rota da Api
//====================================

const API = 'http://10.106.208.15:3000/api';

let cProdutos   = [];
let cClientes = [];

//====================================
//Variaveis
//====================================

let TOKEN          = localStorage.getItem('pz_token') || '';
let USUARIO_LOGADO = JSON.parse(localStorage.getItem('pz_usuario') || 'null');
let mesaEmFechamento = null;
const telaLogin = document.getElementById("tela-login")

//====================================
//função de fazer login
//====================================

async function verificar(){
  try{
    const res = await fetch(API + '/verificar');
    const data = await res.json();
    console.log(data.message)
  } catch(e){
    console.log('Servidor Inativo')
    alert('Erro de conexão com o Servidor')
  }
}
verificar()

async function fazerLogin() {
  //Variaveis de elementos do HTML
  const email = document.getElementById('l-email').value.trim(); 
  const senha = document.getElementById('l-senha').value;
  const btn   = document.getElementById('btn-login');
  const erro  = document.getElementById('login-erro');

  if (!email || !senha) {
    erro.style.display = 'block';
    erro.textContent   = 'Preencha e-mail e senha.';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Entrando...';
  erro.style.display = 'none';
  telaLogin.style.display = 'none';

  try {
    const res  = await fetch(API + '/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Credenciais inválidas');

    TOKEN = data.token;
    USUARIO_LOGADO = data.usuario;
    localStorage.setItem('pz_token', TOKEN);
    localStorage.setItem('pz_usuario', JSON.stringify(data.usuario));

    aplicarPerfil(data.usuario);
    document.body.classList.add('logado');

  } catch (e) {
    erro.style.display = 'block';
    if (e.message === 'Failed to fetch'){
      erro.textContent = 'Erro de conexão com o Servidor'
    } else{
      erro.textContent   = e.message;
    }
    telaLogin.style.display = 'block';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Entrar';
  }
}
function toggleSenha(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

//====================================
//função de fazer logout
//====================================

function sair() {
  TOKEN = '';
  USUARIO_LOGADO = null;
  localStorage.removeItem('pz_token');
  localStorage.removeItem('pz_usuario');
  document.body.classList.remove('logado');
  document.getElementById('l-senha').value = '';
  telaLogin.style.display = 'block';
}

if (TOKEN && USUARIO_LOGADO) {
  aplicarPerfil(USUARIO_LOGADO);
  document.body.classList.add('logado');
}

//====================================
//função para mostrar um notifiação de que algo foi cadastrado com sucesso
//====================================

function toast(msg, tipo = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `show ${tipo}`;
  setTimeout(() => el.className = '', 3000);
}

function abrir(id)  { document.getElementById(id).classList.add('open'); }
function fechar(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-bg').forEach(bg =>
  bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); })
);

function R$(v) {
  return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
}

//====================================
//Atualizar status de ordens
//====================================

function badge(s) {
  const r = {
    recebido:     '📥 Recebido',
    em_producao:  '⚒️ Em Produção',
    entregue:     '✅ Entregue',
    cancelado:    '❌ Cancelado',
  };
  return `<span class="badge b-${s}">${r[s] || s}</span>`;
}

function badgeDisponivel(v) {
  const r = {
    1: '🟢 Disponível',
    0: '🔴 Indisponível'
  };

  return `<span class="badge b-${v}">${r[v] ?? v}</span>`;
}

//====================================
//função de fconectar com a API
//====================================

async function api(method, url, body) {
  const opts = {
    method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(API + url, opts);
  const data = await res.json();

  if (res.status === 401) { sair(); throw new Error('Sessão expirada'); }
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}

//====================================
//Enviar perfil de usuario para usuarios e de ADM para Administradores
//====================================

function aplicarPerfil(usuario) {
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

  if (isGar) {
    ir('mesas', document.getElementById('btn-nav-mesas'));
  } else {
    ir('dashboard', document.querySelector('[onclick*="dashboard"]'));
  }
}

//====================================
//função de atualizar dados no HTML
//====================================

function ir(pg, btn) {
  const perfil = document.getElementById('sb-perfil').textContent;
  if (pg === 'usuarios' && perfil !== 'Administrador') {
    toast('Acesso restrito a Administradores', 'err'); return;
  }
  document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));
  document.getElementById('pg-' + pg).classList.add('ativa');
  if (btn) btn.classList.add('ativo');
  const loaders = {
    dashboard: carregarDashboard,
    ordens:   carregarordens,
    Produtos:    carregarProdutos,
    clientes:  carregarClientes,
    usuarios:  carregarUsuarios,
  };
  if (loaders[pg]) loaders[pg]();
}

//====================================
//função de carregar dashboard
//====================================

async function carregarDashboard() {
  const h = new Date().getHours();
  const s = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('dash-sub').textContent = `${s}! Aqui está o resumo.`;

  try {
    const [Produtos, clientes, ordens] = await Promise.all([
      api('GET', '/produtos'), 
      api('GET', '/clientes'),
      api('GET', '/ordens'),   
    ]);

    cProdutos   = Produtos;
    cClientes = clientes;

    document.getElementById('s-piz').textContent = Produtos.length;
    document.getElementById('s-cli').textContent = clientes.length;
    document.getElementById('s-ped').textContent = ordens.length;

    const elP = document.getElementById('dash-ordens');
    elP.innerHTML = ordens.slice(0, 8).map(p => `
      <div class="mini-row">
        <div>
          <div class="mn">#${String(p.numeroOrdem || '?').padStart(3,'0')} · ${p.cliente?.nome || '—'}</div>
          <div class="mc">${new Date(p.createdAt).toLocaleString('pt-BR')}</div>
        </div>
        <div style="text-align:right">
          ${badge(p.status)}<br>
          <small style="color:var(--muted)"></small>
        </div>
      </div>`).join('') ||
      '<div class="empty"><span class="ei">📋</span>Nenhum ordem ainda</div>';

    const elC = document.getElementById('dash-cardapio');
    elC.innerHTML = Produtos.filter(p => p.disponivel).slice(0, 8).map(p => `
      <div class="mini-row">
        <span>🛠️ ${p.nome}</span>
        <small style="color:var(--muted)"></small>
      </div>`).join('') ||
      '<div class="empty"><span class="ei">⚙️</span>Nenhuma Produto</div>';

  } catch (e) { toast('Erro dashboard: ' + e.message, 'err'); }
}

//====================================
//função de carregar todas as Produtos
//====================================

async function carregarProdutos() {
  const el = document.getElementById('tbl-Produtos');
  el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';
  try {
    // Rota alterada para produtos
    cProdutos = await api('GET', '/produtos');
    if (!cProdutos.length) {
      el.innerHTML = '<div class="empty"><span class="ei"></span>Nenhuma Produto</div>';
      return;
    }
    el.innerHTML = `
      <table>
        <thead>
          <tr><th>Nome</th><th>Status</th><th>Ações</th>
        </thead>
        <tbody>
        ${cProdutos.map(p => `
            <tr>
              <input type="hidden" id= "p-id">
              <td><strong>${p.nome}</strong><br><small style="color:var(--muted)">${p.descricao || ''}</small></td>
              <td><span class="badge ${Number(p.disponivel) === 1 ? 'b-on' : 'b-off'}">${badgeDisponivel(Number(p.disponivel))}</span></td>
              <td><div style="display:flex;gap:5px"><button class="btn btn-ghost btn-sm"onclick='abrirEdicaoProduto(${JSON.stringify(p)})'>✏️</button>
              <button class="btn btn-danger btn-sm"onclick="deletarProduto('${p._id}','${p.nome}')">🗑️</button></div></td>`).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    el.innerHTML = `<div class="empty" style="color:var(--red)">${e.message}</div>`;
  }
}

function abrirProduto() {
  document.getElementById('m-Produto-t').textContent = 'Novo Produto';
  document.getElementById('p-disp').value = '1';
  abrir('m-Produto');
}

//====================================
//função de editar Produto no DB
//====================================
//====================================
//função de salvar Produtos no DB
//====================================

async function salvarProduto() {
  const id   = document.getElementById('p-id').value;
  const nome = document.getElementById('p-nome').value.trim();
  if (!nome) { toast('Nome é obrigatório', 'err'); return; }

  const d = {
    nome,
    descricao:    document.getElementById('p-desc').value.trim(),
    disponivel: document.getElementById('p-disp').value
  };

  try {
    // Rotas alteradas para produtos
    await api('POST', '/produtos', d);
    toast(id ? 'Produto atualizada!' : 'Produto criada!');
    fechar('m-Produto');
    carregarProdutos();
  } catch (e) { toast('Erro: ' + e.message, 'err'); console.log(e.message)}
}


function abrirEdicaoProduto(p) {
  abrir("e-produto")
  document.getElementById('p-id').value = p.id || p._id
  document.getElementById('e-nomeproduto').value = p.nome;
  document.getElementById('e-desc').value = p.descricao || '';
  if (p.disponivel === false){
    document.getElementById('e-disp').value = 0;
  } else{
    document.getElementById('e-disp').value = 1;
  }
}

async function editarProduto() {
  const id = document.getElementById('p-id').value;
  const nome = document.getElementById('e-nomeproduto').value.trim();
  const descricao = document.getElementById('e-desc').value.trim();
  const disponivel = Number(document.getElementById('e-disp').value);

  // Validações iniciais
  if (!nome) {
    toast('Nome è obrigatório', 'err');
    return;
  }

  if (!id) {
    toast('Erro: ID de cliente inválido', 'err');
    return;
  }

  try {
    // Criação do corpo da requisição
    let body = { nome, descricao, disponivel };
    // Enviar a requisição para a API
    await api('PUT', `/produtos/${id}`, body);
    toast('Produto atualizado!');
    fechar('e-produto');
    carregarProdutos();
    
  } catch (e) {
    toast('Erro: ' + (e.message || 'desconhecido'), 'err');
    console.log(e)
  }
}
//====================================
//função de deletar Produtos do cardapio
//====================================

async function deletarProduto(id, nome) {
  if (!confirm(`Deletar "${nome}"?`)) return;
  try {
    // Rota alterada para produtos
    await api('DELETE', '/produtos/' + id);
    toast('Produto deletada!');
    carregarProdutos();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

//====================================
//função de carregar clientes
//====================================

let clientesCache = [];

async function carregarClientes(busca = '') {
  const el = document.getElementById('tbl-clientes');

  try {
    if (busca && busca.length < 2) {
      renderClientes(clientesCache);
      return;
    }

    el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';

    const url = `/clientes${busca ? `?busca=${encodeURIComponent(busca.trim())}` : ''}`;

    const resposta = await api('GET', url);

    clientesCache = Array.isArray(resposta) ? resposta : [];

    renderClientes(clientesCache);

  } catch (e) {
    console.error('Erro carregarClientes:', e);
    el.innerHTML = `<div class="empty" style="color:var(--red)">Erro ao carregar clientes</div>`;
  }
}

function renderClientes(lista) {
  const el = document.getElementById('tbl-clientes');

  if (!el) return;

  if (!lista.length) {
    el.innerHTML = '<div class="empty"><span class="ei">👥</span>Nenhum cliente</div>';
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Endereço</th>
          <th>Obs</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(c => {
          const endereco = c.endereco
            ? [c.endereco.rua, c.endereco.numero, c.endereco.bairro, c.endereco.cidade]
                .filter(Boolean)
                .join(', ')
            : '—';

          return `
            <tr>
              <td><strong>${c.nome || '—'}</strong></td>
              <td>${c.telefone || '—'}</td>
              <td style="font-size:.76rem;color:var(--muted)">${endereco}</td>
              <td style="font-size:.76rem;color:var(--muted)">${c.observacoes || '—'}</td>
              <td>
                <div style="display:flex;gap:5px">
                  <button class="btn btn-ghost btn-sm"
                    onclick='abrirEdicaoCliente(${JSON.stringify(c)})'>✏️</button>

                  <button class="btn btn-danger btn-sm"
                    onclick="deletarCliente('${c.id || c._id}','${c.nome}')">🗑️</button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function normalizar(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarCli(valor) {
  const query = normalizar(valor)
    .trim()
    .split(' ')
    .filter(Boolean);

  if (!query.length) {
    renderClientes(clientesCache);
    return;
  }

  const filtrados = clientesCache.filter(cli => {
    const nome = normalizar(cli.nome || '');

    return query.every(p => nome.includes(p));
  });

  renderClientes(filtrados);
}


function abrirCliente() {
  document.getElementById('m-cli-t').textContent = 'Novo Cliente';
  ['c-id','c-nome','c-tel','c-rua','c-num','c-bairro','c-cidade','c-cep','c-comp','c-obs']
    .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  abrir('m-cliente');
}

//====================================
//função de editar cliente
//====================================


function abrirEdicaoCliente(c) {
  document.getElementById('c-id').value = c.id || c._id;
  abrir("e-cliente");
  document.getElementById('e-nomeclient').value = c.nome || '';
  document.getElementById('e-tel').value = c.telefone || '';
  const end = c.endereco || {};
  document.getElementById('e-rua').value = end.rua || '';
  document.getElementById('e-num').value = end.numero || '';
  document.getElementById('e-bairro').value = end.bairro || '';
  document.getElementById('e-cidade').value = end.cidade || '';
  document.getElementById('e-cep').value = end.cep || '';
  document.getElementById('e-comp').value = end.complemento || '';
  document.getElementById('e-obs').value = c.observacoes || '';
}

async function editarCliente() {
  const id = document.getElementById('c-id').value;
  const nome = document.getElementById('e-nomeclient').value.trim();
  const telefone = document.getElementById('e-tel').value.trim();
  const rua = document.getElementById('e-rua').value.trim();
  const numero = document.getElementById('e-num').value.trim();
  const bairro = document.getElementById('e-bairro').value.trim()
  const cidade = document.getElementById('e-cidade').value.trim()
  const cep = document.getElementById('e-cep').value.trim()
  const complemento = document.getElementById('e-comp').value.trim()
  const observacoes = document.getElementById('e-obs').value.trim()

  // Validações iniciais
  if (!nome || !telefone) {
    toast('Nome e telefone são obrigatórios', 'err');
    return;
  }

  if (!id) {
    toast('Erro: ID de cliente inválido', 'err');
    return;
  }

  try {
    const endereco = {rua, numero, bairro, cidade, cep, complemento}
    // Criação do corpo da requisição
    let body = {nome, telefone, endereco, observacoes};

    // Enviar a requisição para a API
    await api('PUT', `/clientes/${id}`, body);
    toast('Cliente atualizado!');
    fechar('e-cliente');
    carregarClientes();
  } catch (e) {
    toast('Erro: ' + (e.message || 'desconhecido'), 'err');
  }
}
//====================================
//função de salvar novo cliente
//====================================

async function salvarCliente() {
  const id = document.getElementById('c-id').value.trim();

  const nome = document.getElementById('c-nome').value.trim();
  const tel  = document.getElementById('c-tel').value.trim();

  if (!nome || !tel) {
    toast('Nome e telefone são obrigatórios', 'err');
    return;
  }

  const d = {
    nome,
    telefone: tel,
    endereco: {
      rua: document.getElementById('c-rua').value.trim(),
      numero: document.getElementById('c-num').value.trim(),
      bairro: document.getElementById('c-bairro').value.trim(),
      cidade: document.getElementById('c-cidade').value.trim(),
      cep: document.getElementById('c-cep').value.trim(),
      complemento: document.getElementById('c-comp').value.trim(),
    },
    observacoes: document.getElementById('c-obs').value.trim(),
  };

  try {
    const isEdit = !!id;

    if (isEdit) {
      await api('PUT', `/clientes/${id}`, d);
    } else {
      await api('POST', '/clientes', d);
    }

    toast(isEdit ? 'Cliente atualizado!' : 'Cliente cadastrado!');
    fechar('m-cliente');
    carregarClientes();

  } catch (e) {
    toast('Erro: ' + (e?.message || 'desconhecido'), 'err');
  }
}

//====================================
//função de deletar clientes
//====================================

async function deletarCliente(id, nome) {
  if (!confirm(`Deletar "${nome}"?`)) return;
  try {
    await api('DELETE', '/clientes/' + id);
    toast('Cliente deletado!');
    carregarClientes();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

//====================================
//função de carregar ordens
//====================================

async function carregarordens() {
  const el = document.getElementById('tbl-ordens');
  el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';
  try {
    // Rota alterada para ordens
    const ordens = await api('GET', '/ordens');
    ordensCache = ordens;

    if (!ordens.length) {
      el.innerHTML = '<div class="empty"><span class="ei">📋</span>Nenhum ordem</div>';
      return;
    }
    el.innerHTML = `
      <table>
        <thead>
          <tr><th>#</th><th>Cliente</th><th>Itens</th><th>Status</th><th>Data</th><th>Ações</th>
        </thead>
        <tbody>
          ${ordens.map(p => `
            <tr>
              <td><strong style="color:var(--red)">#${String(p.numeroOrdem||'?').padStart(3,'0')}</strong></td>
              <td><strong>${p.cliente?.nome || '—'}</strong><br><small style="color:var(--muted)">${p.cliente?.telefone || ''}</small></td>
              <td style="font-size:.76rem"><div>${p.itens.map(it => `${it.quantidade}x ${it.nomeProduto || '?'}`).join('<br>')}</div><small style="color:var(--muted); font-size: 11px">${p.observacoes || ''}</small></td>
              <td>${badge(p.status)}</td>
              <td style="font-size:.7rem;color:var(--muted)">${new Date(p.createdAt).toLocaleString('pt-BR')}</td>
              <td><div style="display:flex;gap:5px"><button class="btn btn-blue btn-sm" onclick="abrirStatus('${p._id}','${p.status}')">📝</button><button class="btn btn-danger btn-sm" onclick="deletarordem('${p._id}')">🗑️</button></div></td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    el.innerHTML = `<div class="empty" style="color:var(--red)">${e.message}</div>`;
  }
}

let ordensCache = [];
function aplicarFiltroOrdens(status) {
  const el = document.getElementById('tbl-ordens');

  if (!ordensCache.length) return;

  const norm = (s) =>
    (s || '')
      .toString()
      .toLowerCase()
      .replace(/\s/g, '_'); // transforma espaços em _

  let filtradas = ordensCache;

  if (status && status !== 'todas') {
    filtradas = ordensCache.filter(o =>
      norm(o.status) === norm(status)
    );
  }

  if (!filtradas.length) {
    el.innerHTML = '<div class="empty">Nenhuma ordem encontrada</div>';
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th><th>Cliente</th><th>Itens</th><th>Status</th><th>Data</th><th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${filtradas.map(p => `
          <tr>
            <td><strong style="color:var(--red)">#${String(p.numeroOrdem||'?').padStart(3,'0')}</strong></td>
              <td><strong>${p.cliente?.nome || '—'}</strong><br><small style="color:var(--muted)">${p.cliente?.telefone || ''}</small></td>
              <td style="font-size:.76rem"><div>${p.itens.map(it => `${it.quantidade}x ${it.nomeProduto || '?'}`).join('<br>')}</div><small style="color:var(--muted); font-size: 11px">${p.observacoes || ''}</small></td>
              <td>${badge(p.status)}</td>
              <td style="font-size:.7rem;color:var(--muted)">${new Date(p.createdAt).toLocaleString('pt-BR')}</td>
              <td><div style="display:flex;gap:5px"><button class="btn btn-blue btn-sm" onclick="abrirStatus('${p._id}','${p.status}')">📝</button><button class="btn btn-danger btn-sm" onclick="deletarordem('${p._id}')">🗑️</button></div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

//====================================
//função de abrir ordens
//====================================

async function abrirOrdem() {
  try {
    // Rota alterada para produtos
    if (!cProdutos.length)   cProdutos   = await api('GET', '/produtos');
    if (!cClientes.length) cClientes = await api('GET', '/clientes');
  } catch (e) { toast('Erro ao carregar dados', 'err'); return; }

  document.getElementById('ped-cli').innerHTML =
    '<option value="">— Selecione o cliente —</option>' +
    cClientes.map(c => `<option value="${c._id}">${c.nome} · ${c.telefone}</option>`).join('');

  document.getElementById('itens-lista').innerHTML = '';
  document.getElementById('ped-obs').value   = '';

  addItem();
  abrir('m-ordem');
}

//====================================
//função de adicionar item
//====================================

function addItem() {
  const d = document.createElement('div');
  d.className = 'item-row';
  const opts = cProdutos
    .filter(p => p.disponivel)
    .map(p => `<option value="${p._id}">${p.nome}</option>`).join('');

  d.innerHTML = `
    <select class="ip" onchange="recalc()"><option value="">Selecione...</option>${opts}</select>
    <input class="iq" type="number" value="1" min="1" oninput="recalc()">
    <button class="btn-rm" onclick="this.parentElement.remove(); recalc()">×</button>`;

  document.getElementById('itens-lista').appendChild(d);
}

function recalc() {
  let sub = 0;
  document.querySelectorAll('#itens-lista .item-row').forEach(row => {
    const sel = row.querySelector('.ip');
    const qtd = parseInt(row.querySelector('.iq').value) || 0;
    const opt = sel.options[sel.selectedIndex];
  });
}

//====================================
//função de salvar ordem
//====================================

async function salvarordem() {
  const cliId = document.getElementById('ped-cli').value;
  if (!cliId) { toast('Selecione um cliente', 'err'); return; }

  const itens = [];
  let valido = true;
  document.querySelectorAll('#itens-lista .item-row').forEach(row => {
    const pid = row.querySelector('.ip').value;
    if (!pid) { valido = false; return; }
    itens.push({
      produto: pid,
      quantidade: parseInt(row.querySelector('.iq').value) || 1,
    });
  });

  if (!valido || !itens.length) {
    toast('Adicione ao menos um item válido', 'err'); return;
  }

  try {
    // Rota alterada para ordens
    await api('POST', '/ordens', {
      cliente:        cliId,
      itens,
      observacoes:    document.getElementById('ped-obs').value,
    });
    toast('ordem de produção criada! ⚒️');
    fechar('m-ordem');
    carregarordens();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

//====================================
//função de abrir status de ordem
//====================================

function abrirStatus(id, status) {
  document.getElementById('st-id').value  = id;
  document.getElementById('st-val').value = status;
  abrir('m-status');
}

//====================================
//função de salavr status de ordem
//====================================

async function salvarStatus() {
  const id     = document.getElementById('st-id').value;
  const status = document.getElementById('st-val').value;
  try {
    // Rota alterada para ordens
    await api('PATCH', '/ordens/' + id + '/status', { status });
    toast('Status atualizado!');
    fechar('m-status');
    carregarordens();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

//====================================
//função de deletar ordem
//====================================

async function deletarordem(id) {
  if (!confirm('Deletar este ordem?')) return;
  try {
    // Rota alterada para ordens
    await api('DELETE', '/ordens/' + id);
    toast('ordem deletado!');
    carregarordens();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

//====================================
//função de carregar usuarios
//====================================

async function carregarUsuarios() {
  const el = document.getElementById('tbl-usuarios');
  el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';
  try {
    const us = await api('GET', '/usuarios');
    if (!us.length) {
      el.innerHTML = '<div class="empty"><span class="ei">🔐</span>Nenhum usuário</div>';
      return;
    }
    el.innerHTML = `
      <table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Criado em</th><th>Ações</th></tr></thead>
        <tbody>
          ${us.map(u => `
            <tr>
              <input type="hidden" id= "u-id">
              <input type="hidden" id= "e-ativo" value= ${u.ativo}>
              <td><strong>${u.nome}</strong></td>
              <td>${u.email}</td>
              <td><span class="badge ${u.perfil === 'Administrador' ? 'b-admin' : 'b-atend'}">${u.perfil}</span></td>
              <td><span class="badge ${u.ativo ? 'b-on' : 'b-off'}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td>
              <td style="font-size:.73rem;color:var(--muted)">${new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
              <td><button class="btn btn-danger btn-sm" onclick="abrirEdicaoUsuario('${u._id}', '${u.nome}', '${u.email}', '${u.perfil}', '${u.ativo}')"">✏️</button><button class="btn btn-danger btn-sm" onclick="deletarUsuario('${u._id}','${u.nome}')">🗑️</button></td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    el.innerHTML = `<div class="empty" style="color:var(--red)">${e.message}</div>`;
  }
}

//====================================
//função de abrir usuarios
//====================================

function abrirUsuario() {
  ['u-nome','u-email','u-senha'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('u-perfil').value = 'Atendente';
  abrir('m-usuario');
}

//====================================
//função de salvar usuarios
//====================================

async function salvarUsuario() {
  const nome  = document.getElementById('u-nome').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const senha = document.getElementById('u-senha').value;
  const confirmarSenha = document.getElementById('u-confirmarSenha').value;
  if (!nome || !email || !senha ) { toast('Preencha todos os campos', 'err'); return; }
  if (senha != confirmarSenha){ toast('As senhas não correspondem', 'err'); return}

  try {
    await api('POST', '/usuarios', {
      nome, email, senha,
      perfil: document.getElementById('u-perfil').value,
    });
    toast('Usuário criado!');
    fechar('m-usuario');
    carregarUsuarios();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

function abrirEdicaoUsuario(id, nome, email, perfil, ativo) {
  abrir('e-usuario'); // abre modal
  document.getElementById("u-id").value = id;
  document.getElementById('e-nome').value = nome;
  document.getElementById('e-email').value = email;
  document.getElementById('e-perfil').value = perfil;
  document.getElementById('u-senha').value = ''; // senha sempre vazia
  document.getElementById('u-ativo').value = ativo || true
}

async function editarUsuario() {
  const id = document.getElementById('u-id').value;
  const nome = document.getElementById('e-nome').value.trim();
  const email = document.getElementById('e-email').value.trim();
  const perfil = document.getElementById('e-perfil').value;
  const ativoValue = document.getElementById('u-ativo').value;
  const ativo = ativoValue === "true" ? 1 : 0;

  const senha = document.getElementById('e-senha').value.trim();
  const confirmarSenha = document.getElementById('e-confirmarSenha').value.trim();

  let body = { nome, email, perfil, ativo };

  if (!nome || !email) {
    toast('Nome e email são obrigatórios', 'err');
    return;
  }

  if (!id) {
    toast('Erro: ID de usuário inválido', 'err');
    return;
  }

  try {
    if (senha) {
      if (senha !== confirmarSenha) {
        toast('Erro: As senhas não correspondem', 'err');
        return;
      }
      body.senha = senha;
    }

    await api('PUT', `/usuarios/${id}`, body);
    toast('Usuário atualizado!');
    fechar('e-usuario');
    carregarUsuarios();

  } catch (e) {
    console.error(e);
    if (e.message.includes('Email já está em uso')) {
      toast('Este email já está sendo usado por outro usuário', 'err');
    } else {
      toast('Erro: ' + e.message, 'err');
    }
  }
}

//====================================
//função de deletar usuarios
//====================================

async function deletarUsuario(id, nome) {
  if (!confirm(`Deletar "${nome}"?`)) return;
  try {
    await api('DELETE', '/usuarios/' + id);
    toast('Usuário deletado!');
    carregarUsuarios();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

// setInterval(() => {
//   if (document.visibilityState === 'visible') {
//     carregarDashboard();
//     carregarClientes();
//     carregarProdutos();
//     carregarUsuarios();
//     carregarordens();
//   }
// }, 10000);