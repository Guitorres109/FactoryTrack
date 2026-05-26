import * as services from '/js/services/index.js';

let cProdutos = JSON.parse(sessionStorage.getItem('Produtos') || '[]');
let cClientes = JSON.parse(sessionStorage.getItem('Clientes') || '[]');

export async function carregarordens() {
  const el = document.getElementById('tbl-ordens');
  el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';
  try {
    // Rota alterada para ordens
    const ordens = await services.api('GET', '/ordens');
    ordensCache = ordens;

    if (!ordens.length) {
      el.innerHTML = '<div class="empty"><span class="ei">📋</span>Nenhum ordem</div>';
      return;
    }

    const usuario = JSON.parse(localStorage.getItem('pz_usuario') || '{}');
    const perfil = usuario?.perfil || '';
    const isAtendente = perfil === 'Atendente';
    el.innerHTML = `
      <table>
        <thead>
          <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>Itens</th>
          <th>Status</th>
          <th>Data</th>
          ${!isAtendente ? '<th>Ações</th>' : '<th>Status</th>'}
        </thead>
        <tbody>
          ${ordens.map(p => `
            <tr 
              style="cursor:pointer"
            >
              <td onclick="window.location.href='/metaltech/ordem?id=${p.id}&cliente=${p.cliente?.nome}&data=${p.createdAt}'"><div><strong style="color:var(--primary)">#${p.numeroOrdem? String(p.numeroOrdem).padStart(3, '0'): '???'}</strong></div><small style="color:var(--muted); font-size: 11px">${p.usuario?.nome || '—'}</small></td>
              <td onclick="window.location.href='/metaltech/ordem?id=${p.id}&cliente=${p.cliente?.nome}&data=${p.createdAt}'"><strong>${p.cliente?.nome || '—'}</strong><br><small style="color:var(--muted)">${services.formatarTelefone(p.cliente?.telefone || '')}</small></td>
              <td onclick="window.location.href='/metaltech/ordem?id=${p.id}&cliente=${p.cliente?.nome}&data=${p.createdAt}'" style="font-size:.76rem"><div>${p.itens.map(it => `${it.quantidade}x ${it.nomeProduto || '?'}`).join('<br>')}</div><small style="color:var(--muted); font-size: 11px">${p.observacoes || ''}</small></td>
              <td onclick="window.location.href='/metaltech/ordem?id=${p.id}&cliente=${p.cliente?.nome}&data=${p.createdAt}'">${services.badge(p.status)}</td>
              <td onclick="window.location.href='/metaltech/ordem?id=${p.id}&cliente=${p.cliente?.nome}&data=${p.createdAt}'" style="font-size:0.75rem; line-height:1.4;">${new Date(p.createdAt).getTime() === new Date(p.updatedAt).getTime()? `<div style="margin-bottom:6px;"><span style="display:block; font-size:0.65rem; color:var(--muted); margin-bottom:2px;">Criado em</span>
                      <strong style="font-size:0.7rem; font-weight:100;">
                        ${new Date(p.createdAt).toLocaleString('pt-BR')}
                      </strong>
                    </div>
                  `
                  : `
                    <div style="margin-bottom:6px;">
                      <span style="display:block; font-size:0.65rem; color:var(--muted); margin-bottom:2px;">Criado em</span>
                      <strong style="font-size:0.7rem; font-weight:100;">
                        ${new Date(p.createdAt).toLocaleString('pt-BR')}
                      </strong>
                    </div>

                    <div>
                      <span style="display:block; font-size:0.65rem; color:var(--muted); margin-bottom:2px;">Última alteração</span>
                      <strong style="font-size:0.7rem; font-weight:100;">
                        ${new Date(p.updatedAt).toLocaleString('pt-BR')}
                      </strong>
                    </div>
                  `
                }
              </td>
              <td class="td-acoes">
                <div style="display:flex;gap:5px">
                  <button class="btn btn-blue btn-sm" onclick="abrirStatus('${p._id}','${p.status}')">📝</button>
              ${!isAtendente ? `
                    <button class="btn btn-danger btn-sm" onclick="deletarordem('${p._id}', '${p.usuario?.nome || '—'}')">🗑️</button>
                  </div>
                </td>
              ` : ''}

            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    el.innerHTML = `<div class="empty" style="color:var(--primary)">${e.message}</div>`;
  }
}

