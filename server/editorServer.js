const options = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
};
const io = require('socket.io')(3001, options);

io.on("connection", socket => {

});