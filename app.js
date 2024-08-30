require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const http = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const cors = require("cors");
const { rawListeners } = require("process");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express()
app.use(cors());
const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        // origin: process.env.CORS_URL,
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {

    const model = genAI.getGenerativeModel({model: "gemini-pro"});

    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 500,
        }
    })

    socket.on("send_message", async(input) => {

        const result = await chat.sendMessage(input);
        const response = await result.response;
        const text = await response.text()
        // console.log(text)

        // const result = await model.generateContent(input);
        // const response = await result.response;
        // const text = response.text()
        // console.log(text)
        socket.emit("receive_message", text);
    })
});
const PORT = process.env.PORT || 5000;

// console.log(PORT)

server.listen(PORT, () => console.log("Server is Running", PORT));
