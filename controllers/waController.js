const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
 
const send_to_contact = async (req, res) => {
    const default_token = 'kj97U8b98Bv8vYHb8vsd8A-N8HVB8Vjisdyu78SB-BNAS89bsdhd';
    let nohp = req.query.nohp;
    const pesan = req.query.pesan;
    const token = req.query.token;

    if(default_token != token){
        return res.status(401).json({status: "Invalid Token", pesan: "Token Yang Anda gunakan tidak valid."});
    }
    
    try{
        if(nohp.startsWith(0)){
            nohp = "62" + nohp.slice(1);
        }
        nohp = nohp + "@c.us";    
        //cek apakah nomor hp terdaftar di whatsapp atau tidak...
        const user = await client.isRegisteredUser(nohp);
        if(user){
            //kirim pesan...
            client.sendMessage(nohp, pesan);
            res.json({status: "Berhasil terkirim", pesan})
        }
        else{
            res.json({status: "Gagal terkirim", pesan: "Nomor WA tidak terdaftar"});
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json({status: "Error", pesan: "Error server"});
    }
};

const send_to_group = async (req, res) => {
    const default_token = 'kj97U8b98Bv8vYHb8vsd8A-N8HVB8Vjisdyu78SB-BNAS89bsdhd';
    let groupId = req.query.groupid;
    const pesan = req.query.pesan;
    const token = req.query.token;

    if(default_token != token){
        return res.status(401).json({status: "Invalid Token", pesan: "Token Yang Anda gunakan tidak valid."});
    }

    try{
        const groupChat = await client.getChatById(groupId);
        groupChat.sendMessage(pesan)
        .then(() => {
            res.json({status: "Berhasil terkirim", pesan})
        })
        .catch((error) => {
            res.json({status: "Gagal terkirim", pesan: "Group WA tidak terdaftar"});
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({status: "Error", pesan: "Error server"});
    }
};

const group_list = async (req, res) => {
    const default_token = 'kj97U8b98Bv8vYHb8vsd8A-N8HVB8Vjisdyu78SB-BNAS89bsdhd';
    const token = req.query.token;

    if(default_token != token){
        return res.status(401).json({status: "Invalid Token", pesan: "Token Yang Anda gunakan tidak valid."});
    }

    let hasil = [];
    const chats = await client.getChats();
    chats.forEach((chat) => {
        if (chat.isGroup) {
            const data = {name: chat.name, id: chat.id._serialized};
            hasil.push(data);
        }
    });
    res.json(hasil);
};

module.exports = {
    send_to_contact, 
    send_to_group, 
    group_list
};