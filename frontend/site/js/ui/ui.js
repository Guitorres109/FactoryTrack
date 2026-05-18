import * as services from '/js/services/index.js';

let cProdutos
let cClientes
let cUsuarios

export function toggleSenha(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

export function toast(msg, tipo = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `show ${tipo}`;
  setTimeout(() => el.className = '', 3000);
}

export function enableSidebarSwipe() {
  const sidebar = document.getElementById('sidebar');

  if (!sidebar) return;

  let startX = 0;
  let endX = 0;

  function handleSwipe() {
    const diff = endX - startX;

    // 👉 abre (arrasta da esquerda para direita)
    if (diff > 80 && startX < 50) {
      sidebar.classList.add('aberto');
    }

    // 👈 fecha (arrasta da direita para esquerda)
    if (diff < -80) {
      sidebar.classList.remove('aberto');
    }
  }

  document.addEventListener('touchstart', (e) => {
    if (window.innerWidth > 768) return;
    startX = e.touches[0].clientX;
  });

  document.addEventListener('touchend', (e) => {
    if (window.innerWidth > 768) return;
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });
}

export function abrir(id)  {document.getElementById(id).classList.add('open'); if (id === 'm-Produto'){document.getElementById('p-disp').value = true}}
export function fechar(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-bg').forEach(bg =>
  bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); })
);

function R$(v) {
  return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
}

export function badge(s) {
  const r = {
    recebido:     '📥 Recebido',
    em_producao:  '⚒️ Em Produção',
    entregue:     '✅ Entregue',
    cancelado:    '❌ Cancelado',
  };
  return `<span class="badge b-${s}">${r[s] || s}</span>`;
}

export function badgeDisponivel(v) {
  const r = {
    1: '🟢 Disponível',
    0: '🔴 Indisponível'
  };

  return `<span class="badge b-${v}">${r[v] ?? v}</span>`;
}

export async function carregarFoto() {
  try {
    const id = services.USUARIO_LOGADO.id;
    const data = await services.api('GET', `/usuarios/${id}`);

    const foto = data?.foto; // 👈 ajuste conforme retorno da sua API
    const caminhoFoto = foto ? `${services.API}/uploads/usuarios/${foto}` : `${services.API}/uploads/usuarios/default.png`;
    document.getElementById('sb-foto').src = caminhoFoto;

  } catch (err) {
    console.error('Erro ao carregar foto:', err);
  }
}

export function ir(pg, btn) {
  const perfil = document.getElementById('sb-perfil').textContent;

  // 🔒 Restrição de acesso
  if (pg === 'usuarios' && perfil !== 'Administrador') {
    toast('Acesso restrito a Administradores', 'err');
    return;
  }

  // 🔄 Limpa estado
  document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));

  // 🧠 Caso especial: nova ordem
  if (pg === 'ordens-novo') {
    const pagina = document.getElementById('pg-ordens');
    if (pagina) pagina.classList.add('ativa');

    if (btn) btn.classList.add('ativo');

    carregarordens(); // mantém seu padrão atual
    abrirOrdem();     // chama a função

    return;
  }

  // 📄 Página normal
  const pagina = document.getElementById('pg-' + pg);
  if (pagina) pagina.classList.add('ativa');

  if (btn) btn.classList.add('ativo');

  const loaders = {
    dashboard: carregarDashboard,
    ordens: services.carregarordens,     // <-- sem parênteses
    Produtos: services.carregarProdutos,
    clientes: services.carregarClientes,
    usuarios: services.carregarUsuarios,
  };

  if (loaders[pg]) {
    loaders[pg](); // chama só aqui
  }
}

