const mongoose = require("mongoose")

const DataDocument = require("./DataDocument")

var Mutex = require('async-mutex').Mutex;

const mutex = new Mutex();

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect('mongodb://localhost/editor_db', options).then(() => {
    console.log("connected to db")
}).catch(err => {
    console.log('Unable to connect to the mongodb instance.', err);

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
    await DataDocument.findOne({ $get: { id: String(id) } }).then(res => {
        doc = res;
        console.log("found");
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

        const doc = await findorCrateDocmement(QuillBoxId);
        console.log(doc);
        serversocket.join(QuillBoxId);
        serversocket.emit("load-inner-text", doc.data);

        serversocket.on("change-in-text", delta => {
            mutex.runExclusive(() => {
                serversocket.broadcast.to(QuillBoxId).emit("recieve-text-change", delta)
            });
        });
        serversocket.on("SaveDoc", text => {
            //console.log(text);
            DataDocument.findOneAndUpdate({ _id: QuillBoxId }, { $set: { data: text } }, { new: true }).then(() => {
                //console.log("saved");
            }).catch(err => {
                console.log("can't update document.", err);
            });
        })

    })
})


