//importar o framework Express
const express = require('express');

//importar bibliotecas de sessao e cookies
const session = require('express-session');
const cookieParser = require('cookie-parser');

//inicializar o expresss
const app = express();

//config dos cookies
app.use(cookieParser());

//config das sessions
app.use(
    session({
        secret: 'minhaChave', //chave secreta para assinar os cookies
        resave: false, //evita regravar sessoes sem alteracoes
        saveUninitialized: true, //salva sessoes nao inicializadas
    })
);

const produtos = [
        { id: 1,
          nome: 'Arroz',
          preco: 28 },

        { id: 2,
          nome: 'Feijão',
          preco: 15 },
        
        { id: 3,
          nome: 'Bife',
          preco: 40 },
];

//rota inicial para exibir produtos
app.get('/produtos', (req, res) => {
    res.send(`
        <head>
            <link rel="stylesheet" type="text/css" href="/styles.css">
        </head>
        <body>
            <h1>Lista de Produtos</h1>
            <ul class="produto-lista">
                ${produtos.map(produto => `
                    <li class="produto-item">
                        ${produto.nome} - R$ ${produto.preco} 
                        <a href="/adicionar/${produto.id}" class="adicionar-link">Adicionar ao Carrinho</a>
                    </li>`
                ).join('')}
            </ul>
            <a href="/carrinho" class="carrinho-link">Ver Carrinho</a>
        </body>
    `);
});
app.use(express.static('public'));

//rota de adicionar
app.get('/adicionar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const produto = produtos.find((p) => p.id === id);

    if (produto) {
        if (!req.session.carrinho) {
            req.session.carrinho = [];
        }
        
        req.session.carrinho.push(produto);

        const agora = new Date();
        const horarioFormatado = agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        res.cookie('ultimoAdicionadoEm', horarioFormatado, { maxAge: 900000, httpOnly: true });
    }
    
    res.redirect('/produtos');
});


//rota do carrinho
app.get('/carrinho', (req, res) => {
    const carrinho = req.session.carrinho || [];
    const total = carrinho.reduce((acc, produto) => acc + produto.preco, 0);
    const horarioUltimoAdicionado = req.cookies.ultimoAdicionadoEm || 'Nenhum item foi adicionado recentemente.';

    res.send(`
        <head>
            <link rel="stylesheet" type="text/css" href="/styles.css">
        </head>
        <body>
            <h1>Carrinho de Compras</h1>
            <ul class="carrinho-lista">
                ${carrinho.map(produto => `
                    <li class="carrinho-item">${produto.nome} - R$ ${produto.preco}</li>`
                ).join('')}
            </ul>
            <p class="total">Total: R$ ${total}</p>
            <p class="ultimo-adicionado">Último item adicionado ao carrinho em: ${horarioUltimoAdicionado}</p>
            <a href="/produtos" class="continuar-comprando">Continuar Comprando</a>
        </body>
    `);
});


app.listen(3000, () => {
    console.log("App Online!!")
});
