const mongoose = require("mongoose")

const DataDocument = require("./DataDocument")

var Mutex = require('async-mutex').Mutex;

const mutex = new Mutex();

const Redis = require("redis");

const client = Redis.createClient(); //pass url for deployment

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect('mongodb://localhost:27017,localhost:27020,localhost:27021?replicaSet=myReplicaSet', options).then(() => {
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
const io = require('socket.io')(3001,
    {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    }
);

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
                //set cache value
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


