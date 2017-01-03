'use strict'

let article = {}
let articles = []
let lastId = 0
let multiparty = require('multiparty')
let helper = require('./helper')
let imgTypes = ['png', 'jpg', 'jpeg']

article.create = (req, res) => {
    let errors = []
    let form = new multiparty.Form();
    let fields = {
        title: '',
        description: ''
    }
    let image = {
        buffer: new Buffer('')
    }

    form.on('part', (part) => {
        if (!part.filename) {
            part.on('data', data => fields[part.name] += data)
        } else {
            if (part.name == 'image') {
                let ext = part.filename.split('.').pop()
                if(imgTypes.indexOf(ext) === -1) {
                    errors.push('The image must be ' + imgTypes.join(', ') + ' format')
                }
                if (part.byteCount > 5242880) {
                    errors.push('The image must be max 5MB')
                } else {
                    image.name = part.filename
                    part.on('data', (data) => image.buffer = Buffer.concat([image.buffer, data]))
                }
            }
        }
        part.resume()
    });

    form.on('close', () => {
        if (fields.title.trim().length == 0) {
            errors.push('The title must be 1 characters at least')
        }
        if (fields.description.trim().length == 0) {
            errors.push('The description must be 1 characters at least')
        }

        if (errors.length == 0) {
            let filename = ''
            if (image.name) {
                let fs = require('fs')
                let uuid = require('node-uuid')
                let ext = image.name.split('.').pop()
                filename = uuid.v4() + '.' + ext;
                fs.writeFile('./public/images/' + filename, image.buffer);
            }
            let date = new Date()
            let item = {
                id: ++lastId,
                title: fields.title,
                description: fields.description,
                date: date,
                formattedDate: helper.formatDate(date),
                views: 0,
                deleted: false,
                comments: [],
                image: filename
            }
            articles.push(item)
        }
        let viewData = {
            title: 'Create an article',
            creating: true,
            errors: errors,
            layout: 'main'
        }

        res.render('create', viewData)
    })
    form.parse(req)
}

article.getAllArticles = (all) => {
    all = all || false
    if (all) {
        return articles
    } else {
        return articles.filter((article) => {
            return !article.deleted
        });
    }
}

article.getArticle = (id) => {
    let article = articles.filter((article) => {
        return article.id == id
    })
    if (article) {
        return article[0]
    }
    return false
}

article.getTop = (limit) => {
    let sorted = Array.prototype.slice.call(article.getAllArticles()).sort(function (a, b) {
        return b.views - a.views
    })

    return sorted.slice(0, limit)
}

article.addComment = (req, res) => {
    let form = new multiparty.Form()
    let currentArticle = article.getArticle(req.params.id)
    if (!currentArticle) {
        res.redirect('/all')
        return
    }
    let fields = {
        username: '',
        comment: ''
    }
    let errors = []
    form.on('part', (part) => {
        if (part.filename) {
            part.resume();
            return
        }
        part.on('data', (data) => fields[part.name] += data)

        part.resume();
    })

    form.on('close', () => {
        if (fields.username.trim().length == 0) {
            errors.push('The username must be 1 character at least')
        }
        if (fields.comment.trim().length == 0) {
            errors.push('The comment must be 1 character at least')
        }

        if (errors.length == 0) {
            let date = new Date()
            let comment = {
                date: date,
                formattedDate: helper.formatDate(date),
                username: fields.username,
                comment: fields.comment
            }
            currentArticle.comments.push(comment)
            res.redirect('/details/' + req.params.id)
            return
        } else {
            res.redirect('/details/' + req.params.id + "?errors=" + encodeURIComponent(errors.join(':::')))
            return
        }
    })
    form.parse(req)
}

article.getStats = () => {
    let stats = {
        comments: 0,
        views: 0,
        articles: article.getAllArticles(true)
    }
    articles.forEach((row) => {
        stats.views += row.views
        stats.comments += row.comments.length
    })

    return stats
}

module.exports = article