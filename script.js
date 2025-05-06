import { getTaskList, getTask, createTask, updateTask, deleteTask } from "./todolist_api.js";

// Variável para controle do estado de edição
let currentEditingTaskId = null;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const todolist = await getTaskList();
        displayTasks(todolist);
        setupForm();
        setupThemeToggle();  
        initializeTheme();    
    } catch (error) {
        console.error("Error initializing app:", error);
        alert("Erro ao carregar tarefas. Por favor, recarregue a página.");
    }
});

// Configura o formulário
const setupForm = () => {
    const form = document.getElementById("addTaskForm");
    if (form) {
        form.reset();
        form.addEventListener("submit", handleFormSubmit); 
    } else {
        console.error("Formulário com o ID 'addTaskForm' não encontrado.");
    }
};

// Manipulador único para o formulário
const handleFormSubmit = async (event) => {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const priority = document.getElementById("prioritySelect").value;

    if (!title) {
        alert("O título é obrigatório.");
        return;
    }

    try {
        if (currentEditingTaskId) {
            await updateExistingTask(currentEditingTaskId, title, description, priority);
        } else {
            await createNewTask(title, description, priority);
        }
        
        const tasks = await getTaskList();
        displayTasks(tasks);
        resetForm();
    } catch (error) {
        console.error("Error saving task:", error);
        alert("Erro ao salvar tarefa. Tente novamente.");
    }
};

// Função para criar nova tarefa
const createNewTask = async (title, description, priority) => {
    const dateInput = document.getElementById("taskDate").value;
    await createTask({
        title,
        description,
        priority,
        completed: false,
        createdAt: dateInput ? new Date(dateInput).toISOString() : new Date().toISOString()
    });
};

// Função para atualizar tarefa existente
const updateExistingTask = async (id, title, description, priority) => {
    const task = await getTask(id);
    await updateTask(id, {
        ...task,
        title,
        description,
        priority
    });
    currentEditingTaskId = null;
};

// Função para marcar tarefa como concluída ou não
const handleCompleteToggle = async (event) => {
    const taskId = event.target.getAttribute('data-id');
    const isChecked = event.target.checked;

    try {
        const task = await getTask(taskId);
        await updateTask(taskId, {
            ...task,
            completed: isChecked
        });
        const tasks = await getTaskList();
        displayTasks(tasks);
    } catch (error) {
        console.error("Erro ao atualizar o status da tarefa:", error);
        alert("Erro ao atualizar a tarefa. Tente novamente.");
    }
};

// Função para exibir tarefas na tela
const displayTasks = (todolist) => {
    const taskListContainer = document.getElementById("task-list");
    taskListContainer.innerHTML = "";  // Clear the list before adding new tasks

    todolist.forEach(task => {
        // Use the correct property names based on your API response
        const taskId = task.id;
        const title = task.title || task.Title; // Handle both cases
        const description = task.description || task.Description;
        const priority = task.priority || task.Priority;
        const completed = task.completed || task.Completed;
        const date = task.createdAt || task.CreatedAt || task.Date;

        const taskItem = document.createElement("div");
        taskItem.className = `task-item ${completed ? 'completed' : ''} priority-${priority.toLowerCase()}`;

        taskItem.innerHTML = `
            <div class="task-header">
                <input type="checkbox" ${completed ? 'checked' : ''} 
                       data-id="${taskId}" class="complete-checkbox">
                <span class="task-title">${title}</span>
            </div>
            <div class="task-meta">
                <span class="task-date">${formatDate(date)}</span>
                <span class="priority-badge">${getPriorityLabel(priority)}</span>
            </div>
            ${description ? `<div class="task-description">${description}</div>` : ''}
            <div class="task-footer">
                <button data-id="${taskId}" class="edit-btn">Editar</button>
                <button data-id="${taskId}" class="delete-btn">Remover</button>
            </div>
        `;

        taskListContainer.appendChild(taskItem);
    });

    // Add event listeners
    document.querySelectorAll('.complete-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleCompleteToggle);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditClick);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
    });
};

// Função para editar a tarefa
const handleEditClick = (event) => {
    const taskId = event.target.getAttribute('data-id');
    const task = getTask(taskId);
    
    currentEditingTaskId = task.id;
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("prioritySelect").value = task.priority;
};

// Função para deletar tarefa
const handleDeleteClick = async (event) => {
    const taskId = event.target.getAttribute('data-id');
    
    try {
        const task = await getTask(taskId);
        currentEditingTaskId = task.id;
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description || "";
        document.getElementById("prioritySelect").value = task.priority;
        // If you want to use the date field:
        if (task.createdAt) {
            document.getElementById("taskDate").value = task.createdAt.split('T')[0];
        }
    } catch (error) {
        console.error("Error loading task for editing:", error);
        alert("Erro ao carregar tarefa para edição.");
    }
};

// Funções auxiliares
const resetForm = () => {
    document.getElementById("addTaskForm").reset();
    currentEditingTaskId = null;
};

const formatDate = (dateInput) => {
    try {
        // Handle different date formats from your API
        let date;
        if (typeof dateInput === 'number') {
            date = new Date(dateInput * 1000); // Convert timestamp if needed
        } else if (typeof dateInput === 'string') {
            date = new Date(dateInput);
        } else {
            date = new Date();
        }
        
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Data inválida";
    }
};

const getPriorityLabel = (priority) => {
    // Handle different priority formats from your API
    const priorityValue = priority.toLowerCase();
    const labels = {
        low: '🔵 Baixa',
        medium: '🟡 Média',
        high: '🔴 Alta'
    };
    return labels[priority] || priority;
};

// Inicializa o tema baseado no localStorage
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon('sun');
    }
};

// Configura o toggle do tema
const setupThemeToggle = () => {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (!themeToggleBtn) return;

    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark ? 'sun' : 'moon');
    });
};

// Atualiza o ícone de tema
const updateThemeIcon = (icon) => {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = `<i class="fa-solid fa-${icon}"></i>`;
    }
};
