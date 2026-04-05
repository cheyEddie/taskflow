const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', (req, res) => {
    Task.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .then(tasks => res.json(tasks))
    .catch(() => res.status(500).json({ error: 'Erreur lors de la récupération des tâches' }));
});

router.post('/', (req, res) => {
    const { title, description } = req.body;
    const newTask = new Task({
        title,
        description,
        userId: req.user.userId
    });
    newTask.save()
    .then(task => res.status(201).json(task))
    .catch(() => res.status(500).json({ error: 'Erreur lors de la création de la tâche' }));
});

router.put('/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, description, status, dueDate } = req.body;
    const updates = {};

    if (title !== undefined) {
        updates.title = title;
    }
    if (description !== undefined) {
        updates.description = description;
    }
    if (status !== undefined) {
        updates.status = status;
    }
    if (dueDate !== undefined) {
        updates.dueDate = dueDate;
    }

    Task.findOneAndUpdate(
        { _id: taskId, userId: req.user.userId },
        updates,
        { new: true, runValidators: true }
    )
    .then(task => {
        if (!task) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        res.json(task);
    })
    .catch(() => res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' }));
});

router.delete('/:id', (req, res) => {
    const taskId = req.params.id;
    Task.findOneAndDelete({ _id: taskId, userId: req.user.userId })
    .then(task => {
        if (!task) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        res.json({ message: 'Tâche supprimée avec succès' });
    })
    .catch(() => res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' }));
});
module.exports = router;
