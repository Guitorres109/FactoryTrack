//====================================
//rota da Api
//====================================

const API = 'http://10.106.208.18:3000/api';

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
    erro.textContent = "Servidor Inativo"
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
    erro.textContent   = e.message;
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
    entregue:     '✅ Entregue',
    cancelado:    '❌ Cancelado',
  };
  return `<span class="badge b-${s}">${r[s] || s}</span>`;
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

async function carregarMesas(mesaFiltro = null) {
  const grid = document.getElementById('grid-mesas');
  grid.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';

  document.getElementById('mesas-sub').textContent =
    `Olá, ${USUARIO_LOGADO?.nome}! Suas ordens ativas.`;

  try {
    // Rota alterada para ordens
    const url = `/ordens?garcom=${USUARIO_LOGADO.id}`;
    const ordens = await api('GET', url);

    const ativos = ordens.filter(p => !['entregue','cancelado'].includes(p.status));

    document.getElementById('g-ped').textContent     = ordens.length;
    document.getElementById('g-ped-sub').textContent = `${ativos.length} ativo(s)`;

    const mesasAtivas = new Set(ativos.map(p => p.mesa).filter(Boolean));
    document.getElementById('g-mesas').textContent   = mesasAtivas.size;
    document.getElementById('g-preparo').textContent = ativos.filter(p => p.status === 'em_preparo').length;
    document.getElementById('g-prontos').textContent = ativos.filter(p => p.status === 'saiu_entrega').length;

    const botoes = document.getElementById('mesa-botoes');
    botoes.innerHTML = Array.from({length: 10}, (_, i) => {
      const n      = i + 1;
      const temPed = mesasAtivas.has(n);
      const ativo  = mesaFiltro === n;
      return `
        <button class="btn btn-sm ${ativo ? 'btn-red' : temPed ? 'btn-green' : 'btn-ghost'}"
          onclick="carregarMesas(${n})"
          title="${temPed ? 'Mesa com ordem ativo' : 'Mesa livre'}">
          ${n}${temPed ? ' 🔴' : ''}
        </button>`;
    }).join('');

    const ordensFiltrados = mesaFiltro
      ? ativos.filter(p => p.mesa === mesaFiltro)
      : ativos;

    if (!ordensFiltrados.length) {
      grid.innerHTML = `
        <div class="empty" style="grid-column:1/-1">
          <span class="ei">🪑</span>
          Nenhuma ordem ativa no momento.<br>
          <button class="btn btn-red" style="margin-top:12px" onclick="abrirordemMesa()">
            + Abrir primeiro ordem
          </button>
        </div>`;
      return;
    }

    const porMesa = {};
    ordensFiltrados.forEach(p => {
      const key = p.mesa || 'balcão';
      if (!porMesa[key]) porMesa[key] = [];
      porMesa[key].push(p);
    });

    grid.innerHTML = Object.entries(porMesa).map(([mesa, peds]) => {
      const totalMesa  = peds.reduce((s, p) => s + (p.total || 0), 0);
      const todosItens = peds.flatMap(p => p.itens);
      const itensAgrup = {};
      todosItens.forEach(it => {
        const k = `${it.nomeProduto} (${it.tamanho})`;
        itensAgrup[k] = (itensAgrup[k] || 0) + it.quantidade;
      });
      const statusAtual = peds[peds.length - 1]?.status;

      return `
        <div class="mesa-card">
          <div class="mesa-card-head">
            <div>
              <div class="mesa-num">Mesa ${mesa}</div>
              <div style="font-size:.72rem;color:var(--muted);margin-top:2px">
                ${peds.length} ordem(s) · ${peds[0]?.cliente?.nome || 'Sem cadastro'}
              </div>
            </div>
            ${badge(statusAtual)}
          </div>
          <div class="mesa-card-body">
            ${Object.entries(itensAgrup).map(([nome, qtd]) => `
              <div class="mesa-item">
                <strong>${qtd}x ${nome}</strong>
              </div>`).join('')}
            <div class="mesa-total">
              <span style="color:var(--muted)">Total da mesa</span>
              <span style="color:var(--gold)">${R$(totalMesa)}</span>
            </div>
          </div>
          <div class="mesa-card-foot">
            <button class="btn btn-ghost btn-sm" style="flex:1"
              onclick="abrirordemMesa(${mesa})">
              + Item
            </button>
            <button class="btn btn-blue btn-sm"
              onclick="abrirStatus('${peds[peds.length-1]?._id}','${statusAtual}')">
              📝 Status
            </button>
            <button class="btn btn-green btn-sm"
              onclick="abrirFecharMesa(${mesa}, ${totalMesa}, '${peds.map(p=>p._id).join(',')}')">
              ✅ Fechar
            </button>
          </div>
        </div>`;
    }).join('');

  } catch (e) {
    grid.innerHTML = `<div class="empty" style="color:var(--red)">${e.message}</div>`;
  }
}

