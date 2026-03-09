require('dotenv').config()
const express = require('express')
const mongoose = require ('mongoose')
const cors = require('cors')
const app = express()
const taskRoutes = require ('./routes/tasks')
const authRoutes = require ('./routes/auth')

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('Connexion à mongo db réussie'))
.catch(err=> console.log(err))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', taskRoutes)
app.use('/auth', authRoutes)


const PORT = process.env.PORT || 3000 

app.listen(PORT, () => console.log(`Bienvenue Eddie je t'attends sur le port ${PORT}`))