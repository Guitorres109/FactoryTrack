const Ordem = require('./ordem');
const Produto = require('./produto');

async function seedOrdens() {
  console.log('🌱 Populando ordens...');

  // pega alguns produtos existentes
  const produtos = await Produto.findAll();

  if (!produtos || produtos.length === 0) {
    console.log('⚠️ Nenhum produto encontrado. Crie produtos antes.');
    return;
  }

  // clientes fake (ids precisam existir na sua base)
  const clientes = [1, 2, 3, 4, 5];

  // helper pra pegar produto aleatório
  const randomProduto = () =>
    produtos[Math.floor(Math.random() * produtos.length)];

  // criar 15 ordens
  for (let i = 0; i < 15; i++) {
    const itens = [];

    // cada ordem com 1 a 4 itens
    const qtdItens = Math.floor(Math.random() * 4) + 1;

    for (let j = 0; j < qtdItens; j++) {
      const prod = randomProduto();

      itens.push({
        produto: prod.id,
        quantidade: Math.floor(Math.random() * 3) + 1
      });
    }

    const clienteId =
      clientes[Math.floor(Math.random() * clientes.length)];

    const observacoesLista = [
      '',
      'Sem cebola',
      'Entrega rápida',
      'Cliente VIP',
      'Trocar bebida',
      'Caprichar no molho'
    ];

    const observacoes =
      observacoesLista[
        Math.floor(Math.random() * observacoesLista.length)
      ];

    try {
      await Ordem.create({
        clienteId,
        itens,
        observacoes
      });

      console.log(`✔ Ordem ${i + 1} criada`);
    } catch (err) {
      console.error('Erro ao criar ordem:', err.message);
    }
  }

  console.log('✅ Seed finalizado');
}

module.exports = seedOrdens;