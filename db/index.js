const mongoose = require('mongoose')

// mongoose.connect('mongodb://192.168.1.12:27017/lmsproject', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }).catch(e => {
//     console.error('Connection error', e.message)
// })
// mongoose.connect( encodeURI('mongodb+srv://mindproc:$%mindproc741@mindproccluster1.ivubn.mongodb.net/lmsproject?retryWrites=true&w=majority'),
//  { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }).catch(e => {
//     console.error('Connection error', e.message)
// })
// mongoose.connect( 'mongodb+srv://mindprocdb:mindprocdb123@cluster0.optss.mongodb.net/<dbname>?retryWrites=true&w=majority',
//  { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }).catch(e => {
//     console.error('Connection error', e.message)
// })
mongoose.connect('mongodb://localhost:27017/lmsprojectpro', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }).catch(e => {
    console.error('Connection error', e.message)
})

const db = mongoose.connection
mongoose.set('useFindAndModify', false);
db.on('error', console.error.bind(console, 'connection error:'));
module.exports = db