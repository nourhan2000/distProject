const mongoose = require("mongoose")

const DataDocument = require("./DataDocument")

const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect('mongodb://localhost:3001/editor_DB', options).catch(() => {
    console.log('Unable to connect to the mongodb instance.');

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
    const doc = await DataDocument.findById(id).catch(() => {
        console.log('Unable to find to the mongodb instance.');
    });
    // if we have the doucment return it to the user 
    if (doc) return doc;
    // if not return a created doc 

    return await DataDocument.create({ _id: id, data: defaultValue });
}

io.on("connection", serversocket => {
    serversocket.on("get-inner-text", async QuillBoxId => {
        const doc = await findorCrateDocmement(QuillBoxId)
        serversocket.join(QuillBoxId)
        serversocket.emit("load-inner-text", doc.data)

        serversocket.on("change-in-text", delta => {
            serversocket.broadcast.to(QuillBoxId).emit("recieve-text-change", delta)
        })

        serversocket.on("Save-Doc", async data => {
            await doc.findByIdAndUpdate(QuillBoxId, { data })
        })
    })
})


