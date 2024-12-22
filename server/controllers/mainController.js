const pool = require('../config/dbconfig')
var data = require('../data')

const axios = require('axios')

var moment = require('moment');

var userInfo = data.userInfo

exports.en_404 = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }

    const locals = {
        title:"Page Not Found",
        description:"Page not found or server error"
    }

    res.render('general/404',{userInfo:userInfo,locals});
}  
   
//english home page
exports.home = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }
    const locals = {
        title:"Draw near to Lord",
        description:"Draw near to Lord",
        moment:moment
    }

    var query = "SELECT us.username, fd.title, fd.thumb, fd.views, fd.description, fd.slug, fd.created_at, cat.name, cat.slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 3;"
        
    //connect to DB
    pool.getConnection((err, connection) =>{
        if(err){
            console.log(err)
        }
        // select videos
        connection.query(query, (err, results, fields) => {
            if(!err){
                console.log(results)
               var posts = results
               
               res.render('general/index',{userInfo:userInfo,posts,moment,locals});
               
            }else{ console.log(err)}
        })

       
    })
}

exports.about = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }
    const locals = {
        title:"New forums for all of you",
        description:"New forums for all of you",
    }
    
    res.render('general/about',{userInfo:userInfo,locals});
} 

////////////////////////////////SPANISH/////////////////////////////////////////////

//home page
exports.spHome = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }
    const locals = {
        title:"New forums for all of you",
        description:"New forums for all of you",
        moment:moment
    }

    var query = "SELECT us.username, fd.sp_title, fd.sp_thumb, fd.views, fd.sp_description, fd.sp_slug, fd.created_at, cat.sp_name, cat.sp_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 3;"
        
    //connect to DB
    pool.getConnection((err, connection) =>{
        if(err){
            console.log(err)
        }
        // select videos
        connection.query(query, (err, results, fields) => {
            if(!err){
                console.log(results)
               var posts = results
               
               res.render('general/sp_index',{layout:'sp_main',userInfo:userInfo,posts,moment,locals});
               
            }else{ console.log(err)}
        })
    })
}

exports.spAbout = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }
    const locals = {
        title:"New forums for all of you",
        description:"New forums for all of you",
    }

    res.render('general/sp_about',{layout:'sp_main',userInfo:userInfo,locals});
}

exports.sp_404 = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }

    const locals = {
        title:"Page Not Found",
        description:"Page not found or server error"
    }

    res.render('general/sp_404',{layout:'sp_main',userInfo:userInfo,locals});
}


////////////////////////////////FRANCE/////////////////////////////////////////////

//home page
exports.frHome = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }
    const locals = {
        title:"New forums for all of you",
        description:"New forums for all of you",
        moment:moment
    }

    var query = "SELECT us.username, fd.fr_title, fd.fr_thumb, fd.views, fd.fr_description, fd.fr_slug, fd.created_at, cat.fr_name, cat.fr_slug AS cat_slug, cat.color FROM blog AS fd INNER JOIN category AS cat ON fd.category_id = cat.id INNER JOIN users AS us ON fd.created_by = us.id WHERE fd.status = '1' ORDER BY views DESC LIMIT 3;"
        
    //connect to DB
    pool.getConnection((err, connection) =>{
        if(err){
            console.log(err)
        }
        // select videos
        connection.query(query, (err, results, fields) => {
            if(!err){
                console.log(results)
               var posts = results
               
               res.render('general/fr_index',{layout:'fr_main',userInfo:userInfo,posts,moment,locals});
               
            }else{ console.log(err)}
        })
    })
}

exports.frAbout = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }
    const locals = {
        title:"New forums for all of you",
        description:"New forums for all of you",
    }

    res.render('general/fr_about',{layout:'fr_main',userInfo:userInfo,locals});
} 

exports.fr_404 = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }

    const locals = {
        title:"Page Not Found",
        description:"Page not found or server error"
    }

    res.render('general/fr_404',{layout:'fr_main',userInfo:userInfo,locals});
}
