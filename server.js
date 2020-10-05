//Importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js';
import Pusher from 'pusher'
import cors from 'cors'

//app config
const app = express()
const port = process.env.Port || 9000

const pusher = new Pusher({
    appId: '1071875',
    key: 'adea8c424b2f7de66eaa',
    secret: 'aa4f69c033f8b512fb9c',
    cluster: 'eu',
    encrypted: true
});

// middleware
app.use(express.json());
app.use(cors())

// app.use((req, res, next) => {
//     res.setHeader("Acces-Control-Allow-Origin", "*");
//     res.setHeader("Acces-Control-Allow-Headers", "*");
//     next();
//});


//DB config
const connection_url = 'mongodb+srv://n_admin:GH4Gsmb3C6PGbteQ@cluster0.ylwqe.mongodb.net/nchatdb?retryWrites=true&w=majority'

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection

db.once('open', () => {
    console.log("DB connected")

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log("A change occured", change)

        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted",
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received,
                });
        } else {
            console.log("Error triggering Pusher")
        }
    })
})


//api routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
})

//listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));