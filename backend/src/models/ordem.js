const { ready, query, run, get } = require('../database/sqlite');

// ==============================
// SELECT BASE
// ==============================
const SELECT_ORDEM = `
  SELECT
    o.*,
    c.nome     AS cliente_nome,
    c.telefone AS cliente_telefone,
    u.nome     AS usuario_nome
  FROM ordens o
  LEFT JOIN clientes c ON c.id = o.cliente_id
  LEFT JOIN usuarios u ON u.id = o.usuario_id
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

    usuario: {
      id: row.usuario_id,
      nome: row.usuario_nome || '—'
    }
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
  async create({ clienteId, itens, observacoes = '', userId}) {
  await ready;

  const Produto = require('./produto');

  const itensProcessados = [];

  for (const item of itens) {
    // ⚠️ ajuste aqui: "Produto" com P maiúsculo
    const prod = await Produto.findById(item.produto);

    if (!prod) {
      throw new Error(`Produto ID ${item.Produto} não encontrado`);
    }

    itensProcessados.push({
      produtoId: prod.id,
      nomeProduto: prod.nome,
      quantidade: item.quantidade,
    });
  }

  // gerar número da ordem
  const contagem = get('SELECT COUNT(*) as total FROM ordens');
  const numeroOrdem = (contagem?.total || 0) + 1;

  const now = new Date();

    const brasilia = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );

    const formatted =
      brasilia.getFullYear() + "-" +
      String(brasilia.getMonth() + 1).padStart(2, "0") + "-" +
      String(brasilia.getDate()).padStart(2, "0") + " " +
      String(brasilia.getHours()).padStart(2, "0") + ":" +
      String(brasilia.getMinutes()).padStart(2, "0") + ":" +
      String(brasilia.getSeconds()).padStart(2, "0");
    

  // ⚠️ CORREÇÃO IMPORTANTE: número de placeholders
  const infoOrdem = run(`
    INSERT INTO ordens
      (numero_ordem, cliente_id, status, observacoes, created_at, updated_at, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [numeroOrdem, clienteId, 'recebido', observacoes, formatted, formatted, userId]);
  const atividade = run(
        'INSERT INTO atividades (usuarioId, atividade, area, areaItem) VALUES (?, ?, ?, ?)',
        [userId, 'Criou', 'ordens', numeroOrdem]
      )
      console.log('Atividade registrada:', { usuarioId: userId, atividade: 'Criou', area: 'ordens', areaItem: numeroOrdem });

  const ordemId = infoOrdem.lastInsertRowid;

  // inserir itens
  for (const it of itensProcessados) {
    run(`
      INSERT INTO itens_pedido
        (pedido_id, produto_id, nome_produto, quantidade)
      VALUES (?, ?, ?, ?)
    `, [ordemId, it.produtoId, it.nomeProduto, it.quantidade]);
  }

  return this.findById(ordemId);
},

  // ============================
  // ATUALIZAR STATUS
  // ============================
  async updateStatus(id, status) {
    await ready;

    const now = new Date();

    const brasilia = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );

    const ordem = await this.findById(id);

    const formatted =
      brasilia.getFullYear() + "-" +
      String(brasilia.getMonth() + 1).padStart(2, "0") + "-" +
      String(brasilia.getDate()).padStart(2, "0") + " " +
      String(brasilia.getHours()).padStart(2, "0") + ":" +
      String(brasilia.getMinutes()).padStart(2, "0") + ":" +
      String(brasilia.getSeconds()).padStart(2, "0");
    
    const info = run(
      "UPDATE ordens SET status = ?, updated_at = ? WHERE id = ?",
      [status, formatted, id]
    );

    return info.changes > 0 ? this.findById(id) : null;
  },

  // ============================
  // DELETAR
  // ============================
  async delete(id, userId) {
    await ready;

    const ordem = await this.findById(id);
    run('DELETE FROM itens_pedido WHERE pedido_id = ?', [id]);

    const info = run('DELETE FROM ordens WHERE id = ?', [id]);
    const atividade = run(
        'INSERT INTO atividades (usuarioId, atividade, area, areaItem) VALUES (?, ?, ?, ?)',
        [userId, 'Editou', 'ordens', ordem.numeroOrdem]
      )
      console.log('Atividade registrada:', { usuarioId: userId, atividade: 'Deletou', area: 'ordens', areaItem: ordem.numeroOrdem });

    return info.changes > 0;
  },
};

module.exports = Ordem;