let ordensCache = [];
export function aplicarFiltroOrdens(status) {
  const el = document.getElementById('tbl-ordens');
  const usuario = JSON.parse(localStorage.getItem('pz_usuario') || '{}');
  const perfil = usuario?.perfil || '';
  const isAtendente = perfil === 'Atendente';

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
          <th>#</th><th>Cliente</th><th>Itens</th><th>Status</th><th>Data</th>${!isAtendente ? '<th>Ações</th>' : 'Status'}
        </tr>
      </thead>
      <tbody>
        ${filtradas.map(p => `
          <tr>
            <td>
                <div>
                  <strong style="color:var(--primary)">
                    #${
                      p.numeroOrdem
                        ? String(p.numeroOrdem).padStart(3, '0')
                        : '???'
                    }
                  </strong>
                </div>

                <small style="color:var(--muted); font-size: 11px">
                  ${p.usuario?.nome || '—'}
                </small>
              </td>
              <td><strong>${p.cliente?.nome || '—'}</strong><br><small style="color:var(--muted)">${p.cliente?.telefone || ''}</small></td>
              <td style="font-size:.76rem"><div>${p.itens.map(it => `${it.quantidade}x ${it.nomeProduto || '?'}`).join('<br>')}</div><small style="color:var(--muted); font-size: 11px">${p.observacoes || ''}</small></td>
              <td>${services.badge(p.status)}</td>
              <td style="font-size:0.75rem; line-height:1.4;">
                ${
                  new Date(p.createdAt).getTime() === new Date(p.updatedAt).getTime()
                    ? `
                      <div style="margin-bottom:6px;">
                        <span style="display:block; font-size:0.65rem; color:var(--muted); margin-bottom:2px;">
                          Criado em
                        </span>
                        <strong style="font-size:0.7rem; font-weight:100;">
                          ${new Date(p.createdAt).toLocaleString('pt-BR')}
                        </strong>
                      </div>
                    `
                    : `
                      <div style="margin-bottom:6px;">
                        <span style="display:block; font-size:0.65rem; color:var(--muted); margin-bottom:2px;">
                          Criado em
                        </span>
                        <strong style="font-size:0.7rem; font-weight:100;">
                          ${new Date(p.createdAt).toLocaleString('pt-BR')}
                        </strong>
                      </div>

                      <div>
                        <span style="display:block; font-size:0.65rem; color:var(--muted); margin-bottom:2px;">
                          Última alteração
                        </span>
                        <strong style="font-size:0.7rem; font-weight:100;">
                          ${new Date(p.updatedAt).toLocaleString('pt-BR')}
                        </strong>
                      </div>
                    `
                }
              </td>
              <td class="td-acoes">
                <div style="display:flex;gap:5px">
                  <button class="btn btn-blue btn-sm" onclick="abrirStatus('${p._id}','${p.status}')">📝</button>
              ${!isAtendente ? `
                    <button class="btn btn-danger btn-sm" onclick="deletarordem('${p._id}')">🗑️</button>
                  </div>
                </td>
              ` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

//====================================
//função de abrir ordens
//====================================

export async function abrirOrdem() {
  try {
    // Rota alterada para produtos
    if (!cProdutos.length) {
      cProdutos = await services.api('GET', '/produtos');
    }
    if (!cClientes.length) {
      cClientes = await services.api('GET', '/clientes');
    }
  } catch (e) {
    toast('Erro ao carregar dados', 'err');
    console.error(e);
    return;
  }

  // Usar services.cache.cClientes, não cClientes
  document.getElementById('ped-cli').innerHTML =
    '<option value="">— Selecione o cliente —</option>' +
    cClientes
      .map(c => `<option value="${c._id}">${c.nome} · ${c.telefone}</option>`)
      .join('');

  document.getElementById('itens-lista').innerHTML = '';
  document.getElementById('ped-obs').value = '';

  addItem();
  services.abrir('m-ordem');
}

//====================================
//função de adicionar item
//====================================

export function addItem() {
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

export function recalc() {
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

export async function salvarordem() {
  const cliId = document.getElementById('ped-cli').value;
  if (!cliId) { toast('Selecione um cliente', 'err'); return; }
  const usuario = JSON.parse(localStorage.getItem('pz_usuario'));
  
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
    await services.api('POST', '/ordens', {
      cliente:        cliId,
      itens,
      observacoes:    document.getElementById('ped-obs').value,
      userId:         usuario.id || usuario._id,
    });
    toast('ordem de produção criada! ⚒️');
    fechar('m-ordem');
    carregarordens();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

//====================================
//função de abrir status de ordem
//====================================

export function abrirStatus(id, status) {
  document.getElementById('st-id').value  = id;
  document.getElementById('st-val').value = status;
  abrir('m-status');
}

//====================================
//função de salavr status de ordem
//====================================

export async function salvarStatus() {
  const id     = document.getElementById('st-id').value;
  const status = document.getElementById('st-val').value;
  const userId = JSON.parse(localStorage.getItem('pz_usuario'))?.id || JSON.parse(localStorage.getItem('pz_usuario'))?._id;
  try {
    // Rota alterada para ordens
    await services.api('PATCH', '/ordens/' + id + '/status', { status });
    toast('Status atualizado!');
    fechar('m-status');
    carregarordens();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

//====================================
//função de deletar ordem
//====================================

export async function deletarordem(id, usuario) {
  const userId = JSON.parse(localStorage.getItem('pz_usuario'))?.id || JSON.parse(localStorage.getItem('pz_usuario'))?._id;
  if (!confirm(`Você tem certeza que deseja deletar esta ordem criada por ${usuario}?`)) return;
  try {
    // Rota alterada para ordens
    await services.api('DELETE', '/ordens/' + id, {userId: userId});
    toast('ordem deletado!');
    carregarordens();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}
