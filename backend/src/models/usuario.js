
const { ready, query, run, get } = require('../database/sqlite');
const bcrypt = require('bcryptjs');

function formatarUsuario(row) {
  if (!row) return null;
  return {
    _id:       row.id,
    id:        row.id,
    nome:      row.nome,
    email:     row.email,
    perfil:    row.perfil,
    ativo:     row.ativo === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const Usuario = {

  //Pegar todos os usuarios
  async findAll() {
    await ready;
    const rows = query(`
      SELECT id, nome, email, perfil, ativo, created_at, updated_at
      FROM usuarios ORDER BY created_at DESC
    `);
    return rows.map(formatarUsuario);
  },

  //Buscar usuarios pore email
  async findByEmail(email) {
    await ready;
    return get('SELECT * FROM usuarios WHERE email = ?', [email.toLowerCase().trim()]);
  },

  //Buscar usuarios por ID
  async findById(id) {
    await ready;
    const row = get(`
      SELECT id, nome, email, perfil, ativo, created_at, updated_at
      FROM usuarios WHERE id = ?
    `, [id]);
    return formatarUsuario(row);
  },

  //Criar usuarios 

  async create({ nome, email, senha, perfil = 'Atendente', usuarioId }) {
    await ready;
    const hash = await bcrypt.hash(senha, 10);
    const info = run(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
      [nome.trim(), email.toLowerCase().trim(), hash, perfil]
    );
    const atividade = run(
      'INSERT INTO atividades (usuarioId, atividade, area, areaItem) VALUES (?, ?, ?, ?)',
      [usuarioId, 'Criou', 'usuarios', nome.trim()]
    )
    return this.findById(info.lastInsertRowid);
  },


  //Atualizar usuarios
  async update(id, { nome, email, senha, perfil, ativo, usuarioId }) {
  await ready;

  const atual = await get(
    'SELECT * FROM usuarios WHERE id = ?',
    [id]
  );

  if (!atual) return null;

  let emailFinal = atual.email;

  // Só verifica duplicidade se o email foi alterado
  if (email && email !== atual.email) {
    const existente = await get(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );

    // Se NÃO existir outro usuário com o email, permite atualizar
    if (!existente) {
      emailFinal = email;
    }
    // Se existir, mantém o email antigo (não atualiza)
  }

  let senhaFinal = atual.senha;
  if (senha) {
    senhaFinal = await bcrypt.hash(senha, 10);
  }

  await run(`
    UPDATE usuarios SET
      nome       = ?,
      email      = ?,
      senha      = ?,
      perfil     = ?,
      ativo      = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `, [
    nome   ?? atual.nome,
    emailFinal,
    senhaFinal,
    perfil ?? atual.perfil,
    ativo !== undefined ? (ativo ? 1 : 0) : atual.ativo,
    id
  ]);
  const atividade = run(
      'INSERT INTO atividades (usuarioId, atividade, area, areaItem) VALUES (?, ?, ?, ?)',
      [usuarioId, 'Editou', 'usuarios', nome.trim()]
    )
  console.log('Atividade registrada:', { usuarioId, atividade: 'Editou', area: 'usuarios', areaItem: nome.trim() });
  return await this.findById(id);
},

  //Deletar usuarios
  async delete(id, usuarioId) {
    await ready;
    const usuarioExcluido = await this.findById(id);
    const info = run('DELETE FROM usuarios WHERE id = ?', [id]);
    const atividade = run(
      'INSERT INTO atividades (usuarioId, atividade, area, areaItem) VALUES (?, ?, ?, ?)',
      [usuarioId, 'Deletou', 'usuarios', usuarioExcluido.nome.trim()]
    );
    console.log('Atividade registrada:', { usuarioId, atividade: 'Deletou', area: 'usuarios', areaItem: usuarioExcluido.nome.trim() });
    return info.changes > 0;
  },

  verificarSenha(senhaDigitada, hashSalvo) {
    return bcrypt.compare(senhaDigitada, hashSalvo);
  },
};

module.exports = Usuario;
