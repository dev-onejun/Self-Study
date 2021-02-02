/* default module */
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

/* npm install module*/
const express = require('express');
const app = express();
var sanitizeHtml = require('sanitize-html');
var bodyParser = require('body-parser');

/* personal module*/
var template = require('./lib/template.js');

// How to Use MiddleWare.
// * Create `.body` in `request` parameter. Run both POST and GET.
app.use(bodyParser.urlencoded({ extended: false }));
// * Create `.list` in `request` parameter. Only request in GET.
app.get('*', function (request, response, next){
    fs.readdir('./data', function(error, filelist){
        request.list = filelist;
        next();
    });
});

/* Add GET, POST link */
app.get('/', (request, response) => {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(reqquest.list);
    var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}`,
        `<a href="/create">create</a>`
    );
    response.send(html);
})

app.get('/page/:pageId', (request, response) => {
    /*
        ** if URL is /page/HTML ...
        request.params = {
            pageId: 'HTML'
        }
    */

    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = request.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
            allowedTags: ['h1']
        });
        var list = template.list(request.list);
        var html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            ` <a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                <form action="/delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
        );
        response.send(html);
    });
});

app.get('/create', (request, response)=>{
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
    response.send(html);
});

app.post('/create_process', (request, response)=>{
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
    })
});

app.get('/update/:pageId', (request, response)=>{
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update/${title}">update</a>`
        );
        response.send(html);
    });
});

app.post('/update_process', (request, response) => {
    var post = request.body;

    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            response.redirect(`/?id=${title}`);
        })
    });
});

app.post('/delete_process', (request, response) => {
    var post = request.body;

    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
        // response.writeHead(302, { Location: `/` });
        // response.end();
        response.redirect('/');
    })
});

/* Page not Found (404) */
app.get('*', (req, res)=>{
    res.send('Not found', 404);
});

/* Open ports 3000 */
app.listen(3000, () => {
    console.log(`Example app listening at http://localhost:3000!`)
})