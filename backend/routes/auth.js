const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middlewares/auth')

router.get('/', (req, res) => {
    User.find()
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' }))
})
router.post('/register', (req, res) => {
    const { username, email, password } = req.body
    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    })
    newUser.save()
    .then(() => res.status(201).json({ message: 'Utilisateur créé avec succès' }))
    .catch(err => res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' }))  
})
router.post('/login', (req, res) => {
    const { email, password } = req.body
    User.findOne({ email })
    .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
        }
        const token = jwt.sign({ userId: user._id, userName: user.username,userEmail: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.json({ token })
    })
})
module.exports = router