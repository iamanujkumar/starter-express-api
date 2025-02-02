const express = require('express');
const mongoose = require('mongoose');
const upload = require('../Routes/multer.js').upload;
const cloudinary = require('../Routes/cloudnary.js');
const PostModel = require('../Models/PostModel.js');
const UserModel = require('../Models/userModel.js');

let result;

const router = express.Router();

router.post("/", upload.single("file"), async function(req, res) {
  try {
    result = await cloudinary.uploader.upload(req.file.path);
    console.log(result);
    res.status(200).json({
      success: true,
      message: "Uploaded",
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error"
    });
  }
});

module.exports = router;

const creatPost = async (req, res) => {
    const { userId, desc, image } = req.body;
  
    try {
      const user = await UserModel.findById(userId);
      const username = user.username;
      const firstname = user.firstname;
      const lastname = user.lastname;
      const profilePicture = user.profilePicture;
      const imgUrl = result.secure_url;
  
      const newPost = new PostModel({ userId, username, desc, image, firstname, lastname, profilePicture, imgUrl });
      const savedPost = await newPost.save();
  
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(500).json(error);
    }
  };
  
module.exports.creatPost = creatPost;

//Get a Post

const getPost= async(req,res)=>{
    const id=req.params.id
    try {
        const post=await PostModel.findById(id)

        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.getPost = getPost;

// Update a Post
const updatePost = async(req,res)=>{
    const postId = req.params.id
    const {userId}=req.body

    try {
        const post = await PostModel.findById(postId)
        if(post.userId===userId){
            await post.updateOne({$set: req.body})
            res.status(200).json("Post Updated");
        }
        else {
            res.status(404).json("Action Forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }

}

module.exports.updatePost = updatePost;

// Delete a Post
const deletePost = async(req,res)=>{
    const id=req.params.id
    const {userId} = req.body

    try {
        const post= await PostModel.findById(id)
        if(post.userId===userId){
            await post.deleteOne();
            res.status(200).json("Post deleted successfully")
        }
        else{
            res.status(404).json("Action Forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.deletePost = deletePost;

// like/dislike a Post
const likePost = async(req,res)=>{
    const id = req.params.id
    const {userId} = req.body

    try {
        const post = await PostModel.findById(id)
        if(!post.likes.includes(userId)){
            await post.updateOne({$push : {likes : userId}})
            res.status(200).json("Post liked")
        }
        else{
            await post.updateOne({$pull : {likes : userId}})
            res.status(200).json("Post unliked")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.likePost = likePost;

// Get Timeline Post

const getTimelinePost = async(req,res)=>{
    const userId = req.params.id

    try {
        const currentUserPost = await PostModel.find({userId:userId})
        const followingPosts = await UserModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {  $lookup:{
                    from: "posts",
                    localField:"following",
                    foreignField:"userId",
                    as:"followingPosts"
                }
            },
            
            {
                $project:{
                    followingPosts: 1,
                    _id:0
                }
            }
        ])
        res.status(200).json(currentUserPost.concat(...followingPosts[0].followingPosts)
        .sort((a,b)=>{
            return new Date(b.createdAt)-new Date(a.createdAt);
        })
        )
        
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.getTimelinePost = getTimelinePost;
