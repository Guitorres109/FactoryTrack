const { ready, query, run, get } = require('../database/sqlite');

// ==============================
// SELECT BASE
// ==============================
const SELECT_ORDEM = `
  SELECT
    o.*,
    c.nome     AS cliente_nome,
    c.telefone AS cliente_telefone
  FROM ordens o
  LEFT JOIN clientes c ON c.id = o.cliente_id
`;

// ==============================
// FORMATAR ORDEM
// ==============================
function formatarOrdem(row, itens = []) {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    numeroOrdem: row.numero_ordem,

    cliente: {
      _id: row.cliente_id,
      id: row.cliente_id,
      nome: row.cliente_nome,
      telefone: row.cliente_telefone,
    },

    itens: itens.map(it => ({
      _id: it.id,
      produto: it.produto_id,
      nomeProduto: it.nome_produto,
      quantidade: it.quantidade,
      precoUnitario: it.preco_unitario
    })),

    status: row.status,
    observacoes: row.observacoes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==============================
// MODEL
// ==============================
const Ordem = {

  // ============================
  // LISTAR TODAS
  // ============================
  async findAll() {
    await ready;

    const rows = query(`${SELECT_ORDEM} ORDER BY o.created_at DESC`);

    return rows.map(row => {
      const itens = query(
        'SELECT * FROM itens_pedido WHERE pedido_id = ?',
        [row.id]
      );

      return formatarOrdem(row, itens);
    });
  },

  // ============================
  // BUSCAR POR ID
  // ============================
  async findById(id) {
    await ready;

    const row = get(`${SELECT_ORDEM} WHERE o.id = ?`, [id]);
    if (!row) return null;

    const itens = query(
      'SELECT * FROM itens_pedido WHERE pedido_id = ?',
      [id]
    );

    return formatarOrdem(row, itens);
  },

  // ============================
  // CRIAR ORDEM
  // ============================
  async create({ clienteId, itens, observacoes = '' }) {
    await ready;

    const Produto = require('./produto');

    const itensProcessados = [];
    let total = 0;

    for (const item of itens) {
      const prod = await Produto.findById(item.produto);

      if (!prod) {
        throw new Error(`Produto ID ${item.produto} não encontrado`);
      }

      const preco = 30; // valor fixo (pode melhorar depois)

      itensProcessados.push({
        produtoId: prod.id,
        nomeProduto: prod.nome,
        quantidade: item.quantidade,
        preco
      });

      total += preco * item.quantidade;
    }

    // gerar número da ordem
    const contagem = get('SELECT COUNT(*) as total FROM ordens');
    const numeroOrdem = (contagem?.total || 0) + 1;

    // criar ordem
    const infoOrdem = run(`
      INSERT INTO ordens
        (numero_ordem, cliente_id, total, status, observacoes)
      VALUES (?, ?, ?, ?, ?)
    `, [numeroOrdem, clienteId, total, 'recebido', observacoes]);

    const ordemId = infoOrdem.lastInsertRowid;

    // inserir itens
    for (const it of itensProcessados) {
      run(`
        INSERT INTO itens_pedido
          (pedido_id, produto_id, nome_produto, quantidade, preco_unitario)
        VALUES (?, ?, ?, ?, ?)
      `, [ordemId, it.produtoId, it.nomeProduto, it.quantidade, it.preco]);
    }

    return this.findById(ordemId);
  },

  // ============================
  // ATUALIZAR STATUS
  // ============================
  async updateStatus(id, status) {
    await ready;

    const info = run(
      "UPDATE ordens SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, id]
    );

    return info.changes > 0 ? this.findById(id) : null;
  },

  // ============================
  // DELETAR
  // ============================
  async delete(id) {
    await ready;

    run('DELETE FROM itens_pedido WHERE pedido_id = ?', [id]);

    const info = run('DELETE FROM ordens WHERE id = ?', [id]);

    return info.changes > 0;
  },
};

module.exports = Ordem;