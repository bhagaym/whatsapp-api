const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 3000;
const server = http.createServer(app);
const client_url = "http://localhost";
const io = new Server(server, {
  cors: {
    origin: client_url,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
// const io = new Server(server);
const client = new Client({
  authStrategy: new LocalAuth()
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  return res.sendFile(__dirname + "/views/index.html");
})
app.get("/logout", async (req, res) => {
  const hasil = await client.destroy();
  res.json(hasil);
})
app.get("/group_list", async (req, res) => {
  const default_token = 'kj97U8b98Bv8vYHb8vsd8A-N8HVB8Vjisdyu78SB-BNAS89bsdhd';
  const token = req.query.token;

  if(default_token != token){
      return res.json({status: "failed", pesan: "Token Yang Anda gunakan tidak valid."});
  }

  let result = {};
  let hasil = [];
  try{
    const chats = await client.getChats();
    chats.forEach((chat) => {
        if (chat.isGroup) {
            const data = {name: chat.name, id: chat.id._serialized};
            hasil.push(data);
        }
    });
    result = {
      'status': 'success',
      'data': hasil
    }
  }
  catch(error){
    result = {
      'status': 'failed',
      'data': hasil
    }
  }
  res.json(result);
});

app.get("/send_to_group", async (req, res) => {
  const default_token = 'kj97U8b98Bv8vYHb8vsd8A-N8HVB8Vjisdyu78SB-BNAS89bsdhd';
  let groupId = req.query.groupid;
  const pesan = req.query.pesan;
  const token = req.query.token;

  if(default_token != token){
      res.json({status: 'failed', message: "Token Yang Anda gunakan tidak valid."});
  }

  try{
      const groupChat = await client.getChatById(groupId);
      groupChat.sendMessage(pesan)
      .then(() => {
          res.json({status: "success", message: 'Pesan berhasil dikirim.'})
      })
      .catch((error) => {
          res.json({status: "failed", message: "Pesan gagal dikirim."});
      });
  }
  catch(error){
      console.log(error);
      res.json({status: "failed", message: "Mungkin Anda belum terhubung dengan Whatsapp"});
  }
});

client.initialize();

io.on('connection', socket => {
  console.log('Socket connected');

    client.on('qr', (qr) => {
      let result = {
        'wa_connect': false,
        'qrcode': qr
      }
      socket.emit('qr', result);
    });

    client.on('ready', () => {
      console.log('client ready');
      let result = {
        'wa_connect': true
      }
      socket.emit('ready', result);
    });
});

server.listen(port, function () {
  console.log('App running on *: ' + port);
});