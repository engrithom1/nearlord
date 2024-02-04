const pool = require('../config/dbconfig')
var data = require('../data')
var path = require('path')


var richFunctions = require('../richardFunctions')

var userInfo = data.userInfo

exports.blogPage = (req, res) => {

  if(req.session.user){
      userInfo.isLoged = req.session.user.isLoged
      userInfo.user = req.session.user.user
   }
  //connect to DB
  pool.getConnection((err, connection) =>{
      if(err) throw err;
      //console.log('Connection as ID '+connection.threadId)

      //query
      var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 2;"
      query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
      query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 6;"//off set 2 limit 6
      query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 2;"//off set 8 limit 13
      query += "SELECT cat.name, cat.slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"

      connection.query(query, (err, blogz) => {
          
          if(!err){
            const locals = {
              title:"New forum blog posts",
              description:"New forums blog posts description"
          }
          var top_posts = blogz[0]
          var new_posts = blogz[1]
          var posts = blogz[2]
          var post2 = blogz[3]
          var categories = blogz[4]

          //console.log(blogz[4]);
              
          res.render('blog/index',{userInfo:userInfo,top_posts,new_posts,posts,post2,categories,locals});
          }else{
              console.log(err);
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
    var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 6;"
    query += 'SELECT title, post_id, description, thumb, body, views, slug,created_at FROM blog WHERE post_id = ?;'
    query += "SELECT cat.name, cat.slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"

    connection.query(query, [post_id], (err, results, fields) => {
      
      var blog = results[1][0];
      var blogs = results[0];
      var categories = results[2];
      console.log(blog)
      ////seo datas
      const locals = {
        title:blog.title.substr(0,50),
        description:blog.description.substr(0, 130)
    }
      
      var views = blog.views
      views = parseInt(views) + 1

      connection.query("UPDATE blog SET views = ? WHERE post_id = ?",[views,post_id],(err,rows)=>{
          if(!err){
             res.render('blog/single',{userInfo:userInfo,locals,blog,blogs,categories});
          }
       })
  
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
    var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug  AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY fd.id DESC LIMIT 3;"
    query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' AND fd.category_id = ? ORDER BY views DESC LIMIT 8;"
    query += "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' AND fd.category_id = ? ORDER BY views DESC LIMIT 5;"//offset 8
    query += "SELECT cat.name, cat.slug, cat.color, count(p.category_id) AS posts FROM category AS cat INNER JOIN blog AS p ON p.category_id = cat.id;"
    query += 'SELECT name, description, thumb, body, slug FROM category WHERE id = ?;'

    connection.query(query, [cat_id,cat_id,cat_id], (err, results, fields) => {
      
      var post2 = results[2];
      var posts = results[1];
      var new_posts = results[0];
      var categories = results[3];
      var cat_info = results[4][0];

      ////seo datas
      const locals = {
        title:cat_info.name.substr(0,50),
        description:cat_info.description.substr(0, 130)
    }
    res.render('blog/category',{userInfo:userInfo,locals,cat_info,post2,posts,new_posts,categories});
  
    })
  })
}


exports.accountblog = (req, res)=>{
  if(req.session.user){
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
            res.render('account/blog',{userInfo:userInfo,blogs:rows,style:"account.css", title:"blogs Dashbord Page"})
          } else {
            console.log(err);
            console.log("errors------------------------------------blog");
          }
  
        });
      });
    
}

exports.getblogEdit = (req, res)=>{
    var id = req.body.id

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log('Connected!');
  
        connection.query('SELECT * FROM blogs WHERE id = '+id, (err, rows) => {
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

exports.createblog = (req, res)=>{
    var { title, description, status} = req.body;
    
    var user_id = req.session.user.user.id;

    console.log(req.file)
    
    var filename = req.file.filename
    
    
    pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      console.log('Connected!');

      connection.query('INSERT INTO blogs SET title = ?, status = ? , description = ?, thumbnail = ?, created_by = ?',[title, status, description, filename, user_id], (err, rows) => {
        // Once done, release connection
        //connection.release();

        if (!err) {
          var id = rows.insertId
          var slug = richFunctions.getSlug(title,id,60)

          connection.query("UPDATE blogs SET slug = ? WHERE id = ?",[slug, id], (err,rows)=>{
              if(!err){
                res.redirect('/account/blog');
              }else{
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


exports.updateblog = (req, res)=>{
    var { title, description, blog_id, status} = req.body;
    
    
    var user_id = req.session.user.user.id;

    var slug = richFunctions.getSlug(title,blog_id,60)

        pool.getConnection((err, connection) => {
            if (err) throw err; // not connected
            //console.log('Connected!');
            if(req.file){

            console.log(req.file)
            var filename = req.file.filename

            connection.query('UPDATE blogs SET title = ?, slug = ?, status = ? , description = ?, thumbnail = ?, created_by = ? WHERE id = ?',[title, slug, status, description, filename, user_id, blog_id], (err, rows) => {
              // Once done, release connection
              //connection.release();
      
              if (!err) {
                res.redirect('/account/blog');
              } else {
                console.log("errors---------------------------------------");  
                console.log(err);
              }
      
            });

            }else{
              connection.query('UPDATE blogs SET title = ?, slug = ?, status = ? , description = ?, created_by = ? WHERE id = ?',[title, slug, status, description, user_id, blog_id], (err, rows) => {
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


exports.deleteblog = (req, res)=>{

     var blog_id = req.body.id;


      pool.getConnection((err, connection) => {
          if (err) throw err; // not connected
          console.log('Connected!');
    
          connection.query('DELETE FROM blogs  WHERE id = ?',[blog_id], (err, rows) => {
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


