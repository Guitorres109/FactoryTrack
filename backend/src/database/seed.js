const { ready, run, get } = require('./sqlite');

(async () => {
  try {
    await ready;

    console.log('🌱 Populando banco...');

    // ============================
    // USUÁRIOS
    // ============================
    run(`
      INSERT INTO usuarios (nome, email, senha, perfil)
      VALUES (?, ?, ?, ?)
    `, ['Administrador', 'admin@email.com', '123456', 'Administrador']);

    run(`
      INSERT INTO usuarios (nome, email, senha, perfil)
      VALUES (?, ?, ?, ?)
    `, ['Atendente', 'user@email.com', '123456', 'Atendente']);

    // ============================
    // CLIENTES
    // ============================
    run(`
      INSERT INTO clientes (nome, telefone, endereco, observacoes)
      VALUES (?, ?, ?, ?)
    `, ['João Silva', '11999999999', 'Rua A, 123', 'Cliente frequente']);

    run(`
      INSERT INTO clientes (nome, telefone, endereco, observacoes)
      VALUES (?, ?, ?, ?)
    `, ['Maria Souza', '11988888888', 'Rua B, 456', 'Prefere sem cebola']);

    // ============================
    // PRODUTOS
    // ============================
    run(`
      INSERT INTO produtos (nome, descricao, precos, disponivel)
      VALUES (?, ?, ?, ?)
    `, ['Pizza Calabresa', 'Calabresa com cebola', '{"media":30,"grande":40}', 1]);

    run(`
      INSERT INTO produtos (nome, descricao, precos, disponivel)
      VALUES (?, ?, ?, ?)
    `, ['Pizza Mussarela', 'Mussarela tradicional', '{"media":28,"grande":38}', 1]);

    run(`
      INSERT INTO produtos (nome, descricao, precos, disponivel)
      VALUES (?, ?, ?, ?)
    `, ['Pizza Chocolate', 'Chocolate com morango', '{"media":35,"grande":45}', 1]);

    // ============================
    // CRIAR PEDIDO
    // ============================
    const cliente = get('SELECT id FROM clientes LIMIT 1');
    const clienteId = cliente?.id;

    const pedido = run(`
      INSERT INTO ordens (numero_ordem, cliente_id, total, status, observacoes)
      VALUES (?, ?, ?, ?, ?)
    `, [1, clienteId, 100, 'recebido', 'Sem cebola']);

    const pedidoId = pedido.lastInsertRowid;

    // ============================
    // ITENS DO PEDIDO
    // ============================
    run(`
      INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, quantidade, preco_unitario)
      VALUES (?, ?, ?, ?, ?)
    `, [pedidoId, 1, 'Pizza Calabresa', 2, 40]);

    run(`
      INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, quantidade, preco_unitario)
      VALUES (?, ?, ?, ?, ?)
    `, [pedidoId, 2, 'Pizza Mussarela', 1, 30]);

    console.log('✅ Seed finalizado com sucesso!');
    process.exit();

  } catch (err) {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  }
})();