async function abrirordemMesa(mesaNum = null) {
  try {
    // Rota alterada para produtos
    if (!cProdutos.length)   cProdutos   = await api('GET', '/produtos');
    if (!cClientes.length) cClientes = await api('GET', '/clientes');
  } catch (e) { toast('Erro ao carregar dados', 'err'); return; }

  document.getElementById('pm-cli').innerHTML =
    '<option value="">— Sem cadastro —</option>' +
    cClientes.map(c => `<option value="${c._id}">${c.nome} · ${c.telefone}</option>`).join('');

  document.getElementById('pm-mesa').value = mesaNum || '';
  document.getElementById('itens-mesa-lista').innerHTML = '';
  document.getElementById('pm-obs').value  = '';
  document.getElementById('pm-sub').textContent = 'R$ 0,00';
  document.getElementById('pm-tot').textContent = 'R$ 0,00';

  addItemMesa();
  abrir('m-ordem-mesa');
}

function addItemMesa() {
  const d = document.createElement('div');
  d.className = 'item-row';
  const opts = cProdutos.filter(p => p.disponivel)
    .map(p => `<option value="${p._id}"
      data-p="${p.precos?.P||0}" data-m="${p.precos?.M||0}" data-g="${p.precos?.G||0}">
      ${p.nome}</option>`).join('');
  d.innerHTML = `
    <select class="ip" onchange="recalcMesa()"><option value="">Selecione...</option>${opts}</select>
    <select class="it" onchange="recalcMesa()">
      <option value="P">P</option><option value="M">M</option><option value="G" selected>G</option>
    </select>
    <input class="iq" type="number" value="1" min="1" oninput="recalcMesa()">
    <div class="is" style="font-size:.8rem;text-align:right;color:var(--muted)">R$ 0,00</div>
    <button class="btn-rm" onclick="this.parentElement.remove();recalcMesa()">×</button>`;
  document.getElementById('itens-mesa-lista').appendChild(d);
}

function recalcMesa() {
  let sub = 0;
  document.querySelectorAll('#itens-mesa-lista .item-row').forEach(row => {
    const sel = row.querySelector('.ip');
    const tam = row.querySelector('.it').value.toLowerCase();
    const qtd = parseInt(row.querySelector('.iq').value) || 0;
    const pc  = parseFloat(sel.options[sel.selectedIndex]?.dataset?.[tam] || 0);
    const s   = pc * qtd; sub += s;
    row.querySelector('.is').textContent = R$(s);
  });
  document.getElementById('pm-sub').textContent = R$(sub);
  document.getElementById('pm-tot').textContent = R$(sub);
}

