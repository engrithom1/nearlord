const pool = require('../config/dbconfig')
var data = require('../data')
var path = require('path')

var moment = require('moment');

var richFunctions = require('../richardFunctions')

var userInfo = data.userInfo
////////////////////////////////////////////english//////////////////////////
async function bookChapter(chapt, slug) {

  var chapters = []

  for (let index = 1; index <= chapt; index++) {

    chapters.push({ 'slug': slug, 'chapter': index })

  }

  return chapters;
}
////constroller functions
exports.biblePage = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    var query = "SELECT id, chapters, book, slug, verses FROM bbooks WHERE type = '0' ORDER BY id ASC;"
    query += "SELECT id, chapters, book, slug, verses FROM bbooks WHERE type = '1' ORDER BY id ASC;"
    query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 5;"


    connection.query(query, (err, results, fields) => {
      //latest post low views popular post high views
      if (!err) {

        var popular_posts = results[2];
        var bible_ot = results[0];
        var bible_nt = results[1];

        //console.log(results)
        ////seo datas
        const locals = {
          title: "Bible - New International Version",
          description: "Bible - New International Version",
        }

        res.render('bible/index', { userInfo: userInfo, locals, popular_posts, bible_nt, bible_ot });
      } else {
        console.log(err)
        res.redirect('/404');
      }

    })
  })
}

exports.bookPage = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var slug = req.params.slug

  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    var query = "SELECT id, chapters, book, slug, verses, description, body FROM bbooks WHERE slug = ?;"
    query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 5;"


    connection.query(query, [slug], async (err, results, fields) => {
      //latest post low views popular post high views
      if (!err) {

        if(results[0].length == 0){
          res.redirect('/404');
        }else{
        var popular_posts = results[1];
        var book = results[0][0];

        var chapters = await bookChapter(book.chapters, slug)

        console.log(results)
        ////seo datas
        const locals = {
          title: "Bible - " + book.book,
          description: book.description,
        }

        res.render('bible/book', { userInfo: userInfo, locals, popular_posts, book, chapters });
        }
      } else {
        console.log(err)
        res.redirect('/404');
      }

    })
  })
}

exports.bookVersesPage = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var slug = req.params.slug
  var chapter = parseInt(req.params.chapter)

  var next_chapter = 0
  var prev_chapter = 0

  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    var query = "SELECT id, chapters, book, slug, verses, description FROM bbooks WHERE slug = ?;"


    var qry = "SELECT verse, verse_no FROM bverses WHERE book_no = ? AND chapter_no = ? ORDER BY verse_no ASC;"
    qry += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 5;"

    connection.query(query, [slug], async (err, results, fields) => {
      //latest post low views popular post high views
      if (!err) {

        if (results.length == 0) {
          ////404
          res.redirect('/404');
        } else {

          //console.log(results)
          var book = results[0]

          var total_chapter = book.chapters;
          var book_name = book.book;
          var book_no = book.id;
          


          ////seo datas
          const locals = {
            title: "Bible - " + book_name + " : " + chapter,
            description: book.description,
          }

          connection.query(qry, [book_no, chapter], async (err, results, fields) => {
            //latest post low views popular post high views
            if (!err) {
              if(results[0].length == 0){
              ///404
              res.redirect('/404');
              }else{
                //console.log(results)
                var verses = results[0];
                var popular_posts = results[1]

                if(chapter == total_chapter){
                  prev_chapter = chapter - 1
                }else{
                  prev_chapter = chapter - 1
                  next_chapter = chapter + 1
                }

                res.render('bible/verses', { userInfo: userInfo, locals, book_name, popular_posts, verses, slug, chapter, prev_chapter, next_chapter });
              }
              
            } else {
              ///500
              console.log(err)
              res.redirect('/404');
            }
          })

          
        }
      } else {
        ///500
        console.log(err)
        res.redirect('/404');
      }

    })


  })
}

