const io = require('socket.io')(3001,
    {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    }
);

io.on("connection", serverSocket => {
    serverSocket.on("change-in-text", delta => {
        console.log(delta);
        serverSocket.broadcast.emit("recieve-text-change", delta);
    })
});