export async function carregarDashboard() {
  const spin = document.getElementById('spin-dashboard');
  spin.style.display = 'block';
  const h = new Date().getHours();
  const s = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('dash-sub').textContent = `${s}! Aqui está o resumo.`;

  try {
    const [Produtos, clientes, ordens, atividades, usuarios] = await Promise.all([
      services.api('GET', '/produtos'), 
      services.api('GET', '/clientes'),
      services.api('GET', '/ordens'),   
      services.api('GET', '/atividades'),
      services.api('GET', '/usuarios')
    ]);

    cProdutos   = Produtos;
    cClientes = clientes;
    cUsuarios = usuarios
    
    const emAberto = ordens.filter(o =>
      o.status === 'recebido' || o.status === 'em_producao'
    );

    
    document.getElementById('s-piz').textContent = Produtos.length;
    document.getElementById('s-cli').textContent = clientes.length;
    document.getElementById('s-ped').textContent = ordens.length;
    if (emAberto.length === 1){document.getElementById('s-ped-sub').textContent = `${emAberto.length} Ordem de produção pendente`}else{document.getElementById('s-ped-sub').textContent = `${emAberto.length} Ordens de produção pendentes`}
    
    const elP = document.getElementById('dash-ordens');

    elP.innerHTML =
      ordens.slice(0, 8).map(p => {

        const usuario = cUsuarios.find(u =>
          String(u.id) === String(p.usuarioId || p.usuario?.id)
        );

        const img = usuario?.foto
          ? `${services.API}/uploads/usuarios/${usuario.foto}`
          : `${services.API}/uploads/usuarios/default.png`;

        return `
          <div class="mini-row" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">

            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${img}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border)">

              <div>
                <div class="mn">
                  #${p.numeroOrdem
                    ? String(p.numeroOrdem).padStart(3, '0')
                    : '???'
                  } · ${p.cliente?.nome || '—'}
                </div>

                <div class="mc">
                  ${usuario?.nome || '—'} · ${new Date(p.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div style="text-align:right">
              ${badge(p.status)}<br>
              <small style="color:var(--muted)"></small>
            </div>

          </div>
        `;
      }).join('') ||
      '<div class="empty"><span class="ei">📋</span>Nenhum ordem ainda</div>';

    const elC = document.getElementById('dash-cardapio');

  if (!atividades.length) {
    elC.innerHTML = '<div class="empty"><span class="ei">⚙️</span>Nenhuma atividade</div>';
    return;
  }

  const itens = await Promise.all(
    atividades.slice(0, 8).map(async (a) => {
      const texto = await formatarAtividade(a);

      return `
        <div class="mini-row">
          <span style="display:inline-flex; align-items:center; gap:5px;">
            ${texto}
          </span>
          <small style="color:var(--muted)">
            ${a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
          </small>
        </div>
      `;
    })
  );
  elC.innerHTML = itens.join('');

    spin.style.display = 'none';
  } catch (e) { toast('Erro dashboard: ' + e.message, 'err'); }
}

export async function carregarAtividades() {
  try {
    const res = await fetch(`${services.API}/atividades`);
    let lista = await res.json();

    lista = lista.reverse();

    renderizarAtividades(lista);

  } catch (err) {
    console.error('Erro ao buscar atividades:', err);
  }
}

async function formatarAtividade(resultado) {
  const { usuario, atividade, area, areaItem, usuarioId } = resultado;

  let caminhoFoto = `${services.API}/uploads/usuarios/default.png`;
  let perfil = 'Atendente';

  try {
    const data = await services.api('GET', `/usuarios/${usuarioId}`);
    perfil = (data?.perfil || '').toLowerCase();
    const foto = data?.foto || data?.usuario?.foto;

    if (foto) {
      caminhoFoto = `${services.API}/uploads/usuarios/${foto}`;
    }
  } catch (err) {
    console.error('Erro ao buscar foto:', err);
  }

  const acoes = {
    Criou: 'criou',
    Editou: 'editou',
    Deletou: 'removeu'
  };

  const icons = {
    Criou: '➕',
    Editou: '✏️',
    Deletou: '🗑️'
  };

  const atividades = {
    clientes: 'cliente',
    produtos: 'produto',
    ordens: 'ordem',
    usuarios: 'usuário',
  };

  const artigo = {
    cliente: 'o',
    produto: 'o',
    ordem: 'a',
    usuário: 'o'
  };

  let itemFormatado = areaItem;

  if (area === 'ordens' && areaItem != null) {
    itemFormatado = `#${String(areaItem).padStart(3, '0')}`;
  }

  const acao = acoes[atividade] || atividade;
  const tipo = atividades[area] || area;
  const icon = icons[atividade] || '';

  return `
    <div class="chat-msg">
      
    
    <div class="chat-text" style="border-left: 4px solid ${perfil === 'atendente' ? '#93c5fd' : 'var(--red)'} ;">
    <div class="chat-user">
      <img 
        src="${caminhoFoto}"
        style="
          display: block;
          margin: 0 auto;
        "
      >
      <span class="chat-icon">${icon}</span>
    </div>
        ${usuario} ${acao} ${artigo[tipo] || 'o'} ${tipo} ${itemFormatado}
      </div>

    </div>
  `;
}

async function renderizarAtividades(lista) {
  const container = document.getElementById('lista-atividades');

  container.innerHTML = '';

  const atividadesHTML = await Promise.all(
    lista.map(item => formatarAtividade(item))
  );

  atividadesHTML.forEach(texto => {
    const div = document.createElement('div');

    // ⚠️ importante: usar innerHTML (porque tem <img>)
    div.innerHTML = texto;

    container.appendChild(div);
  });
}