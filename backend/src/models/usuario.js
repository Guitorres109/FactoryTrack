const { ready, query, run, get } = require('../database/sqlite');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function formatarUsuario(row) {
  if (!row) return null;
  return {
    _id:       row.id,
    id:        row.id,
    nome:      row.nome,
    email:     row.email,
    perfil:    row.perfil,
    ativo:     row.ativo === 1,
    foto:      row.foto,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const Usuario = {

  //Pegar todos os usuarios
  async findAll() {
    await ready;
    const rows = query(`
      SELECT id, nome, email, perfil, ativo, foto, created_at, updated_at
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
      SELECT id, nome, email, perfil, ativo, foto, created_at, updated_at
      FROM usuarios WHERE id = ?
    `, [id]);
    return formatarUsuario(row);
  },

  //Criar usuarios 

  async create({ nome, email, senha, perfil = 'Atendente', usuarioId, foto }) {
    await ready;

    // =====================================================
    // SENHA
    // =====================================================

    const hash = await bcrypt.hash(senha, 10);

    // =====================================================
    // INSERT INICIAL
    // =====================================================

    const info = run(
      `
        INSERT INTO usuarios
        (nome, email, senha, perfil)
        VALUES (?, ?, ?, ?)
      `,
      [
        nome.trim(),
        email.toLowerCase().trim(),
        hash,
        perfil
      ]
    );

    // ID REAL DO BANCO
    const novoId = info.lastInsertRowid;

    let fotoFinal = null;

    // =====================================================
    // FOTO
    // =====================================================

    if (foto) {

      const extensao = path.extname(foto);

      const nomeNovo =
        `usuario_${novoId}_${Date.now()}${extensao}`;

      const pasta = path.join(
        __dirname,
        '../database/uploads/usuarios'
      );

      const caminhoAntigo = path.join(pasta, foto);

      const caminhoNovo = path.join(pasta, nomeNovo);

      // cria pasta
      if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true });
      }

      // renomeia
      if (fs.existsSync(caminhoAntigo)) {

        try {

          fs.renameSync(caminhoAntigo, caminhoNovo);

          fotoFinal = nomeNovo;

          // atualiza foto no banco
          run(
            `
              UPDATE usuarios
              SET foto = ?
              WHERE id = ?
            `,
            [fotoFinal, novoId]
          );

        } catch (err) {

          console.error(
            'Erro ao renomear foto:',
            err
          );

        }

      }

    }
    run(
      `
        INSERT INTO atividades
        (usuarioId, atividade, area, areaItem)
        VALUES (?, ?, ?, ?)
      `,
      [
        usuarioId,
        'Criou',
        'usuarios',
        nome.trim()
      ]
    );

    return this.findById(novoId);
  },


  //Atualizar usuarios
  async update(id, { nome, email, senha, perfil, ativo, usuarioId, foto }) {
      await ready;

      const atual = await get(
        'SELECT * FROM usuarios WHERE id = ?',
        [id]
      );

      if (!atual) return null;

      // 📧 EMAIL
      let emailFinal = atual.email;

      if (email && email !== atual.email) {
        const existente = await get(
          'SELECT id FROM usuarios WHERE email = ? AND id != ?',
          [email, id]
        );

        if (existente) {
          throw new Error('E-mail já cadastrado');
        }

        emailFinal = email;
      }

      // 🔐 SENHA
      let senhaFinal = atual.senha;

      if (senha) {
        senhaFinal = await bcrypt.hash(senha, 10);
      }

      // 🖼️ FOTO
      let fotoFinal = atual.foto;

      if (foto && foto !== atual.foto) {

        const extensao = path.extname(foto);
        const nomeNovo = `usuario_${atual.id}_${Date.now()}${extensao}`;

        const pasta = path.join(__dirname, '../database/uploads/usuarios');

        const caminhoAntigo = path.join(pasta, foto);
        const caminhoNovo = path.join(pasta, nomeNovo);

        // 🔁 renomeia arquivo novo
        if (fs.existsSync(caminhoAntigo)) {
          try {
            fs.renameSync(caminhoAntigo, caminhoNovo);
          } catch (err) {
            console.error('Erro ao renomear arquivo:', err);
          }
        }

        fotoFinal = nomeNovo;

        // 🧹 remove foto antiga
        if (atual.foto && atual.foto !== 'default.png') {
          const fotoAntiga = path.join(pasta, atual.foto);

          if (fs.existsSync(fotoAntiga)) {
            try {
              fs.unlinkSync(fotoAntiga);
            } catch (err) {
              console.error('Erro ao remover foto:', err);
            }
          }
        }
      }

      // 🔒 GARANTIA ANTI-UNDEFINED (ESSENCIAL)
      const dados = {
        nome: nome ?? atual.nome,
        email: emailFinal,
        senha: senhaFinal,
        perfil: perfil ?? atual.perfil,
        ativo: ativo !== undefined ? (ativo ? 1 : 0) : atual.ativo,
        foto: fotoFinal
      };

      // 🔄 UPDATE SEGURO (sem undefined)
      await run(`
        UPDATE usuarios SET
          nome       = ?,
          email      = ?,
          senha      = ?,
          perfil     = ?,
          ativo      = ?,
          foto       = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `, [
        dados.nome,
        dados.email,
        dados.senha,
        dados.perfil,
        dados.ativo,
        dados.foto,
        id
      ]);

      // 📝 ATIVIDADE
      const nomeFinal = dados.nome.trim();

      run(
        'INSERT INTO atividades (usuarioId, atividade, area, areaItem) VALUES (?, ?, ?, ?)',
        [usuarioId, 'Editou', 'usuarios', nomeFinal]
      );

      return await this.findById(id);
    },

  //Deletar usuarios
  async delete(id, usuarioId) {
    await ready;

    const usuarioExcluido = await this.findById(id);

    // 🖼️ Remove a foto do disco (se existir)
    if (usuarioExcluido?.foto) {
      const caminhoFoto = path.join(
        __dirname,
        '../database/uploads/usuarios',
        usuarioExcluido.foto
      );
      if (fs.existsSync(caminhoFoto)) {
        if(usuarioExcluido.foto != 'default.png'){
          try {
            fs.unlinkSync(caminhoFoto);
          } catch (err) {
            console.error('Erro ao remover foto:', err);
          }
        }
      }
    }

    const info = run('DELETE FROM usuarios WHERE id = ?', [id]);

    run(
      'INSERT INTO atividades (usuarioId, atividade, area, areaItem) VALUES (?, ?, ?, ?)',
      [usuarioId, 'Deletou', 'usuarios', usuarioExcluido.nome.trim()]
    );
    return info.changes > 0;
  },

  async resetFoto(id) {
      await ready;

      const atual = await get(
        'SELECT foto FROM usuarios WHERE id = ?',
        [id]
      );

      if (!atual) return null;

      // 🧹 remove arquivo antigo
      if (atual.foto && atual.foto !== 'default.png') {
        const caminho = path.join(
          __dirname,
          '../database/uploads/usuarios',
          atual.foto
        );

        if (fs.existsSync(caminho)) {
          try {
            fs.unlinkSync(caminho);
            run(
              `UPDATE usuarios set foto = ? WHERE id = ?` , [
                'defalt.png', id
              ]
            )
          } catch (err) {
            console.error('Erro ao remover foto:', err);
          }
        }
      }

      // 🔄 update seguro (SEM undefined possível)
      await run(`
        UPDATE usuarios
        SET foto = 'default.png',
            updated_at = datetime('now')
        WHERE id = ?
      `, [id]);

      return this.findById(id);
    },

  verificarSenha(senhaDigitada, hashSalvo) {
    return bcrypt.compare(senhaDigitada, hashSalvo);
  },
};

module.exports = Usuario;
