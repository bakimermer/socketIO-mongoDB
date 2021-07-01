const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const MongoClient = require('mongodb').MongoClient;

var db;

// Remember to change YOUR_USERNAME and YOUR_PASSWORD to your username and password!
MongoClient.connect('mongodb://localhost:27017', (err, database) => {
  if (err) return console.log(err)
  db = database.db('questionProject');
  app.listen(process.env.PORT || 27017, () => {
    console.log('Veritabanı: 27017 Dinleniyor')
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('insertData', (msg) => {
    let data = {question: msg, stylish: {a:"Şık 1",b:"Şık 2",c:"Şık 3",d:"Şık 4"}, answer: 'b' };

    db.collection('questions').insertOne(data, (err, result) => {
      if (err) throw err;
      io.emit('response', 'Veri Eklendi, id: ' + result.ops[0]._id);
    });
  });

  socket.on('getAllData', () => {
    db.collection('questions').find().toArray((err, result) => {
      if (err) return console.log(err)
      io.to(socket.id).emit('getData', result);
    })
  });
});

server.listen(3000, () => {
  console.log('Port Dinleniyor SocketIO: 3000');
});