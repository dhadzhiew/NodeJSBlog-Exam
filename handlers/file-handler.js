'use strict'
let content_types = {
    css: 'text/css',
    html: 'text/html',
    js: 'application/javascript'
}
module.exports = (req, res) => {
    let fs = require('fs')
    fs.readFile('./public' + req.path, (err, data) => {
        if (err) {
            res.status(404)
            res.render('notfound', { title: 'Page not found', layout: 'main' })
        } else {
            let headers = {}
            let ext = req.path.split('.').pop()
            if(Object.keys(content_types).indexOf(ext) !== -1) {
                headers['Content-Type'] = content_types[ext]
            }
            res.writeHead(200, headers)
            res.write(data)
            res.end()
        }
    })
}