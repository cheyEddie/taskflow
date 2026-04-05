const API_URL = 'http://localhost:5000';
const usernameSpan = document.getElementById("username");
const logoutBtn = document.getElementById("logout-btn");
const tasksContainer = document.getElementById("tasks-container");
const modal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");
const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskModalTitle = document.getElementById("task-modal-title");
const taskModalKicker = document.getElementById("task-modal-kicker");
const taskModalIntro = document.getElementById("task-modal-intro");
const taskSubmitButton = document.getElementById("task-submit-button");
const openTaskModalButtons = document.querySelectorAll(".open-task-modal");
const closeTaskModalButton = document.getElementById("close-task-modal");
const cancelTaskModalButton = document.getElementById("cancel-task-modal");
let closeModalTimeout = null;

function setTaskFormMode(mode, task = null) {
    const isEditMode = mode === "edit";

    taskIdInput.value = task?._id || "";
    taskTitleInput.value = task?.title || "";
    taskDescriptionInput.value = task?.description || "";
    taskModalKicker.textContent = isEditMode ? "Mettre à jour" : "Nouvelle carte";
    taskModalTitle.textContent = isEditMode ? "Modifier la tâche" : "Créer une tâche";
    taskModalIntro.textContent = isEditMode
        ? "Ajuste le contenu de la tâche sans quitter ton tableau."
        : "Ajoute un titre clair et quelques détails pour mieux t'organiser.";
    taskSubmitButton.textContent = isEditMode ? "Enregistrer" : "Créer la tâche";
}

function openTaskModal(mode, task = null) {
    if (closeModalTimeout) {
        clearTimeout(closeModalTimeout);
        closeModalTimeout = null;
    }

    setTaskFormMode(mode, task);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => {
        modal.classList.add("is-visible");
    });
    taskTitleInput.focus();
}

function closeTaskModal() {
    modal.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    closeModalTimeout = setTimeout(() => {
        modal.hidden = true;
        taskForm.reset();
        taskIdInput.value = "";
        closeModalTimeout = null;
    }, 220);
}

function getStatusLabel(status) {
    if (status === "done") {
        return "Terminée";
    }

    if (status === "in-progress") {
        return "En cours";
    }

    return "À faire";
}

function applyTaskState(taskElement, task) {
    taskElement.dataset.status = task.status;

    const checkbox = taskElement.querySelector(".task-checkbox");
    const statusBadge = taskElement.querySelector(".task-status");

    checkbox.checked = task.status === "done";
    checkbox.setAttribute("aria-label", `Marquer la tâche ${task.title} comme ${checkbox.checked ? "non terminée" : "terminée"}`);
    statusBadge.textContent = getStatusLabel(task.status);
}

function buildTaskElement(task) {
    const taskElement = document.createElement("div");
    taskElement.className = "task";
    taskElement.dataset.taskId = task._id;
    taskElement.dataset.status = task.status;
    taskElement.dataset.taskTitle = task.title;
    taskElement.dataset.taskDescription = task.description || "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";

    const content = document.createElement("div");
    content.className = "task-content";

    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";

    const title = document.createElement("h3");
    title.textContent = task.title;

    const description = document.createElement("p");
    description.textContent = task.description || "Aucune description";

    const statusBadge = document.createElement("span");
    statusBadge.className = "task-status";

    taskMeta.append(title, statusBadge);
    content.append(taskMeta, description);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-task";
    editButton.setAttribute("aria-label", `Modifier la tâche ${task.title}`);
    editButton.innerHTML = '<i class="fas fa-pen"></i>';

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.setAttribute("aria-label", `Supprimer la tâche ${task.title}`);
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';

    actions.append(editButton, deleteButton);
    taskElement.append(checkbox, content, actions);
    applyTaskState(taskElement, task);
    return taskElement;
}

