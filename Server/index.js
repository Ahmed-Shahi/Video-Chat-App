const { Server } = require('socket.io')
const http = require('http')

const server = http.createServer((req, res) => {
    // Catch standard curl health check requests
    if (req.url === "/health" && req.method === "GET") {
        // if(io.engine.clientsCount > 0){
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "UP", message: "Sockets are running" }));
        return;
    }

    res.writeHead(404);
    res.end();
});

const io = new Server(server, { cors: true }, console.log("Server is running on port 8000"))

io.o("connection", (socket) => {
    // exports {SocketProvider,useSocket}

    console.log("User", socket.id, Date());

    // socket.on("User:Name",({User,id})=>{
    //     io.to(id).emit("Name:Send",{User})
    //     console.log(User,socket.id);
    // })

    socket.on("Join:Room", ({ name, room }) => {

        io.to(room).emit("User:Joined", { name, id: socket.id })
        socket.join(room)
        io.to(socket.id).emit("Join:Room", { name, room })

    })

    socket.on('User:Call', ({ to, offer, name }) => {
        io.to(to).emit("Incoming:Call", { from: socket.id, offer, name })
    })
    socket.on("Accepted:Call", ({ to, ans, name }) => {
        io.to(to).emit("Accepted:Call", { from: socket.id, ans })
    })
    socket.on("Peer:Nego:Needed", ({ to, offer }) => {
        io.to(to).emit("Peer:Nego:Needed", { from: socket.id, offer })
    })
    socket.on("Peer:Nego:Done", ({ to, ans }) => {
        io.to(to).emit("Peer:Nego:Final", { from: socket.id, ans })
    })
    socket.on("Call:Ended", ({ to }) => {
        io.to(to).emit("Call:Ended:Noti", { mes: "CALL HAS BEEN ENDED!! " })
    })


})

server.listen(8000, () => {
    console.log("Server listening on port 8000");
});
// server.listen(8000,() => console.log('Server is running on port 8000'))