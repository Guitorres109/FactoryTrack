const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

// Conectar ao Banco
const DB_PATH = process.env.DB_PATH
  || path.join(__dirname, '..', '..', 'database.db');

const state = { db: null };

const ready = (async () => {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    state.db = new SQL.Database(fileBuffer);
  } else {
    state.db = new SQL.Database();
  }

  const db = state.db;

  // Ativar FK
  db.run('PRAGMA foreign_keys = ON');

  // usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      senha       TEXT    NOT NULL,
      perfil      TEXT    NOT NULL DEFAULT 'administrativo',
      ativo       INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // clientes
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT    NOT NULL,
      telefone    TEXT    NOT NULL,
      endereco    TEXT    NOT NULL DEFAULT '{}',
      observacoes TEXT    NOT NULL DEFAULT '',
      ativo       INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // produtos
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nome         TEXT    NOT NULL,
      descricao    TEXT    NOT NULL DEFAULT '',
      precos       TEXT    NOT NULL DEFAULT '',
      disponivel   INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // ordens
  db.run(`
    CREATE TABLE IF NOT EXISTS ordens (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_ordem    INTEGER,
      cliente_id      INTEGER NOT NULL REFERENCES clientes(id),
      total           REAL    NOT NULL DEFAULT 0,
      status          TEXT    NOT NULL DEFAULT '',
      observacoes     TEXT    NOT NULL DEFAULT '',
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      usuario_id      INTEGER NOT NULL DEFAULT 1 REFERENCES usuarios(id)
    )
  `);

  // itens_pedido
  db.run(`
    CREATE TABLE IF NOT EXISTS itens_pedido (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id        INTEGER NOT NULL REFERENCES ordens(id),
      produto_id       INTEGER NOT NULL REFERENCES produtos(id),
      nome_produto     TEXT    NOT NULL,
      quantidade       INTEGER NOT NULL DEFAULT 1,
      preco_unitario   REAL    NOT NULL DEFAULT 0
    )
  `);

  salvar();

  console.log('SQLite (sql.js) conectado:', DB_PATH);
  return db;
})();

// salvar DB
function salvar() {
  if (!state.db) return;
  const data = state.db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// SELECT
function query(sql, params = []) {
  const stmt = state.db.prepare(sql);
  const results = [];
  stmt.bind(params);

  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }

  stmt.free();
  return results;
}

// INSERT/UPDATE/DELETE
function run(sql, params = []) {
  state.db.run(sql, params);
  const meta = query('SELECT last_insert_rowid() as id, changes() as changes');
  salvar();

  return {
    lastInsertRowid: meta[0]?.id,
    changes: meta[0]?.changes,
  };
}

// SELECT único
function get(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

module.exports = { ready, query, run, get, salvar };