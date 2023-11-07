const express = require('express');
const router=express.Router();
const Post= require('../models/Post');
const mainLayout = '../views/layouts/main';
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const authMiddleware = (req, res, next ) => {
    const token = req.cookies.token;
  
    if(!token) {
      return res.status(401).json( { message: 'Unauthorized'} );
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch(error) {
      res.status(401).json( { message: 'Unauthorized'} );
    }
  }
router.get('/',async(req,res)=>{
    try{
        const locals={
            title:"Nodejs Blog",
            description:"Blog"
        }
        let perPage=10;
        let page= req.query.page || 1;
        const data= await Post.aggregate([{$sort:{createdAt:-1}}])
        .skip(perPage*page-perPage)
        .limit(perPage)
        .exec();
        const count = await Post.count();
        const nextPage= parseInt(page) + 1;
        const hasNextPage= nextPage <= Math.ceil(count / perPage);
        res.render('index',{
            locals,
            data,
            current:page,
            nextPage: hasNextPage ? nextPage : null
        });
    }catch(error){
        console.log(error);
    }
});
//xem chi tiet bai
router.get('/post/:id',async(req,res)=>{
    try{
        let slug=req.params.id;
        const data=await Post.findById({_id:slug});
        const locals={
            title: data.title,
            description:"Blog"
        }
        res.render('post',{locals,data});
    }catch(error){
        console.log(error);
    }
});

//search
router.post('/search', async (req, res) => {
    try {
      const locals = {
        title: "Search",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
      let searchTerm = req.body.searchTerm;
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
  
      const data = await Post.find({
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
          { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]
      });
  
      res.render("search", {
        data,
        locals,
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
  router.get('/show', authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Show',
        description: 'Blog'
      }
  
      const data = await Post.find();
      res.render('admin/show', {
        locals,
        data,
        layout: mainLayout
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });

  //tao post moi
  router.get('/add-post', authMiddleware, async (req, res) => {
    try {
      const locals={
        title:'add post',
        description:'blog'
      }
      const data = await Post.find();
      res.render('admin/add-post',{
        locals,
        layout: mainLayout
      });
    } catch (error) {
      console.log(error);
    }
  });
  router.post('/add-post', authMiddleware, async (req, res) => {
    try {
      try {
        const newPost = new Post({
          title: req.body.title,
          body: req.body.body
        });
  
        await Post.create(newPost);
        res.redirect('/');
      } catch (error) {
        console.log(error);
      }
  
    } catch (error) {
      console.log(error);
    }
  });
//Edit post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: mainLayout
    })

  } catch (error) {
    console.log(error);
  }

});
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/show`);

  } catch (error) {
    console.log(error);
  }

});

//delete post
router.delete('/delete-post/:id', authMiddleware, async(req,res)=>{
  try{
    await Post.deleteOne({_id:req.params.id});
    res.redirect('/show');
  }catch(error){
    console.log(error);
  }
});

// function insertPostData () {
//   Post.insertMany([
//     {
//       title: "Tiêu đề 1",
//       body: "Nội dung 1"
//     },
//     {
//       title: "Tiêu đề 2",
//       body: "Nội dung 2"
//     },{
//       title: "Tiêu đề 3",
//       body: "Nội dung 3"
//     },{
//       title: "Tiêu đề 4",
//       body: "Nội dung 4"
//     },{
//       title: "Tiêu đề 5",
//       body: "Nội dung 5"
//     },
//   ])
// }

// insertPostData();
module.exports = router;
