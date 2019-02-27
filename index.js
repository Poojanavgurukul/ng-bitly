const express = require('express')
const app = express()
const port = 3000
const shortid = require('shortid')

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });
const dbConnection = mongoose.connection
dbConnection.on('open', () => {
    console.log('Connected to DB!')
})

const URL = mongoose.model("url", {
    hash: String,
    url: String,
    hits: { type: Number, default: 0 },
    maxHits: { type: Number}
});

const loggerMiddleware = (req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
}


app.use(loggerMiddleware)
app.use(express.json())

// app.get('/', (req, res) => {
//     return res.send('Hello World!')
// })

app.post('/shorten', (req, res) => {
    const hash = shortid.generate();
    URL.findOne({ url: req.body.url }).exec()
        .then(existingUrl => {
            if (existingUrl) {
                return existingUrl;
            } else {
                const hash = shortid.generate();
                return URL.create({ hash: hash, url: req.body.url });
            }
        })
        URL.findOne({ url: req.body.url,maxHits:req.body.maxHits }).exec()
        .then(existingUrl => {
            if (existingUrl) {
                return existingUrl;
            } else {
                const hash = shortid.generate();
                return URL.create({ hash: hash, url: req.body.url, maxHits: req.body.maxHits });
            }
        })
        .then(doc => {
            return res.status(201).send(doc)
        })
})
app.get('/hits', (req, res) => {
    console.log(req.query)
    URL.findOne({ hash: req.query.hash }).exec()
        .then(existingUrl => {
            if (existingUrl) {
                return res.status(200).send({ hits: existingUrl.hits })
            } else {
                return res.send(404)
            }
        })
})
app.get('/:hash', (req, res) => {
    URL.findOne({ hash: req.params.hash }).exec()
        .then(existingUrl => {
            if (existingUrl) {
                console.log("Redirecting...")
                return URL.update({ hash: req.params.hash }, { $set: { hits: existingUrl.hits + 1 } }).exec()
                    .then(() => {
                        console.log(existingUrl)
                        if (existingUrl.hits<=existingUrl.maxHits){
                            return res.redirect(existingUrl.url);
                        }else{
                            return res.status(404).send("Not Found");
                        }
                    })
            } else {
                return res.send(404)
            }
        })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
