const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const fileUpload = require('express-fileupload');



const db = require('./db')
    // const movieRouter = require('./routes/movies.router')
    // const authRouter = require('./routes/auth.router')

 
const app = express()
const apiPort = process.env.PORT
app.use(fileUpload({
    createParentPath: true
}));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())
db.on('error', console.error.bind(console, 'MongoDB connection error:'))


app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Apis are Running!')
})
require('./routes')(app);

// app.use('/api', movieRouter)
// app.use('/api/auth', authRouter)
// app.use('/api/auth', authRouter)



app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))