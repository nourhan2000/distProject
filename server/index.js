const io = require('socket.io')(3001,
    {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    }
);


io.on("connection", serversocket => {
    serversocket.on("get-document",  QuillBoxId=> {
      const data=""
      serversocket.join(QuillBoxId)
      serversocket.emit("load-document",data)
  
      serversocket.on("change-in-text", delta => {
        serversocket.broadcast.to(QuillBoxId).emit("recieve-text-change", delta)
      })
    })
})