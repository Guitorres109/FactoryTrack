const { ready, query, run, get } = require('../database/sqlite');

// ==============================
// FUNÇÃO SEGURA PARA JSON
// ==============================
function safeParse(value) {
  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch {
    return value; // mantém string se não for JSON
  }
}

// ==============================
// FORMATAR CLIENTE
// ==============================
function formatarCliente(row) {
  if (!row) return null;

  return {
    _id:        row.id,
    id:         row.id,
    nome:       row.nome,
    telefone:   row.telefone,
    endereco:   safeParse(row.endereco),
    observacoes: row.observacoes,
    ativo:      row.ativo === 1,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  };
}

// ==============================
// OBJETO CLIENTE
// ==============================
const Cliente = {

  async findAll(busca = '') {
    await ready;

    let rows;

    if (busca) {
      const t = `%${busca}%`;
      rows = query(
        'SELECT * FROM clientes WHERE ativo = 1 AND (nome LIKE ? OR telefone LIKE ?) ORDER BY nome',
        [t, t]
      );
    } else {
      rows = query('SELECT * FROM clientes WHERE ativo = 1 ORDER BY nome');
    }

    return rows.map(formatarCliente);
  },

  // Buscar por ID
  async findById(id) {
    await ready;
    return formatarCliente(get('SELECT * FROM clientes WHERE id = ?', [id]));
  },

  // Criar cliente
  async create({ nome, telefone, endereco = {}, observacoes = '' }) {
    await ready;

    const enderecoFinal =
      typeof endereco === 'object'
        ? JSON.stringify(endereco)
        : endereco; // aceita string também

    const info = run(
      'INSERT INTO clientes (nome, telefone, endereco, observacoes) VALUES (?, ?, ?, ?)',
      [nome.trim(), telefone.trim(), enderecoFinal, observacoes]
    );

    return this.findById(info.lastInsertRowid);
  },

  async update(id, { nome, telefone, endereco, observacoes, ativo }) {
  await ready;

  const atual = await get(
    'SELECT * FROM clientes WHERE id = ?',
    [id]
  );

  if (!atual) return null;

  const endAtual = safeParse(atual.endereco);

  const endFinal =
    endereco && typeof endereco === 'object'
      ? { ...endAtual, ...endereco }
      : endAtual;

  await run(`
    UPDATE  clientes SET
      nome        = ?,
      telefone    = ?,
      endereco    = ?,
      observacoes = ?,
      ativo       = ?,
      updated_at  = datetime('now')
    WHERE id = ?
  `, [
    nome ?? atual.nome,
    telefone ?? atual.telefone,
    JSON.stringify(endFinal),
    observacoes ?? atual.observacoes,
    ativo !== undefined ? (ativo ? 1 : 0) : atual.ativo,
    id
  ]);

  return await this.findById(id);
},

  // Deletar
  async delete(id) {
    await ready;
    const info = run('DELETE FROM clientes WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = Cliente;