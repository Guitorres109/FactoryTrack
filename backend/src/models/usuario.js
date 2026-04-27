
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

  async create({ nome, email, senha, perfil = 'Atendente' }) {
    await ready;
    const hash = await bcrypt.hash(senha, 10);
    const info = run(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
      [nome.trim(), email.toLowerCase().trim(), hash, perfil]
    );
    return this.findById(info.lastInsertRowid);
  },


  //Atualizar usuarios
  async update(id, { nome, email, senha, perfil, ativo }) {
  await ready;
  console.log(email)

  const atual = await get(
    'SELECT * FROM usuarios WHERE id = ?',
    [id]
  );

  if (!atual) return null;
  let existente 

  if (email === atual.email) {
    existente = await get(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );
    console.log(existente)

    if (existente) {
      email = atual.email
    }
  }

  let senhaFinal;

  if (senha) {senhaFinal = await bcrypt.hash(senha, 10);} 
  if (!senha){senhaFinal = atual.senha;}

  if(existente){
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
      email  ?? atual.email,
      senhaFinal,
      perfil ?? atual.perfil,
      ativo !== undefined ? (ativo ? 1 : 0) : atual.ativo,
      id
    ]);
  } else{
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
      email  ?? atual.email,
      senhaFinal,
      perfil ?? atual.perfil,
      ativo !== undefined ? (ativo ? 1 : 0) : atual.ativo,
      id
    ]);
  }

  return await this.findById(id);
},

  //Deletar usuarios
  async delete(id) {
    await ready;
    const info = run('DELETE FROM usuarios WHERE id = ?', [id]);
    return info.changes > 0;
  },

  verificarSenha(senhaDigitada, hashSalvo) {
    return bcrypt.compare(senhaDigitada, hashSalvo);
  },
};

module.exports = Usuario;
