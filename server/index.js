const mongoose = require("mongoose")

const DataDocument = require("./DataDocument")

var Mutex = require('async-mutex').Mutex;

const mutex = new Mutex();

const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect('mongodb://localhost/editor_DB', options).then(() => {
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
    const doc = await DataDocument.findOne({ _id: id }).catch(err => {
        console.log('nourhan:Unable to find to the mongodb instance.', err);
    });
    // if we have the doucment return it to the user 
    if (doc) return doc;
    // if not return a created doc 
    return await new DataDocument({ _id: id, data: defaultValue });
}

io.on("connection", serversocket => {
    serversocket.on("get-inner-text", async QuillBoxId => {
        await mutex.runExclusive(async () => {
            const doc = await findorCrateDocmement(QuillBoxId);
            serversocket.join(QuillBoxId)
            serversocket.emit("load-inner-text", doc.data)

            serversocket.on("change-in-text", delta => {
                serversocket.broadcast.to(QuillBoxId).emit("recieve-text-change", delta)
            })

            serversocket.on("Save-Doc", async text => {
                await doc.updateOne({ _id: QuillBoxId }, { data: text }).catch(err => {
                    console.log("can't update document.", err);
                });
            })
        });
    })
})


