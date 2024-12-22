const pool = require('../config/dbconfig')
var data = require('../data')
var path = require('path')

var moment = require('moment');

var richFunctions = require('../richardFunctions')

var userInfo = data.userInfo
////////////////////////////////////////////english//////////////////////////
exports.blogPage = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }
  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    //console.log('Connection as ID '+connection.threadId)

    //query
    var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    //query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 3;"//off set 2 limit 6
    query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 5;"//off set 3 limit 5
    query += "SELECT cat.name, cat.slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"

    connection.query(query, (err, blogz) => {

      if (!err) {
        const locals = {
          title: "New forum blog posts",
          description: "New forums blog posts description",
        }
        var latest_posts = blogz[0]
        //var new_posts = blogz[1]
        var top_posts = blogz[1]
        var popular_posts = blogz[2]
        var categories = blogz[3]

        //console.log(blogz[3]);

        res.render('blog/index', { userInfo: userInfo, latest_posts, top_posts, popular_posts, categories, locals });
      } else {
        console.log(err);
        res.redirect('/404');
      }

      //console.log('the data: \n',rows);
    })
  })

}

////constroller functions
exports.singleBlog = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var slug = req.params.slug

  var post_id = richFunctions.getIdFromSlug(slug)
  //console.log(post_id);

  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 3;"
    query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views ASC LIMIT 3;"
    query += 'SELECT title,post_photo, post_id, description, thumb, body, views, slug,created_at FROM blog WHERE post_id = ?;'
    query += "SELECT cat.name, cat.slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"

    connection.query(query, [post_id], (err, results, fields) => {
      if (!err) {
        if (results[2].length == 0) {
          res.redirect('/404');
        } else {
          //latest post low views popular post high views
          var blog = results[2][0];
          var popular_posts = results[0];
          var latest_posts = results[1];
          var categories = results[3];
          //console.log(blog)
          ////seo datas
          const locals = {
            title: blog.title,
            description: blog.description.substr(0, 130),
          }

          var views = blog.views
          views = parseInt(views) + 1

          connection.query("UPDATE blog SET views = ? WHERE post_id = ?", [views, post_id], (err, rows) => {
            if (!err) {
              res.render('blog/single', { userInfo: userInfo, locals, blog, popular_posts, latest_posts, categories });
            } else {
              console.log(err)
              res.redirect('/404');
            }
          })
        }

      } else {
        console.log(err)
        res.redirect('/404');
      }

    })
  })
}

exports.blogCategory = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var slug = req.params.slug

  var cat_id = richFunctions.getIdFromSlug(slug)
  //console.log('this is cat id'+cat_id);

  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    //var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' AND fd.category_id = ? ORDER BY views DESC LIMIT 8;"
    query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views ASC LIMIT 3;"//offset 8
    query += "SELECT cat.name, cat.slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"
    query += 'SELECT name, description,color, thumb, body, slug FROM category WHERE id = ?;'

    connection.query(query, [cat_id, cat_id, cat_id], (err, results, fields) => {
      if (!err) {
        if (results[3].length == 0) {
          res.redirect('/404');
        } else {
          var latest_posts = results[1];
          var popular_posts = results[0];
          //var new_posts = results[0];
          var categories = results[2];
          var cat_info = results[3][0];

          ////seo datas
          const locals = {
            title: cat_info.name.substr(0, 50),
            description: cat_info.description.substr(0, 130),
          }
          res.render('blog/category', { userInfo: userInfo, locals, cat_info, latest_posts, popular_posts, categories });

        }
      } else {
        console.log(err)
        res.redirect('/404');
      }
    })
  })
}
////////////////////////////////////////////ends english//////////////////////////
////////////////////////////////////////////spanish//////////////////////////
exports.spBlogPage = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }
  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    var query = "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.sp_views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    //query += "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.sp_views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    query += "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.sp_views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY sp_views DESC LIMIT 3;"//off set 2 limit 6
    query += "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.sp_views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY sp_views DESC LIMIT 5;"//off set 8 limit 13
    query += "SELECT cat.sp_name, cat.sp_slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"

    connection.query(query, (err, blogz) => {
      //console.log(blogz)
      if (!err) {
        const locals = {
          title: "New forum blog posts",
          description: "New forums blog posts description",
        }
        var latest_posts = blogz[0]
        //var new_posts = blogz[1]
        var top_posts = blogz[1]
        var popular_posts = blogz[2]
        var categories = blogz[3]

        //console.log(blogz[3]);

        res.render('blog/sp_index', { layout: 'sp_main', userInfo: userInfo, latest_posts, top_posts, popular_posts, categories, locals });
      } else {
        console.log(err);
        res.redirect('/sp/404');
      }

      //console.log('the data: \n',rows);
    })
  })

}

