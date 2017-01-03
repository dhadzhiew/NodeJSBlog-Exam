'use strict'

let express = require('express')
let app = express()
let exphb = require('express-handlebars')
let mainLayout = 'main'
let articles = require('./handlers/article-handler')
let port = 1234

app.engine('.hbs', exphb({ extname: 'hbs' }))
app.set('view engine', '.hbs');


app.get('(/|/index.html)',
    (req, res) => res.render('home', { title: 'Articles', layout: mainLayout, top: articles.getTop(6) }))
app.get('/create',
    (req, res) => res.render('create', { title: 'Create an article', layout: mainLayout }))
app.post('/create', articles.create)
app.get('/all',
    (req, res) => res.render('all', { title: 'List of articles', layout: mainLayout, articles: articles.getAllArticles() }))
app.get('/details/:id', (req, res) => {
    let article = articles.getArticle(req.params.id)
    if (!article) {
        res.status(404)
        res.render('notfound', { title: 'Page not found', layout: mainLayout })
    } else {
        article.views++
        let errors = []
        if (req.query.errors) {
            errors = decodeURIComponent(req.query.errors).split(':::')
        }
        res.render('article', { title: article.title, article: article, layout: mainLayout, errors: errors })
    }
})
app.get('/details/:id/delete', (req, res) => {
    let article = articles.getArticle(req.params.id)
    if (!article) {
        res.status(404)
        res.render('notfound', { title: 'Page not found', layout: mainLayout })
    } else {
        article.deleted = !article.deleted
        res.redirect('/details/' + req.params.id)
        return
    }
})
app.post('/details/:id/comment', articles.addComment)
app.get('/stats', (req, res) => {
    if(req.headers['my-authorization']) {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(articles.getStats()))
    } else {
        res.status(401)
        res.send('Not authorized')
    }
})
app.get('*', require('./handlers/file-handler'))

app.listen(port)
console.log('Listening on port ' + port)