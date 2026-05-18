const mongoose = require("mongoose");
const Accident = require("./models/Accident");

const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});


app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

io.on("connection", (socket) => {

    console.log("New Client Connected");

    socket.on("disconnect", () => {
        console.log("Client Disconnected");
    });

});

app.get("/", (req, res) => {
    res.send("CrashSense Backend Running");
});


app.post("/accident", async (req, res) => {
    try {

        const newAccident = new Accident({
            location: req.body.location,
            severity: req.body.severity
        });

        await newAccident.save();

        io.emit("newAccident", newAccident);

        setTimeout(async () => {

    const accidentCheck = await Accident.findById(newAccident._id);

    if (accidentCheck.status === "Pending") {

        io.emit("emergencyEscalated", {
            message: "No ambulance responded. Forwarding emergency.",
            accident: accidentCheck
        });

        console.log("Emergency Escalated");

    }

}, 20000);

        res.status(201).json({
            message: "Accident Stored Successfully",
            data: newAccident
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

app.get("/accidents", async (req, res) => {

    try {

        const accidents = await Accident.find();

        res.status(200).json(accidents);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

app.put("/accept/:id", async (req, res) => {

    try {

        const updatedAccident = await Accident.findByIdAndUpdate(

            req.params.id,

            {
                status: "Ambulance Assigned",
                ambulanceAssigned: req.body.ambulanceName
            },

            { new: true }

        );

        io.emit("ambulanceAssigned", updatedAccident);

        res.status(200).json({
            message: "Ambulance Assigned Successfully",
            data: updatedAccident
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});