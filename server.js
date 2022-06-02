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
            photo : req.body.photo,
            heart : req.body.heart,
            heartUser : req.body.heartUser,
        }
        db.collection("post").insertOne(data,function(error,결과){
            console.log("저장완료");
            db.collection("count").updateOne({name:"게시물갯수"},{ $inc : {totalPost:1}})
        });
    });
});

//서버에 댓글 저장
app.post('/comment',(req,res) => {
    db.collection("commentCount").findOne({name :"댓글갯수"},function(에러,결과){
        let 총게시물갯수 = 결과.totalComment;
        let data = {
            _id : 총게시물갯수 + 1,
            id : req.body.id,
            uid : req.body.uid,
            time : req.body.time,
            name : req.body.name,
            photo : req.body.photo,
            comment : req.body.comment
        };
        db.collection('comment').insertOne(data,(에러,결과)=>{
            console.log("댓글 저장 완료")
            db.collection("commentCount").updateOne({name:"댓글갯수"},{ $inc : {totalComment:1}})
        });
    });
});

//서버에서 있는 댓글 데이터 요청
app.post("/commentData",(req,res)=>{
    db.collection('comment').find({id : req.body.id}).toArray((에러,결과)=>{
        res.json({comment : 결과});
    });
});

//서버에 있는 댓글 데이터 삭제 요청
app.delete("/commentDelete",function(req,res){
    let 삭제할데이터 = { _id: req.body._id,uid :  req.body.uid};
    db.collection("comment").deleteOne(삭제할데이터,function(에러,결과){
        console.log("삭제 완료");
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
    db.collection("post").deleteOne(삭제할데이터,function(에러,결과){
        console.log("삭제 완료");
    });
});

//서버에 있는 데이터 수정 요청
app.put("/edit",function(req,res){
    db.collection("post").updateOne({_id : req.body._id},{$set : {title: req.body.title,url:req.body.url}},function(에러,결과){});
});

//서버에 있는 하트 카운트 데이터 수정 요청
app.put("/heartEdit",function(req,res){
    db.collection("post").updateOne({_id : req.body._id},{$set : {heart: req.body.heart,heartUser : req.body.heartUser}},function(에러,결과){});
});

//검색기능 제목으로 검색
app.post("/search",function(req,res){
    let 검색조건 = [
        {
            $search: {
                index: 'titleSearch',
                text: {
                  query: req.body.search,
                  path: ['title']  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                }
            }
        }
    ]
    db.collection("post").aggregate(검색조건).toArray((에러,결과)=>{
        res.json({posts : 결과})
    })
});

//검색기능 사용자 아이디로 검색
app.post("/nameSearch",function(req,res){
    let 검색조건 = [
        {
            $search: {
                index: 'titleSearch',
                text: {
                  query: req.body.search,
                  path: ['name']  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                }
            }
        }
    ]
    db.collection("post").aggregate(검색조건).toArray((에러,결과)=>{
        res.json({posts : 결과})
    })
});

//메인 페이지
app.use(express.static(path.join(__dirname, 'music/build')));

app.get('/', function (요청, 응답) {
  응답.sendFile(path.join(__dirname, '/music/build/index.html'));
});

app.get('*', function (요청, 응답) {
    응답.sendFile(path.join(__dirname, '/music/build/index.html'));
});

