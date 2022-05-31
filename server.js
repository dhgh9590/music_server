const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
var cors = require('cors');
app.use(cors());
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 

let db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://dhgh9590:ghtjfl00@cluster0.emvbk.mongodb.net/?retryWrites=true&w=majority',function(에러,client){
    app.listen(8080,function(){
        db = client.db('music');
        console.log('listening on 8080')
    });
});

//서버에 데이터 저장
app.post("/add",(req,res)=>{
    db.collection("count").findOne({name : "게시물갯수"},function(에러,결과){
        let 총게시물갯수 = 결과.totalPost;
        let data = {
            _id : 총게시물갯수 + 1,
            title : req.body.title,
            url : req.body.url,
            uid : req.body.uid,
            time : req.body.time,
            name : req.body.name,
            photo : req.body.photo
        }
        db.collection("post").insertOne(data,function(error,결과){
            console.log("저장완료");
            db.collection("count").updateOne({name:"게시물갯수"},{ $inc : {totalPost:1}})
        });
    });
});

//서버에 있는 데이터 요청
app.get("/data",function(req,res){
    db.collection("post").find().toArray(function(에러,결과){
        res.json({posts:결과});
    });
});

//서버에 있는 데이터 삭제 요청
app.delete("/delete",function(req,res){
    let 삭제할데이터 = {_id: req.body._id, uid :  req.body.uid};
    console.log(req.body.uid);
    db.collection("post").deleteOne(삭제할데이터,function(에러,결과){
        console.log("삭제 완료");
    });
});

//서버에 있는 데이터 수정 요청
app.put("/edit",function(req,res){
    db.collection("post").updateOne({_id : req.body._id},{$set : {title: req.body.title,url:req.body.url}},function(에러,결과){});
});



