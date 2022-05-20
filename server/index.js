const mongoose = require("mongoose")

const DataDocument = require ("./DataDocument")

// setting we can apply different from doucmentation of mongoose
mongoose.createConnection('mongodb://localhost/editor_DB').asPromise();
const io = require('socket.io')( 3001,
    {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    }
);

const defaultValue = ""

io.on("connection", serversocket => {
    serversocket.on("get-inner-text", async QuillBoxId => {
        const doc =await findorCrateDocmement(QuillBoxId)
        serversocket.join(QuillBoxId)
        serversocket.emit("load-inner-text", doc.data)

        serversocket.on("change-in-text", delta => {
            serversocket.broadcast.to(QuillBoxId).emit("recieve-text-change", delta)
        })

        socket.on ("Save-Doc", async data => {
            await doc.findByIdAndUpdate(QuillBoxId,{data})
        })
    })
})


// Searching for a doucment or creating new one 
async function findorCrateDocmement (id){
    if (id== null) return 
  
    const doc = await DataDocument.findOne(id)
    // if we have the doucment return it to the user 
    if (doc) return doc 
    // if not return a created doc 
    return await DataDocument.create({_id: id, data:defaultValue})
  }
  