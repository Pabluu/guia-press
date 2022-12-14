const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const connection = require('./database/database');

const Article = require('./articles/Article');
const Category = require('./categories/Category');
const User = require('./user/User');


const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');
const userController = require('./user/UserController')

// View engine
app.set('view engine', 'ejs');

// Sessão
app.use(session({
    secret: 'asdm.nas,dn,amnd.m,asndqçjdçaskdj',
    cookie: { maxAge: 60000 }
}))

// Static
app.use(express.static('public'));

//Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

connection
    .authenticate()
    .then(() => {
        console.log('Conexão feita com sucesso')
    })
    .catch((error) => {
        console.log(error);
    })


app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', userController);


app.get('/session', (req, res) => {
    req.session.treinamento = 'Formação NodeJS'
    req.session.ano = 2022
    req.session.email = 'pablo@email'
    req.session.user = {
        username: 'pablo',
        email: 'pablo@email',
        id: 10
    }

    res.send('Sessão gerada!!');
});

app.get('/leitura', (req, res) => {
    res.json({
        treinamento: req.session.treinamento,
        ano: req.session.ano,
        email: req.session.email,
        user: req.session.user
    })
});


app.get('/', (req, res) => {
    let limit = 4;
    Article.findAll({
        order: [[
            'id', 'DESC']
        ],
        limit: limit
    })
        .then(articles => {
            Category.findAll().then(categories => {

                res.render('index', { articles: articles, categories: categories });
            })
        })
});

app.get('/:slug', (req, res) => {
    let slug = req.params.slug;
    Article.findOne({
        where: { slug: slug }
    })
        .then(article => {
            if (article != undefined) {
                Category.findAll().then(categories => {

                    res.render('article', { article: article, categories: categories });
                })
            } else {
                res.redirect('/');
            }
        })
        .catch(errp => {
            res.redirect('/')
        })
})



app.get('/category/:slug', (req, res) => {
    let slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{ model: Article }]
    }).then(category => {
        if (category != undefined) {
            Category.findAll()
                .then(categories => {
                    res.render('index', { articles: category.articles, categories: categories })
                })
        } else {
            res.redirect('/')
        }
    }).catch(erro => {
        res.redirect('/')
    })
})

app.listen(8080, () => {
    console.log('Servidor rodando\nhttp://localhost:8080');
})