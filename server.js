const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/room'); // 大寫表示 model
const errHandle = require('./errHandle');

dotenv.config({path:"./config.env"});

// 連結資料庫
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)

mongoose.connect(DB)
  .then(() => {
    console.log('資料庫連線成功');
  })
  .catch(err => console.log(err.reason));

const requestListener = async (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });
  
  if (req.url == '/' && req.method == 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      status: 'success'
    }));
    res.end();
  } else if (req.url == '/rooms' && req.method == 'GET') {
    const rooms = await Room.find();
    // .find() 為非同步語法，加上 await 讓它回傳資料再繼續往下跑程式碼

    res.writeHead(200, headers);
    res.write(JSON.stringify({
      status: 'success',
      rooms
    }));
    res.end();
  } else if (req.url == '/rooms' && req.method == 'POST') {
    req.on('end', async() => {
      try {
        const data = JSON.parse(body);
        const newRoom = await Room.create(
        // 新增資料 OK 的話，await 會將結果 response 到 newRoom
          {
            name: data.name,
            price: data.price,
            rating: data.rating
          }
        );

        res.writeHead(200, headers);
        res.write(JSON.stringify({
          status: 'success',
          room: newRoom
        }))
        res.end();
      } catch(err) {
        errHandle(res, err);
      }
    });
  } else if (req.url == '/rooms' && req.method == 'DELETE') {
    await Room.deleteMany({});
    // 刪除全部，可代入 {}

    res.writeHead(200, headers);
    res.write(JSON.stringify({
      status: 'success',
      rooms: []
    }));
    res.end();
  } else if (req.url.startsWith('/rooms/') && req.method == 'DELETE') {
    const id = req.url.split('/').pop();
    const rooms = await Room.find();
    const index = rooms.findIndex(element => element.id == id);

    if (index !== -1) {
      await Room.findByIdAndDelete(id);

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: 'success',
        rooms
      }));
      res.end();
    } else {
      errHandle(res);
    }
  } else if (req.url.startsWith('/rooms/') && req.method == 'PATCH') {
    req.on('end', async() => {
      try {
        const id = req.url.split('/').pop();
        let rooms = await Room.find();
        const index = rooms.findIndex(element => element.id == id);
        const data = JSON.parse(body);

        if(data.name !== undefined || data.price !== undefined || data.rating !== undefined && index !== -1) {
          await Room.findByIdAndUpdate(id, {
            name: data.name,
            price: data.price,
            rating: data.rating
          });

          rooms = await Room.find();
  
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            status: 'success',
            rooms
          }));
          res.end();
        } else {
          errHandle(res);
        }
      } catch(err) {
        errHandle(res, err);
      }
    });
  } else if (req.method == 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      status: 'false',
      message: '無此網站路由'
    }));
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(3000);
