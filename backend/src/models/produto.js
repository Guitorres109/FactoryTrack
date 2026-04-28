const { ready, query, run, get } = require('../database/sqlite');


//Formatar pizza
function formatarPizza(row) {

  if (!row) {
    console.log('⚠️ Row inválido');
    return null;
  }

  const resultado = {
    _id:         row.id,
    id:          row.id,
    nome:        row.nome,
    descricao:   row.descricao,
    disponivel: Number(row.disponivel) === 1,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };

  return resultado;
}

//Objeto de pizza
const Produtos = {

  //Buscar todas as pizzas
  async findAll() {
    await ready;
    return query('SELECT * FROM produtos ORDER BY nome').map(formatarPizza);
  },

  async findById(id) {
    await ready;
    return formatarPizza(get('SELECT * FROM produtos WHERE id = ?', [id]));
  },

  async create({ nome, descricao = '', disponivel }) {
      await ready;

      const info = run(
        'INSERT INTO produtos (nome, descricao, disponivel) VALUES (?, ?, ?)',
        [
          nome.trim(),
          descricao.trim(),
          disponivel ? 1 : 0,
        ]
      );

      return this.findById(info.lastInsertRowid);
    },

  //Update de modelos de pizza
  async update(id, { nome, descricao, disponivel}) {
    await ready;
    const atual = get('SELECT * FROM produtos WHERE id = ?', [id]);
    if (!atual) return null;
    console.log(nome, descricao, disponivel)

    run(`
      UPDATE produtos SET
        nome         = ?,
        descricao    = ?,
        disponivel   = ?,
        updated_at   = datetime('now')
      WHERE id = ?
    `, [
      nome         ?? atual.nome,
      descricao    ?? atual.descricao,
      disponivel   ?? atual.disponivel,
      id
    ]);
    

    return this.findById(id);
  },

  //Deletar pizzas do banco de dados

  async delete(id) {
    await ready;
    const info = run('DELETE FROM produtos WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = Produtos;