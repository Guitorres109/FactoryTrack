//Arquivo que insere valores iniciais ao banco de dados

require('dotenv').config();
const { ready, run, query } = require('./sqlite');
const bcrypt = require('bcryptjs');

async function seed() {
  //deletar dados do banco
  try {
    await ready;
    console.log('🧹 Limpando banco...');

    run('DELETE FROM itens_pedido');
    run('DELETE FROM ordens');
    run('DELETE FROM produtos');
    run('DELETE FROM clientes');
    run('DELETE FROM usuarios');

    try {
      run("DELETE FROM sqlite_sequence WHERE name IN ('itens_pedido','ordens','pizzas','clientes','usuarios')");
    } catch(_) { }

    console.log('✅ Banco limpo');
    //Criptografar senhas:
    const hash = await bcrypt.hash('123456', 10);
    //Inserir usuarios:
    run('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
      ['Administrador Master', 'admin@gmail.com', hash, 'Administrador']);

    console.log('✅ 3 usuários criados');

    const clientes = [ //Array de clientes
      ['Serralheria Ferreira Santos',   '11991234501', {rua:'Rua das Acácias',numero:'142',bairro:'Vila Madalena',cidade:'São Paulo',cep:'05435-000'}, 'Exige laudo técnico dos materiais'],
      ['Indústria Metalúrgica Lima',    '11991234502', {rua:'Av. Paulista',numero:'900',bairro:'Bela Vista',cidade:'São Paulo',cep:'01310-100'}, ''],
      ['Construtora Oliveira Costa',    '11991234503', {rua:'Rua Oscar Freire',numero:'55',bairro:'Jardins',cidade:'São Paulo',cep:'01426-001'}, 'Prefere entrega após 19h'],
      ['Usinagem Martins Souza',        '11991234504', {rua:'Rua Consolação',numero:'310',bairro:'Consolação',cidade:'São Paulo',cep:'01302-000'}, ''],
      ['Estamparia Almeida Pereira',    '11991234505', {rua:'Rua Augusta',numero:'780',bairro:'Cerqueira César',cidade:'São Paulo',cep:'01304-001'}, 'Entregar em caminhão munck'],
      ['Tornearia Nascimento Dias',     '11991234506', {rua:'Rua Haddock Lobo',numero:'220',bairro:'Jardim América',cidade:'São Paulo',cep:'01414-000'}, ''],
      ['Montagens Metálicas Mendes',    '11991234507', {rua:'Alameda Santos',numero:'415',bairro:'Cerqueira César',cidade:'São Paulo',cep:'01419-000'}, 'Cliente VIP - Prioridade na produção'],
      ['Galvanoplastia Gomes Ribeiro',  '11991234508', {rua:'Rua Fradique Coutinho',numero:'88',bairro:'Pinheiros',cidade:'São Paulo',cep:'05416-010'}, ''],
      ['Soldas Barbosa Freitas',        '11991234509', {rua:'Rua Wisard',numero:'305',bairro:'Vila Madalena',cidade:'São Paulo',cep:'05434-080'}, 'Sem óleo protetivo nas ordens de produção'],
      ['Fundição Teixeira Moura',       '11991234510', {rua:'Rua Amauri',numero:'60',bairro:'Itaim Bibi',cidade:'São Paulo',cep:'01448-000'}, ''],
      ['Caldeiraria Cardoso Nunes',     '11991234511', {rua:'Rua Pamplona',numero:'1200',bairro:'Jardim Paulista',cidade:'São Paulo',cep:'01405-002'}, ''],
      ['Estruturas Rocha Vieira',       '11991234512', {rua:'Av. Brigadeiro Faria Lima',numero:'2000',bairro:'Pinheiros',cidade:'São Paulo',cep:'01452-000'}, 'Prefere faturamento via boleto'],
      ['Autopeças Silva Campos',        '11991234513', {rua:'Rua Estados Unidos',numero:'175',bairro:'Jardim América',cidade:'São Paulo',cep:'01427-000'}, ''],
      ['Ferramentas Araújo Castro',     '11991234514', {rua:'Rua José Maria Lisboa',numero:'530',bairro:'Jardim Paulista',cidade:'São Paulo',cep:'01423-000'}, 'Corte sob medida'],
      ['Equipamentos Cunha Rezende',    '11991234515', {rua:'Rua Ministro Rocha Azevedo',numero:'72',bairro:'Cerqueira César',cidade:'São Paulo',cep:'01410-001'}, ''],
      ['Máquinas Lopes Guimarães',      '11991234516', {rua:'Rua Bela Cintra',numero:'450',bairro:'Consolação',cidade:'São Paulo',cep:'01415-000'}, 'Embalagem resistente à umidade'],
      ['Implementos Pires Andrade',     '11991234517', {rua:'Rua da Consolação',numero:'1800',bairro:'Higienópolis',cidade:'São Paulo',cep:'01301-100'}, ''],
      ['Artefatos Moreira Fonseca',     '11991234518', {rua:'Av. Higienópolis',numero:'618',bairro:'Higienópolis',cidade:'São Paulo',cep:'01238-001'}, 'Cliente frequente'],
      ['Tubos Tavares Monteiro',        '11991234519', {rua:'Rua Itapeva',numero:'286',bairro:'Bela Vista',cidade:'São Paulo',cep:'01332-000'}, ''],
      ['Chapas Batista Pinto',          '11991234520', {rua:'Rua Peixoto Gomide',numero:'1100',bairro:'Jardim Paulista',cidade:'São Paulo',cep:'01409-001'}, 'Prefere acabamento polido'],
    ];

    for (const [nome, tel, end, obs] of clientes) {
      run('INSERT INTO clientes (nome, telefone, endereco, observacoes) VALUES (?, ?, ?, ?)',
        [nome, tel, JSON.stringify(end), obs]);
    }
    console.log('✅ 20 clientes criados');

    const produtos = [   //Array de Produtos
      ['Bobina de Aço Carbono','Material laminado a frio com excelente acabamento superficial para estamparia','SAE 1008/1010',{P:350,M:450,G:550},'bobinas'],
      ['Chapa de Alumínio Lisa','Chapa leve e resistente à corrosão, ideal para carrocerias','Liga 1100',{P:340,M:440,G:540},'chapas'],
      ['Vergalhão CA50','Barra de aço nervurada de alta resistência para construção civil e estruturas','Aço CA50',{P:380,M:480,G:580},'barras'],
      ['Tubo de Aço Inox','Tubo redondo polido para condução de fluidos e fins sanitários','Inox 304',{P:330,M:430,G:530},'tubos'],
      ['Cantoneira de Aço','Perfil estrutural em L para montagens industriais e serralheria','Aço ASTM A36',{P:300,M:400,G:500},'perfis'],
      ['Perfil U Dobrado','Perfil estrutural conformado a frio para coberturas e galpões','Aço Carbono',{P:380,M:480,G:580},'perfis'],
      ['Barra Chata de Alumínio','Barra maciça retangular para usinagem e acabamentos','Liga 6060',{P:370,M:470,G:570},'barras'],
      ['Fio de Cobre Nu','Condutor elétrico de alta pureza para redes aéreas e aterramentos','Cobre Eletrolítico',{P:400,M:500,G:600},'fios'],
      ['Malha Pop Soldada','Painel de tela soldada para reforço de lajes e pisos de concreto','Aço CA60',{P:360,M:460,G:560},'telas'],
      ['Telha Galvanizada Ondulada','Telha metálica com proteção de zinco para coberturas industriais','Aço Galvanizado',{P:410,M:510,G:610},'telhas'],
      ['Tubo Retangular Industrial','Tubo metálico com costura para esquadrias e estruturas leves','Aço SAE 1010',{P:420,M:520,G:620},'tubos'],
      ['Barra Redonda Trefilada','Barra de alta precisão dimensional para usinagem de eixos e pinos','Aço SAE 1045',{P:520,M:650,G:780},'barras'],
      ['Chapa Xadrez de Aço','Chapa com relevo antiderrapante para pisos e escadas industriais','Aço Carbono',{P:440,M:560,G:680},'chapas'],
      ['Bobina Galvalume','Bobina com revestimento liga zinco/alumínio para maior durabilidade','Aço Galvalume',{P:580,M:720,G:860},'bobinas'],
      ['Perfil W (I) Laminado','Perfil estrutural de abas paralelas para pontes e grandes vãos','Aço ASTM A572',{P:620,M:780,G:940},'perfis'],
      ['Chapa de Bronze Fosforoso','Chapa com excelente resistência ao desgaste para mancais e engrenagens','Bronze TM23',{P:680,M:850,G:1020},'chapas'],
      ['Tubo de Cobre Flexível','Tubo em rolo para sistemas de refrigeração e ar condicionado','Cobre Sem Costura',{P:650,M:820,G:980},'tubos'],
      ['Tarugo de Latão Sextavado','Material maciço e usinável para fabricação de conexões e válvulas','Latão CLA',{P:720,M:900,G:1080},'barras'],
      ['Arame Recozido Liso','Arame com alta flexibilidade para amarrações em armaduras de concreto','Aço Fio-Máquina',{P:420,M:520,G:620},'fios'],
      ['Fita de Aço Brilhante','Fita metálica resistente para embalagem e arqueação de cargas pesadas','Aço Temperado',{P:460,M:580,G:700},'fitas'],
    ];

    //Inserir todos os dados no banco
    for (const [nome, desc] of produtos) {
      run('INSERT INTO produtos (nome, descricao) VALUES (?, ?)',
        [nome, desc]);
    }
    console.log('✅ 20 produtos criadas');

    console.log('======================================');
    console.log('🔥 SEED EXECUTADO COM SUCESSO!');
    console.log('======================================');
    console.log('Login: admin@gmail.com | Senha: 123456');
    console.log('======================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ ERRO NO SEED:', err);
    process.exit(1);
  }
}

seed();