////constroller functions
exports.spSingleBlog = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var slug = req.params.slug

  var post_id = richFunctions.getIdFromSlug(slug)
  //console.log(post_id);

  //connect to DB
  pool.getConnection((err, connection) => {
    //if (err) throw err;
    if (!err) {
      //query
      var query = "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.sp_views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY sp_views DESC LIMIT 3;"
      query += "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.sp_views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY sp_views ASC LIMIT 3;"
      query += 'SELECT sp_title,post_photo, post_id, sp_description, sp_thumb, sp_body, sp_views,sp_slug,created_at FROM blog WHERE post_id = ?;'
      query += "SELECT cat.sp_name, cat.sp_slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"

      connection.query(query, [post_id], (err, results, fields) => {
        if (!err) {
          if (results[2].length == 0) {
            res.redirect('/sp/404');
          } else {
            var blog = results[2][0];
            var popular_posts = results[0];
            var latest_posts = results[1];
            var categories = results[3];
            //console.log(blog)
            ////seo datas
            const locals = {
              title: blog.sp_title,
              description: blog.sp_description.substr(0, 130),
            }

            var views = blog.sp_views
            views = parseInt(views) + 1

            connection.query("UPDATE blog SET sp_views = ? WHERE post_id = ?", [views, post_id], (err, rows) => {
              if (!err) {
                res.render('blog/sp_single', { layout: 'sp_main', userInfo: userInfo, locals, blog, popular_posts, latest_posts, categories });
              } else {
                console.log(err)
                res.redirect('/sp/404');
              }
            })
          }

        } else {
          console.log(err)
          res.redirect('/sp/404');
        }

      })
    } else {
      console.log(err)
      res.redirect('/sp/404');
    }
  })
}

exports.spBlogCategory = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var slug = req.params.slug

  var cat_id = richFunctions.getIdFromSlug(slug)
  //console.log('this is cat id'+cat_id);

  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    //var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    var query = "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.sp_views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' AND fd.category_id = ? ORDER BY sp_views DESC LIMIT 10;"
    query += "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.sp_views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' AND fd.category_id = ? ORDER BY sp_views ASC LIMIT 3;"//offset 8
    query += "SELECT cat.sp_name, cat.sp_slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"
    query += 'SELECT sp_name, sp_description, thumb, color, sp_body, sp_slug FROM category WHERE id = ?;'

    connection.query(query, [cat_id, cat_id, cat_id], (err, results, fields) => {
      if (!err) {
        if (results[3].length == 0) {
          res.redirect('/sp/404')
        } else {
          var latest_posts = results[1];
          var popular_posts = results[0];
          //var new_popular_posts = results[0];
          var categories = results[2];
          var cat_info = results[3][0];

          ////seo datas
          const locals = {
            title: cat_info.sp_name.substr(0, 50),
            description: cat_info.sp_description.substr(0, 130),
          }
          res.render('blog/sp_category', { layout: 'sp_main', userInfo: userInfo, locals, cat_info, latest_posts, popular_posts, categories });
        }
      } else {
        console.log(err)
        res.redirect('/sp/404')
      }
    })
  })
}
//////////////////////////////////////////end-spanish///////////////////////


////////////////////////////////////////////france//////////////////////////
exports.frBlogPage = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }
  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    var query = "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.fr_views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    //query += "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.fr_views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    query += "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.fr_views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fr_views DESC LIMIT 3;"//off set 2 limit 6
    query += "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.fr_views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fr_views DESC LIMIT 5;"//off set 8 limit 13
    query += "SELECT cat.fr_name, cat.fr_slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"

    connection.query(query, (err, blogz) => {
      console.log(blogz)
      if (!err) {
        const locals = {
          title: "New forum blog posts",
          description: "New forums blog posts description",
        }
        var latest_posts = blogz[0]
        //var new_posts = blogz[1]
        var top_posts = blogz[1]
        var popular_posts = blogz[2]
        var categories = blogz[3]

        //console.log(blogz);

        res.render('blog/fr_index', { layout: 'fr_main', userInfo: userInfo, latest_posts, top_posts, popular_posts, categories, locals });
      } else {
        console.log(err);
        res.redirect('/fr/404')
      }

      //console.log('the data: \n',rows);
    })
  })

}

exports.frSingleBlog = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var slug = req.params.slug

  var post_id = richFunctions.getIdFromSlug(slug)
  //console.log(post_id);

  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    var query = "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.fr_views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fr_views DESC LIMIT 3;"
    query += "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.fr_views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fr_views ASC LIMIT 3;"
    query += 'SELECT fr_title,post_photo, post_id, fr_description, fr_thumb, fr_body, fr_views,fr_slug,created_at FROM blog WHERE post_id = ?;'
    query += "SELECT cat.fr_name, cat.fr_slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"

    connection.query(query, [post_id], (err, results, fields) => {
      if (!err) {
        if (results[2].length == 0) {
          res.redirect('/fr/404')
        } else {
          var blog = results[2][0];
          var popular_posts = results[0];
          var latest_posts = results[1];
          var categories = results[3];
          console.log(blog)
          ////seo datas
          const locals = {
            title: blog.fr_title,
            description: blog.fr_description.substr(0, 130),
          }

          var views = blog.fr_views
          views = parseInt(views) + 1

          connection.query("UPDATE blog SET fr_views = ? WHERE post_id = ?", [views, post_id], (err, rows) => {
            if (!err) {
              res.render('blog/fr_single', { layout: 'fr_main', userInfo: userInfo, locals, blog, popular_posts, latest_posts, categories });
            } else {
              console.log(err)
              res.redirect('/fr/404')
            }
          })
        }

      } else {
        console.log(err)
        res.redirect('/fr/404')
      }

    })
  })
}