function syncTaskElement(taskElement, task) {
    taskElement.dataset.taskTitle = task.title;
    taskElement.dataset.taskDescription = task.description || "";
    taskElement.querySelector("h3").textContent = task.title;
    taskElement.querySelector("p").textContent = task.description || "Aucune description";
    taskElement.querySelector(".edit-task").setAttribute("aria-label", `Modifier la tâche ${task.title}`);
    taskElement.querySelector(".delete-task").setAttribute("aria-label", `Supprimer la tâche ${task.title}`);
    applyTaskState(taskElement, task);
}

async function createTask(task) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        throw new Error('Création impossible');
    }

    return response.json();
}

async function updateTask(taskId, updates) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        throw new Error('Mise à jour impossible');
    }

    return response.json();
}

async function updateTaskStatus(taskId, status) {
    return updateTask(taskId, { status });
}

async function deleteTask(taskId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Suppression impossible');
    }
}

function decodeToken(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

function renderTasks(tasks) {
    tasksContainer.replaceChildren();

    if (!Array.isArray(tasks) || tasks.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.textContent = "Tu n'as pas encore de tâche.";
        tasksContainer.appendChild(emptyState);
        return;
    }

    tasks.forEach(task => {
        tasksContainer.appendChild(buildTaskElement(task));
    });
}

async function fetchTasks() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 400 || response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error('Chargement impossible');
        }

        const tasks = await response.json();
        renderTasks(tasks);
    } catch (err) {
        console.error('Erreur lors de la récupération des tâches:', err);
    }
}

function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const user = decodeToken(token);

    if (!token || !user) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    if (user.userName) {
        usernameSpan.textContent = user.userName;
    }

    fetchTasks();

    openTaskModalButtons.forEach(button => {
        button.addEventListener("click", () => openTaskModal("create"));
    });

    closeTaskModalButton.addEventListener("click", closeTaskModal);
    cancelTaskModalButton.addEventListener("click", closeTaskModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeTaskModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            closeTaskModal();
        }
    });

    taskForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const taskId = taskIdInput.value;

        if (!title || !description) {
            return;
        }

        taskSubmitButton.disabled = true;

        try {
            if (taskId) {
                const updatedTask = await updateTask(taskId, { title, description });
                const taskElement = tasksContainer.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    syncTaskElement(taskElement, updatedTask);
                }
            } else {
                const createdTask = await createTask({ title, description });
                const emptyState = tasksContainer.querySelector(":scope > p");
                if (emptyState) {
                    emptyState.remove();
                }
                tasksContainer.prepend(buildTaskElement(createdTask));
            }

            closeTaskModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la tâche :', error);
        } finally {
            taskSubmitButton.disabled = false;
        }
    });

    tasksContainer.addEventListener("change", async (event) => {
        const checkbox = event.target.closest(".task-checkbox");
        if (!checkbox) {
            return;
        }

        const taskElement = checkbox.closest(".task");
        const { taskId } = taskElement.dataset;
        const previousStatus = taskElement.dataset.status || "todo";
        const nextStatus = checkbox.checked ? "done" : "todo";

        checkbox.disabled = true;

        try {
            const updatedTask = await updateTaskStatus(taskId, nextStatus);
            applyTaskState(taskElement, updatedTask);
        } catch (error) {
            checkbox.checked = previousStatus === "done";
            console.error('Erreur lors de la mise à jour de la tâche :', error);
        } finally {
            checkbox.disabled = false;
        }
    });

    tasksContainer.addEventListener("click", async (event) => {
        const editButton = event.target.closest(".edit-task");
        if (editButton) {
            const taskElement = editButton.closest(".task");
            openTaskModal("edit", {
                _id: taskElement.dataset.taskId,
                title: taskElement.dataset.taskTitle,
                description: taskElement.dataset.taskDescription
            });
            return;
        }

        const deleteButton = event.target.closest(".delete-task");
        if (!deleteButton) {
            return;
        }

        const taskElement = deleteButton.closest(".task");
        const { taskId } = taskElement.dataset;

        try {
            await deleteTask(taskId);
            taskElement.remove();
            if (!tasksContainer.children.length) {
                renderTasks([]);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la tâche :', error);
        }
    });
});


logoutBtn.addEventListener("click", handleLogout);
