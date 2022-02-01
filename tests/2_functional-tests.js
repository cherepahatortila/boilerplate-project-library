/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let firstInsertedID; // Used to store the first inserted ID and use it later in the tests.

suite('Functional Tests', function() {
   test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() { 
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({ title: 'Book name'})
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.body.title,'Book name','book should have a title');
        assert.property(res.body,'title', 'book should have a title property');
        assert.isDefined(res.body._id, 'book should have an id');
        firstInsertedID=res.body._id; 
        done();
    })   
      });  
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({ title: ''})
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field title', 'if no title sent - response should warn about missing title');
        assert.isString(res.text, 'response should be a string');
        done();
        })
      });
    });

    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'get request to /api/books should return array with all books ');
        assert.property(res.body[0], 'commentcount', 'each book in array should have property commentcount ');
        done();
         })
      });       
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/5f665eb46e296f6b9b6a504d')
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isString(res.text, 'if id is not in db- response should be a string');
        assert.equal(res.text, 'no book exists', 'if id is not in db- response should warn there is no book ');
        done();
         })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/'+firstInsertedID)
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'if id exists - response is an object');
        assert.equal(res.body._id, firstInsertedID, 'if id exists- response should show that book object');
        assert.property(res.body, 'comments', 'response should have property comments');
        assert.property(res.body, 'commentcount', 'response should have property commentcount');
        assert.property(res.body, 'title', 'response should have property title');
        assert.isArray(res.body.comments, 'comments should be an array');
        done();
         })
      }); 
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post('/api/books/'+firstInsertedID)//в html путь прописан с id
        .send({/*id:firstInsertedID,(и с, и без работает)*/ comment:'Hello'})
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'if id exists - response is an object');
        assert.equal(res.body._id, firstInsertedID, 'if id exists- response should show that book object');
        assert.property(res.body, 'comments', 'response should have property comments');
        assert.property(res.body, 'commentcount', 'response should have property commentcount');
        assert.property(res.body, 'title', 'response should have property title');
        assert.isArray(res.body.comments, 'comments should be an array');
        done();
         })
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
        .post('/api/books/'+firstInsertedID)//в html путь прописан с id
        .send({id:firstInsertedID, comment:''})
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isString(res.text, 'if no comment exists - response is a string');
        assert.equal(res.text, "missing required field comment", 'if no comment exists - response is "no comment exists - response is a string"');
        done();
         })
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
        .post('/api/books/56678998')//в html путь прописан с id
        .send({/*id:'56678998', (и с, и без работает)*/ comment:''})
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isString(res.text, 'if id is not valid or not exists in db - response is a string');
        assert.equal(res.text, "no book exists", 'if id is not valid - response is "no book exists"');
        done();
         })
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
        .delete('/api/books/'+ firstInsertedID)//в html путь прописан с id
        .send({id:firstInsertedID})
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isString(res.text, 'response is a string');
        assert.equal(res.text, "delete successful", 'if id is valid - response is "delete successful"');
        done();
         })
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
        .delete('/api/books/invalidID')//в html путь прописан с id
        .send({id:'invalidID'})
        .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isString(res.text, 'response is a string');
        assert.equal(res.text, "no book exists", 'if id is not valid - response is "no book exists"');
        done();
         })
      });

  });
  
});
});
