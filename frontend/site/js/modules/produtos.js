import * as services from '/js/services/index.js';

export async function carregarProdutos() {
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
  const usuarioId =JSON.parse(localStorage.getItem('pz_usuario') || 'null')?.id
  if (!nome) { toast('Insira o nome do produto', 'err'); return; }

  const d = {
    nome,
    descricao:    document.getElementById('p-desc').value.trim(),
    disponivel: document.getElementById('p-disp').value,
    usuarioId: usuarioId
  };

  try {
    // Rotas alteradas para produtos
    await api('POST', '/produtos', d);
    toast(id ? 'Produto atualizado!' : 'Produto criado!');
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
  const usuarioId = JSON.parse(localStorage.getItem('pz_usuario') || 'null')?.id

  // Validações iniciais
  if (!nome) {
    toast('Insira o nome do produto', 'err');
    return;
  }

  if (!id) {
    toast('Erro: ID de produto inválido', 'err');
    return;
  }

  try {
    // Criação do corpo da requisição
    let body = { nome, descricao, disponivel, usuarioId };
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
  if (!confirm(`Você tem certeza que deseja deletar o produto "${nome}"?`)) return;
  const usuarioId = JSON.parse(localStorage.getItem('pz_usuario') || 'null')?.id
  try {
    // Rota alterada para produtos
    await api('DELETE', '/produtos/' + id, {usuarioId: usuarioId});
    toast('Produto deletada!');
    carregarProdutos();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}

//====================================
//função de carregar clientes
//====================================