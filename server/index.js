const mongoose = require("mongoose")

const DataDocument = require("./DataDocument")

const express = require('express');

const cors = require("cors");

const http = require('http');

const socketio = require('socket.io');

var Mutex = require('async-mutex').Mutex;

const mutex = new Mutex();

const Redis = require("redis");
//redis://default:3I3tEaZvv7xbFdKo2qkTmH5Q4zxHMZ8c@
const client = Redis.createClient({ url: "redis://redis-14025.c240.us-east-1-3.ec2.cloud.redislabs.com:14025" }); //pass url for deployment

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

const corsOptions = {
    origin: "https://distributedtexteditor.netlify.app/*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    preflightContinue: false,
    allowedHeaders: ["secretHeader"]
}

const app = express();

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))
const dotenv = require('dotenv')

dotenv.config()

mongoose.connect(process.env.MONGO_URL, options).then(() => {
    console.log("connected to db")
}).catch(err => {
    console.log('Unable to connect to the mongodb instance.', err);

});

client.connect().then(() => {
    console.log("redis connected");
}).catch(err => {
    console.log("redis didn't connect", err);
});
// setting we can apply different from doucmentation of mongoose
//mongoose.createConnection('mongodb://localhost/editor_DB').asPromise();
const httpServer = http.createServer();

const io = socketio(httpServer)
// , {
//     cors: {
//         origin: "https://distributedtexteditor.netlify.app/*",
//         methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
//         preflightContinue: false
//     }
// });


const defaultValue = ""

// Searching for a doucment or creating new one 
async function findorCrateDocmement(id) {
    if (id == null) return;
    var doc;
    await DataDocument.findById(id).then(res => {
        if (res != null)
            doc = res;
    }).catch(err => {
        console.log('Unable to find to the mongodb instance.', err);
    });
    console.log(doc);
    // if we have the doucment return it to the user 
    if (doc) return doc;
    console.log(typeof id);
    // if not return a created doc 
    const document = await new DataDocument({ data: defaultValue });
    document._id = id;
    document.save().then(() => {
        console.log("created");
    }).catch(err => {
        console.log("can't create document.", err);
    });
    return document;
}



io.on("connection", serversocket => {
    serversocket.on("get-inner-text", async QuillBoxId => {
        console.log(QuillBoxId);
        //get cache value first if null get it from the database 
        var data;
        await client.get(QuillBoxId).then(res => {
            data = JSON.parse(res);
            if (data) console.log("cache hit")
        });
        if (data == null) {
            console.log("cache miss")
            doc = await findorCrateDocmement(QuillBoxId);
            data = doc.data
        }
        console.log(data);
        serversocket.join(QuillBoxId);
        serversocket.emit("load-inner-text", data);
        serversocket.on("change-in-text", delta => {
            mutex.runExclusive(() => {
                serversocket.broadcast.to(QuillBoxId).emit("recieve-text-change", delta);
            });
        });
        serversocket.on("SaveDoc", text => {
            //console.log(text);
            DataDocument.findOneAndUpdate({ _id: QuillBoxId }, { $set: { data: text } }).then(() => {
                //console.log("saved");
            }).catch(err => {
                console.log("can't update document.", err);
            });
            client.setEx(QuillBoxId, 3600, JSON.stringify(text)).then(() => {
                console.log("cache updated");
            });
        })

    })
})

httpServer.listen(process.env.PORT);
