const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Yo front çava ou quoi ?' });
})

module.exports = router;
