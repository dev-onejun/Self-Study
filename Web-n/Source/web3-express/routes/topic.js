/* default module */
var path = require('path');
var fs = require('fs');
/* npm install module*/
var express = require('express');
var router = express.Router();
var sanitizeHtml = require('sanitize-html');
/* personal module*/
var template = require('../lib/template.js');

router.get('/create', (request, response)=>{
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

router.post('/create_process', (request, response)=>{
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.redirect(`/topic/${title}`);
    })
});

router.get('/update/:pageId', (request, response)=>{
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `
            <form action="/topic/update_process" method="post">
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
            `<a href="/create">create</a> <a href="/topic/update/${title}">update</a>`
        );
        response.send(html);
    });
});

router.post('/update_process', (request, response) => {
    var post = request.body;

    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            response.redirect(`/topic/${title}`);
        })
    });
});

router.post('/delete_process', (request, response) => {
    var post = request.body;

    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
        // response.writeHead(302, { Location: `/` });
        // response.end();
        response.redirect('/');
    })
});

router.get('/:pageId', (request, response, next) => {
    /*
        ** if URL is /page/HTML ...
        request.params = {
            pageId: 'HTML'
        }
    */

    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        if(err){
            next(err);
        }else{
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ['h1']
            });
            var list = template.list(request.list);
            var html = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                ` <a href="/topic/create">create</a>
                <a href="/topic/update/${sanitizedTitle}">update</a>
                <form action="/topic/delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.send(html);
        }
    });
});

module.exports = router;