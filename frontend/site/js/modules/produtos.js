import * as services from '/js/services/index.js';
let cProdutos = JSON.parse(sessionStorage.getItem('Produtos') || '[]');

//====================================
//Carregar produtos na lista
//====================================

export async function carregarProdutos() {
  const el = document.getElementById('tbl-Produtos');

  if (!el) return;

  el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';

  try {
    await services.cache?.();

    let produtos = JSON.parse(sessionStorage.getItem('Produtos') || '[]');

    // 🔥 se não tiver cache, busca API
    if (!Array.isArray(produtos) || !produtos.length) {
      produtos = await services.api('GET', '/produtos') || [];
      console.log('buscando produtos')

      // salva cache
      sessionStorage.setItem('Produtos', JSON.stringify(produtos));
    }

    if (!produtos.length) {
      el.innerHTML = '<div class="empty">Nenhum produto encontrado</div>';
      return;
    }

    el.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          ${produtos.map(p => `
            <tr>

              <td>
                <strong>${p.nome}</strong><br>
                <small style="color:var(--muted)">
                  ${p.descricao || ''}
                </small>
              </td>

              <td>
                <span class="badge ${Number(p.disponivel) === 1 ? 'b-on' : 'b-off'}">
                  ${badgeDisponivel(Number(p.disponivel))}
                </span>
              </td>

              <td>
                <div style="display:flex;gap:5px">

                  <button
                    class="btn btn-ghost btn-sm"
                    onclick="abrirEdicaoProduto('${p._id}')">
                    ✏️
                  </button>

                  <button
                    class="btn btn-danger btn-sm"
                    onclick="deletarProduto('${p._id}','${p.nome}')">
                    🗑️
                  </button>

                </div>
              </td>

            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (e) {
    console.error(e);
    el.innerHTML = `<div class="empty" style="color:var(--red)">${e.message}</div>`;
  }
}

//====================================
//Atualizar produtos na lista
//====================================

export async function syncProdutosCache() {
  try {
    await services.cache?.();

    let produtos = await services.api('GET', '/produtos') || [];

    if (!Array.isArray(produtos)) return [];

    // 🔥 atualiza memória global
    cProdutos = produtos;

    // 💾 atualiza sessionStorage
    sessionStorage.setItem('Produtos', JSON.stringify(produtos));

    // 🔄 auto refresh da tela
    const el = document.getElementById('tbl-Produtos');

    if (el) {
      carregarProdutos();
    }

    return produtos;

  } catch (e) {
    console.error('Erro ao sincronizar produtos:', e);
    return [];
  }
}

//====================================
//Abrir modal de criar os produtos
//====================================

export function abrirProduto() {
  document.getElementById('m-Produto-t').textContent = 'Novo Produto';
  document.getElementById('p-disp').value = '1';
  abrir('m-Produto');
}

//====================================
//função de salvar Produtos no DB
//====================================

export async function salvarProduto() {
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
    await syncProdutosCache()
  } catch (e) { toast('Erro: ' + e.message, 'err'); console.log(e.message)}
}

//====================================
//Abrir modal para editar os produtos
//====================================

export function abrirEdicaoProduto(id) {
  abrir("e-produto");

  const produto = cProdutos.find(
    p => String(p._id) === String(id)
  );

  if (!produto) return;

  document.getElementById('p-id').value = produto._id || '';
  document.getElementById('e-nomeproduto').value = produto.nome || '';
  document.getElementById('e-desc').value = produto.descricao || '';
  document.getElementById('e-disp').value = produto.disponivel ? 1 : 0;
}

//====================================
//Editar os produtos
//====================================

export async function editarProduto() {
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
    await syncProdutosCache()
    
  } catch (e) {
    toast('Erro: ' + (e.message || 'desconhecido'), 'err');
    console.log(e)
  }
}
//====================================
//função de deletar Produtos
//====================================

export async function deletarProduto(id, nome) {
  if (!confirm(`Você tem certeza que deseja deletar o produto "${nome}"?`)) return;
  const usuarioId = JSON.parse(localStorage.getItem('pz_usuario') || 'null')?.id
  try {
    // Rota alterada para produtos
    await api('DELETE', '/produtos/' + id, {usuarioId: usuarioId});
    toast('Produto deletada!');
    await syncProdutosCache()
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}