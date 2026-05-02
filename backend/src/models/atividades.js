const { ready, query, run, get } = require('../database/sqlite');


//Formatar atividades
function formatarAtividades(row) {

  if (!row) {
    return null;
  }

  const resultado = {
    _id:         row.id,
    id:          row.id,
    usuarioId:   row.usuario_id,
    atividade:   row.atividade,
    area:          row.area,
    areaItem:      row.areaItem
  };

  return resultado;
}

//Objeto de atividades
const Atividades = {
  //Buscar todas as atividades
  async findAll() {
    await ready;
    return query('SELECT * FROM atividades ORDER BY atividade').map(formatarAtividades);
  },

  async findById(id) {
    await ready;
    return formatarAtividades(get('SELECT * FROM atividades WHERE id = ?', [id]));
  },

  async delete(id) {
    await ready;
    const info = run('DELETE FROM atividades WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = Atividades;