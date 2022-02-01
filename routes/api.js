/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config();
const fieldId=require('mongodb').ObjectId;

const {MongoClient}=require('mongodb');
const url=process.env.DB;
const mongoClient=new MongoClient(url,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const myDb=mongoClient.db('library');

module.exports = function (app) {
async function run(){
  try{
    await mongoClient.connect();
    console.log("db connected");
 }catch(err){
    console.log(err);
 }
}
run();

  app.route('/api/books')
    .get(async function (req, res){
try{
//await  mongoClient.connect();- пришлось убрать и подключать базу вначале, а не в каждом route, иначе   некоторые тесты не выполнялись из-за превышения стандартного timeout 2000ms
const showAll= await myDb.collection('library').find().toArray();
res.send(showAll);
}catch(e){console.log(e)}
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      try{
      //await mongoClient.connect();
      if(!title) return res.send('missing required field title');
      await myDb.collection('library').insertOne({
        title:title, commentcount:0, comments:[]
        });
      
      const inserted_doc= await myDb.collection('library').find(
        {title:title}).toArray();
  
      res.send({_id:inserted_doc[0]._id,
      title:title});
      }catch(e){
        console.log(e);
    }})
    
    .delete(async function(req, res){
      try{
       await mongoClient.connect();
       await myDb.collection('library').deleteMany(); 

      res.send('complete delete successful');
      }catch(e){
        console.log(e);
        res.send(e)}
    });

  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      try{
       await mongoClient.connect();
       const id=await new fieldId(bookid);
       const findOne= await myDb.collection('library').find({_id: id}).toArray();

      if(!findOne[0]) return res.send('no book exists');
      res.send(findOne[0]);
      }catch(e){res.send('no book exists')}
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      try{
       await mongoClient.connect();
       const id= await new fieldId(bookid);
       if(!comment)return res.send('missing required field comment');
       const findOne= await myDb.collection('library').findOneAndUpdate({_id: id}, { $push: { comments: comment }, $inc:{commentcount:1}}, { returnDocument:'after' }); //update operator $push adds an item to an array.
      //returnDocument:'after' в mongo Node driver вместо returnNewDocument из mongosh
      if(!findOne.value) return res.send('no book exists');
      res.send(findOne.value);
      
      }catch(e){
        res.send('no book exists')}
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
     try{
       await mongoClient.connect();
       const id= await new fieldId(bookid);
      
       const findOne= await myDb.collection('library').findOneAndDelete({_id: id}); 

      if(!findOne.value) return res.send('no book exists');
      res.send('delete successful');
      }catch(e){
        res.send('no book exists')} 
      
    });
  
};
