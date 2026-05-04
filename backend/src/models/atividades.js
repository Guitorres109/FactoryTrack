const { ready, query, run, get } = require('../database/sqlite');
const Usuarios = require('./usuario');


async function formatarUsuario(usuarioId) {
  const usuario = await Usuarios.findById(usuarioId);

  return usuario ? usuario.nome : 'Usuário Desconhecido';
}

//Formatar atividades
async function formatarAtividades(row) {
  if (!row) return null;

  const userName = await formatarUsuario(row.usuarioId);

  const resultado = {
    _id: row.id,
    id: row.id,
    usuario: userName,
    usuarioId: row.usuarioId,
    atividade: row.atividade,
    area: row.area,
    areaItem: row.areaItem
  };
  
  return resultado;
}

//Objeto de atividades
const Atividades = {
  //Buscar todas as atividades
  async findAll() {
    await ready;

    const rows = query('SELECT * FROM atividades ORDER BY atividade');

    const atividades = await Promise.all(
      rows.map(row => formatarAtividades(row))
    );

    return atividades;
  },

  async findAll() {
    await ready;

    run(`
      DELETE FROM atividades
      WHERE id NOT IN (
        SELECT id FROM atividades
        ORDER BY id DESC
        LIMIT 8
      )
    `);

    const rows = query(`
      SELECT * FROM atividades
      ORDER BY id DESC
      LIMIT 8
    `);

    return await Promise.all(
      rows.map(row => formatarAtividades(row))
    );
  },

  async delete(id) {
    await ready;
    const info = run('DELETE FROM atividades WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = Atividades;