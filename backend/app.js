const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const app = express()
const cors = require('cors')
const connectToDb = require('./db/db')
const userRoutes = require('./routes/user.routes')
const cookieParser = require('cookie-parser')

connectToDb()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.send('Hello')
})

app.use('/users',userRoutes)

module.exports = app;