async function salvarordemMesa() {
  const mesa = parseInt(document.getElementById('pm-mesa').value) || 0;
  if (!mesa || mesa < 1) { toast('Selecione a mesa', 'err'); return; }

  const cliId = document.getElementById('pm-cli').value || null;
  const itens = []; let valido = true;
  document.querySelectorAll('#itens-mesa-lista .item-row').forEach(row => {
    const pid = row.querySelector('.ip').value;
    if (!pid) { valido = false; return; }
    itens.push({
      Produto:      pid,
      tamanho:    row.querySelector('.it').value,
      quantidade: parseInt(row.querySelector('.iq').value) || 1,
    });
  });

  if (!valido || !itens.length) { toast('Adicione ao menos um item', 'err'); return; }

  let clienteId = cliId;
  if (!clienteId) {
    try {
      const todos = await api('GET', `/clientes?busca=Mesa ${mesa}`);
      const existe = todos.find(c => c.nome === `Mesa ${mesa}`);
      if (existe) {
        clienteId = existe._id;
      } else {
        const novo = await api('POST', '/clientes', { nome: `Mesa ${mesa}`, telefone: 'Mesa' });
        clienteId = novo._id;
        cClientes = [];
      }
    } catch (e) { toast('Erro ao registrar mesa', 'err'); return; }
  }

  try {
    // Rota alterada para ordens
    await api('POST', '/ordens', {
      cliente:        clienteId,
      itens,
      formaPagamento: 'pix',
      observacoes:    document.getElementById('pm-obs').value,
      garcom:         USUARIO_LOGADO?.id,
    });
    toast(`ordem lançado na Mesa ${mesa}! 🍕`);
    fechar('m-ordem-mesa');
    carregarMesas();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

function abrirFecharMesa(mesa, total, ids) {
  mesaEmFechamento = { mesa, total, ids: ids.split(',') };
  document.getElementById('fm-titulo').textContent = `Fechar Mesa ${mesa}`;
  document.getElementById('fm-total').textContent  = R$(total);
  document.getElementById('fm-resumo').innerHTML   =
    `<p style="font-size:.82rem;color:var(--muted)">
      ${mesaEmFechamento.ids.length} ordem(s) serão marcados como <strong style="color:var(--green)">Entregue</strong>.
    </p>`;
  abrir('m-fechar-mesa');
}

async function confirmarFechamento() {
  if (!mesaEmFechamento) return;

  try {
    await Promise.all(
      mesaEmFechamento.ids.map(id =>
        // Rota alterada para ordens
        api('PATCH', `/ordens/${id}/status`, { status: 'entregue' })
      )
    );
    toast(`Mesa ${mesaEmFechamento.mesa} fechada! ✅`);
    fechar('m-fechar-mesa');
    mesaEmFechamento = null;
    carregarMesas();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

function ir(pg, btn) {
  const perfil = document.getElementById('sb-perfil').textContent;
  if (pg === 'usuarios' && perfil !== 'Administrador') {
    toast('Acesso restrito a Administradores', 'err'); return;
  }
  if (pg === 'mesas' && perfil !== 'Garcom') {
    toast('Área exclusiva para Garçom', 'err'); return;
  }
  if (perfil === 'Garcom' && !['mesas','Produtos'].includes(pg)) {
    toast('Acesso não permitido para Garçom', 'err'); return;
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
    mesas:     carregarMesas,
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
      api('GET', '/produtos'), // Rota alterada
      api('GET', '/clientes'),
      api('GET', '/ordens'),   // Rota alterada
    ]);

    cProdutos   = Produtos;
    cClientes = clientes;

    document.getElementById('s-piz').textContent = Produtos.length;
    document.getElementById('s-cli').textContent = clientes.length;
    document.getElementById('s-ped').textContent = ordens.length;
    document.getElementById('s-ent').textContent =
      ordens.filter(p => p.status === 'saiu_entrega').length;
    document.getElementById('s-fat').textContent =
      R$(ordens.reduce((acc, p) => acc + (p.total || 0), 0));

    const pend = ordens.filter(p => !['entregue','cancelado'].includes(p.status)).length;
    document.getElementById('s-ped-sub').textContent = `${pend} pendente(s)`;

    const elP = document.getElementById('dash-ordens');
    elP.innerHTML = ordens.slice(0, 8).map(p => `
      <div class="mini-row">
        <div>
          <div class="mn">#${String(p.numeroordem || '?').padStart(3,'0')} · ${p.cliente?.nome || '—'}</div>
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
              <input type="hidden" id= "p-id" value= ${p._id}>
              <td><strong>${p.nome}</strong><br><small style="color:var(--muted)">${p.descricao || ''}</small></td>
              <td><span class="badge ${p.disponivel ? 'b-on' : 'b-off'}">${p.disponivel ? '✅ Disponível' : '❌ Off'}</span></td>
              <td><div style="display:flex;gap:5px"><button class="btn btn-ghost btn-sm" onclick='abrirEdicaoProduto("${p.nome}, ${p.descricao}, ${p.disponivel}")'>✏️</button><button class="btn btn-danger btn-sm" onclick="deletarProduto('${p._id}','${p.nome}')">🗑️</button></div></td>
             </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    el.innerHTML = `<div class="empty" style="color:var(--red)">${e.message}</div>`;
  }
}

function abrirProduto() {
  document.getElementById('m-Produto-t').textContent = 'Novo Produto';
  document.getElementById('p-disp').value = 'true';
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
    disponivel: document.getElementById('p-disp').value === 'true',
  };

  console.log(d)

  try {
    // Rotas alteradas para produtos
    await api('POST', '/produtos', d);
    toast(id ? 'Produto atualizada!' : 'Produto criada!');
    fechar('m-Produto');
    carregarProdutos();
  } catch (e) { toast('Erro: ' + e.message, 'err'); console.log(e.message)}
}


function abrirEdicaoProduto(nome, descricao, disponivel) {
  // console.log("EDITANDO:", c);
  abrir("e-produto")
  document.getElementById('e-nomeproduto').value = nome || '';
  document.getElementById('e-desc').value = descricao || '';
  document.getElementById('e-disp').value = disponivel || false;
  console.log(nome, descricao, disponivel)

}

async function editarProduto() {
  const id = document.getElementById('p-id').value;
  console.log(id)
  const nome = document.getElementById('e-nomeproduto').value.trim();
  const descricao = document.getElementById('e-desc').value.trim();
  const disponivel = document.getElementById('e-disp').value;

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
    fechar('e-poduto');
    carregarProdutos();
    
  } catch (e) {
    toast('Erro: ' + (e.message || 'desconhecido'), 'err');
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

async function carregarClientes(busca = '') {
  const el = document.getElementById('tbl-clientes');

  try {
    // evita requisição desnecessária
    if (busca && busca.length < 2) {
      el.innerHTML = '';
      return;
    }

    el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';

    // 🔥 use UMA rota só (mais simples e evita erro)
    const url = `/clientes${busca ? `?busca=${encodeURIComponent(busca.trim())}` : ''}`;

    const resposta = await api('GET', url);

    // garante que sempre seja array
    const cClientes = Array.isArray(resposta) ? resposta : [];

    if (!cClientes.length) {
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
          ${cClientes.map(c => {
            const endereco = c.endereco
              ? [c.endereco.rua, c.endereco.numero, c.endereco.bairro, c.endereco.cidade]
                  .filter(Boolean)
                  .join(', ')
              : '—';

            return `
              <tr>
                <td><strong>${c.nome || '—'}</strong></td>
                <td>${c.telefone || '—'}</td>
                <td style="font-size:.76rem;color:var(--muted)">${endereco || '—'}</td>
                <td style="font-size:.76rem;color:var(--muted)">${c.observacoes || '—'}</td>
                <td>
                  <div style="display:flex;gap:5px">
                  <button class="btn btn-ghost btn-sm"onclick='abrirEdicaoCliente(${JSON.stringify(c)})'>✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="deletarCliente('${c.id || c._id}','${c.nome}')">🗑️</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    console.error('Erro carregarClientes:', e);
    el.innerHTML = `<div class="empty" style="color:var(--red)">Erro ao carregar clientes</div>`;
  }
}

let _t = null;

function buscarCli(valor) {
  clearTimeout(_t);

  _t = setTimeout(() => {
    carregarClientes(valor);
  }, 400);
}

//====================================
//função de abrir cliente
//====================================

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
    console.log(id)
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
    if (!ordens.length) {
      el.innerHTML = '<div class="empty"><span class="ei">📋</span>Nenhum ordem</div>';
      return;
    }
    el.innerHTML = `
      <table>
        <thead>
          <tr><th>#</th><th>Cliente</th><th>Itens</th><th>Subtotal</th><th>Entrega</th><th>Total</th><th>Pagamento</th><th>Status</th><th>Data</th><th>Ações</th>
        </thead>
        <tbody>
          ${ordens.map(p => `
            <tr>
              <td><strong style="color:var(--red)">#${String(p.numeroordem||'?').padStart(3,'0')}</strong></td>
              <td><strong>${p.cliente?.nome || '—'}</strong><br><small style="color:var(--muted)">${p.cliente?.telefone || ''}</small></td>
              <td style="font-size:.76rem">${p.itens.map(it => `${it.quantidade}x ${it.nomeProduto || '?'} (${it.tamanho})`).join('<br>')}</td>
              <td>${R$(p.subtotal)}</td><td>${R$(p.taxaEntrega)}</td>
              <td><strong style="color:var(--gold)">${R$(p.total)}</strong></td>
              <td style="font-size:.76rem">${(p.formaPagamento || '—').replace('_', ' ')}</td>
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
  document.getElementById('ped-pag').value   = 'pix';
  document.getElementById('ped-tot').textContent = 'R$ 0,00';

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
    .map(p => `<option value="${p._id}" data-p="${p.precos?.P || 0}" data-m="${p.precos?.M || 0}" data-g="${p.precos?.G || 0}">${p.nome}</option>`).join('');

  d.innerHTML = `
    <select class="ip" onchange="recalc()"><option value="">Selecione...</option>${opts}</select>
    <input class="iq" type="number" value="1" min="1" oninput="recalc()">
    <div class="is" style="font-size:.8rem;text-align:right;color:var(--muted)">R$ 0,00</div>
    <button class="btn-rm" onclick="this.parentElement.remove(); recalc()">×</button>`;

  document.getElementById('itens-lista').appendChild(d);
}

function recalc() {
  let sub = 0;
  document.querySelectorAll('#itens-lista .item-row').forEach(row => {
    const sel = row.querySelector('.ip');
    const qtd = parseInt(row.querySelector('.iq').value) || 0;
    const opt = sel.options[sel.selectedIndex];
    const pc  = cProdutos.find
    const s   = pc * qtd;
    sub += s;
    row.querySelector('.is').textContent = R$(s);
  });

  const taxa = parseFloat(document.getElementById('ped-taxa').value) || 0;
  document.getElementById('ped-sub').textContent = R$(sub);
  document.getElementById('ped-tot').textContent = R$(sub + taxa);
}

//====================================
//função de fcalcular troco
//====================================

function toggleTroco() {
  const pag = document.getElementById('ped-pag').value;
  document.getElementById('wrap-troco').style.display =
    pag === 'dinheiro' ? 'block' : 'none';
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
      Produto:      pid,
      tamanho:    row.querySelector('.it').value,
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
      taxaEntrega:    parseFloat(document.getElementById('ped-taxa').value) || 0,
      formaPagamento: document.getElementById('ped-pag').value,
      troco:          parseFloat(document.getElementById('ped-troco')?.value) || 0,
      observacoes:    document.getElementById('ped-obs').value,
    });
    toast('ordem criado! 🍕');
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
              <input type="hidden" id= "u-id" value= ${u._id}>
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