exports.frBlogCategory = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var slug = req.params.slug

  var cat_id = richFunctions.getIdFromSlug(slug)
  //console.log('this is cat id'+cat_id);

  //connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    //var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    var query = "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.fr_views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' AND fd.category_id = ? ORDER BY fr_views DESC LIMIT 10;"
    query += "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.fr_views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' AND fd.category_id = ? ORDER BY fr_views ASC LIMIT 3;"//offset 8
    query += "SELECT cat.fr_name, cat.fr_slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"
    query += 'SELECT fr_name, fr_description, thumb, color, fr_body, fr_slug FROM category WHERE id = ?;'

    connection.query(query, [cat_id, cat_id, cat_id], (err, results, fields) => {
      if(!err){
      if (results[3].length == 0) {
        res.redirect('/fr/404')
      } else {
      var latest_posts = results[1];
      var popular_posts = results[0];
      //var new_popular_posts = results[0];
      var categories = results[2];
      var cat_info = results[3][0];

      ////seo datas
      const locals = {
        title: cat_info.fr_name.substr(0, 50),
        description: cat_info.fr_description.substr(0, 130),
      }
      res.render('blog/fr_category', { layout: 'fr_main', userInfo: userInfo, locals, cat_info, latest_posts, popular_posts, categories });
    }
  }else{
    res.redirect('/fr/404')
  }
    })
  })
}
//////////////////////////////////////////end-france///////////////////////
///////////////////////////////////////////////////////////////////////////////
exports.accountblog = (req, res) => {
  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }
  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    //console.log('Connected!');

    connection.query('SELECT * FROM blogs ORDER BY id DESC', (err, rows) => {
      // Once done, release connection
      //connection.release();

      if (!err) {
        res.render('account/blog', { userInfo: userInfo, blogs: rows, style: "account.css", title: "blogs Dashbord Page" })
      } else {
        console.log(err);
        console.log("errors------------------------------------blog");
      }

    });
  });

}

exports.getblogEdit = (req, res) => {
  var id = req.body.id

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log('Connected!');

    connection.query('SELECT * FROM blogs WHERE id = ' + id, (err, rows) => {
      // Once done, release connection
      //connection.release();
      if (!err) {
        return res.json(rows);
      } else {
        console.log("get blog errors---------------------------------------");
        console.log(err);
      }

    });
  });

}

exports.createblog = (req, res) => {
  var { title, description, status } = req.body;

  var user_id = req.session.user.user.id;

  console.log(req.file)

  var filename = req.file.filename


  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log('Connected!');

    connection.query('INSERT INTO blogs SET title = ?, status = ? , description = ?, thumbnail = ?, created_by = ?', [title, status, description, filename, user_id], (err, rows) => {
      // Once done, release connection
      //connection.release();

      if (!err) {
        var id = rows.insertId
        var slug = richFunctions.getSlug(title, id, 60)

        connection.query("UPDATE blogs SET slug = ? WHERE id = ?", [slug, id], (err, rows) => {
          if (!err) {
            res.redirect('/account/blog');
          } else {
            console.log(err);
          }
        })
      } else {
        console.log("errors---------------------------------------");
        console.log(err);
      }

    });
  });

}


exports.updateblog = (req, res) => {
  var { title, description, blog_id, status } = req.body;


  var user_id = req.session.user.user.id;

  var slug = richFunctions.getSlug(title, blog_id, 60)

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    //console.log('Connected!');
    if (req.file) {

      console.log(req.file)
      var filename = req.file.filename

      connection.query('UPDATE blogs SET title = ?, slug = ?, status = ? , description = ?, thumbnail = ?, created_by = ? WHERE id = ?', [title, slug, status, description, filename, user_id, blog_id], (err, rows) => {
        // Once done, release connection
        //connection.release();

        if (!err) {
          res.redirect('/account/blog');
        } else {
          console.log("errors---------------------------------------");
          console.log(err);
        }

      });

    } else {
      connection.query('UPDATE blogs SET title = ?, slug = ?, status = ? , description = ?, created_by = ? WHERE id = ?', [title, slug, status, description, user_id, blog_id], (err, rows) => {
        // Once done, release connection
        //connection.release();

        if (!err) {
          res.redirect('/account/blog');
        } else {
          console.log("errors---------------------------------------");
          console.log(err);
        }

      });

    }


  });

}


exports.deleteblog = (req, res) => {

  var blog_id = req.body.id;


  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log('Connected!');

    connection.query('DELETE FROM blogs  WHERE id = ?', [blog_id], (err, rows) => {
      // Once done, release connection
      //connection.release();

      if (!err) {
        return res.send('success');

      } else {
        console.log("errors---------------------------------------");
        console.log(err);
        return res.send('error');
      }

    });
  });
  //return res.status(400).send('No files were uploaded.');
}


