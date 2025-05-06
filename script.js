import { getTaskList, getTask, createTask, updateTask, deleteTask } from "./todolist_api.js";

// Variável para controle do estado de edição
let currentEditingTaskId = null;
let todolist = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        todolist = await getTaskList();  
        displayTasks(todolist);
        setupForm();
        setupThemeToggle();
        initializeTheme();
        setupFilters();
        setupMarkAllButton();
        handleBulkCompleteToggle();
        document.getElementById('year').textContent = new Date().getFullYear();
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

        todolist = await getTaskList();
        displayTasks(todolist);
        resetForm();
    } catch (error) {
        console.error("Error saving task:", error);
        alert("Erro ao salvar tarefa. Tente novamente.");
    }
};

// Função para criar nova tarefa
const createNewTask = async (title, description, priority) => {
    const dateInput = document.getElementById("taskDate").value;
    
    // Objeto com propriedades consistentes (todos em camelCase)
    const taskData = {
        title,
        description,
        priority,
        completed: false,
        createdAt: dateInput ? new Date(dateInput).toISOString() : new Date().toISOString()
    };
    await createTask(taskData);
};

// Função para atualizar tarefa existente
const updateExistingTask = async (id, title, description, priority) => {
    const task = await getTask(id);
    await updateTask(id, {
        title,          
        description,    
        priority,       
        completed: task.completed,
        createdAt: task.createdAt
    });
    currentEditingTaskId = null;
};


// Função para marcar várias tarefas como concluídas
const handleCompleteToggle = async (event) => {
    const taskId = event.target.getAttribute('data-id');
    const isChecked = event.target.checked;

    try {
        const task = await getTask(taskId);
        await updateTask(taskId, {
            ...task,
            completed: isChecked
        });
        // Atualiza apenas a tarefa modificada na lista
        todolist = todolist.map(t => t.id === taskId ? {...task, completed: isChecked} : t);
        // Atualiza visualmente apenas o item modificado
        event.target.closest('.task-item').classList.toggle('completed', isChecked);
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        event.target.checked = !isChecked; // Reverte a mudança visual
        alert("Erro ao atualizar tarefa. Tente novamente.");
    }
};


// Função para marcar todas as tarefas como concluídas
const handleMarkAllToggle = async () => {
    const markAllBtn = document.getElementById("markAllBtn");
    const allCompleted = todolist.every(task => task.completed); 
    try {
        // Desativa o botão durante o processamento
        markAllBtn.disabled = true;
        markAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

        const tasksToUpdate = todolist.map(task => {
            const updatedTask = {
                ...task,
                completed: !allCompleted 
            };
            return updateTask(task.id, updatedTask); 
        });

        // Espera todas as promessas de atualização
        const updatedTasks = await Promise.all(tasksToUpdate);

        // Atualiza a lista local de tarefas
        todolist = updatedTasks;

        // Atualiza a interface com a lista de tarefas
        displayTasks(todolist);

        // Atualiza o texto do botão dependendo do estado das tarefas
        if (allCompleted) {
            markAllBtn.innerHTML = '<i class="fas fa-check-circle"></i> Marcar Todas';
        } else {
            markAllBtn.innerHTML = '<i class="fas fa-times-circle"></i> Desmarcar Todas';
        }

    } catch (error) {
        console.error("Erro ao alternar o status de todas as tarefas:", error);
        alert("Erro ao alternar o status das tarefas");
    } finally {
        // Restaura o botão para o estado inicial
        markAllBtn.disabled = false;
    }
};



// Função para exibir as tarefas
const displayTasks = (todolist) => {
    const taskListContainer = document.getElementById("task-list");
    taskListContainer.innerHTML = "";

    todolist.forEach(task => {
        const taskId = task.id;
        const title = task.title || task.Title;
        const description = task.description || task.Description;
        const priority = task.priority || task.Priority;
        const completed = task.completed || task.Completed;
        const date = task.createdAt || task.CreatedAt || task.Date;

        const listItem = document.createElement("li");
        listItem.className = `task-item ${completed ? 'completed' : ''} priority-${priority.toLowerCase()}`;

        listItem.innerHTML = `
            <div class="task-content">
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
            </div>
        `;

        taskListContainer.appendChild(listItem);
    });

    // Adiciona os eventos
    setupTaskEventListeners();
};

// Função separada para configurar os event listeners
const setupTaskEventListeners = () => {
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

// Função para marcar várias tarefas como concluídas
const handleBulkCompleteToggle = async () => {
    const checkboxes = document.querySelectorAll('.complete-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert("Por favor, selecione pelo menos uma tarefa.");
        return;
    }

    try {
        // Desativa o botão durante o processamento
        const bulkCompleteBtn = document.getElementById("bulkCompleteBtn");
        if (bulkCompleteBtn) bulkCompleteBtn.disabled = true;

        // Processa todas as tarefas selecionadas
        const updates = Array.from(checkboxes)
            .filter(checkbox => !checkbox.checked) // Filtra apenas as não concluídas
            .map(async checkbox => {
                const taskId = checkbox.getAttribute('data-id');
                const task = await getTask(taskId);
                return updateTask(taskId, { ...task, completed: true });
            });

        await Promise.all(updates);
        
        // Atualiza a lista completa
        todolist = await getTaskList();
        displayTasks(todolist);

    } catch (error) {
        console.error("Erro ao marcar tarefas como concluídas:", error);
        alert("Ocorreu um erro ao marcar as tarefas. Por favor, tente novamente.");
    } finally {
        // Reativa o botão independentemente do resultado
        const bulkCompleteBtn = document.getElementById("bulkCompleteBtn");
        if (bulkCompleteBtn) bulkCompleteBtn.disabled = false;
    }
};


// Função para configurar o botão de marcar todas as tarefas como concluídas
const setupMarkAllButton = () => {
    const markAllBtn = document.getElementById("markAllBtn");
    if (markAllBtn) {
        markAllBtn.addEventListener("click", handleMarkAllToggle);
    }
};

// Função para editar a tarefa
const handleEditClick = async (event) => {
    const taskId = event.target.getAttribute('data-id');
    try {
        const task = await getTask(taskId);
        currentEditingTaskId = task.id;
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description || "";
        document.getElementById("prioritySelect").value = task.priority;
    } catch (error) {
        console.error("Erro ao carregar tarefa para edição:", error);
        alert("Erro ao carregar tarefa para edição.");
    }
};

// Função para apagar tarefa
const handleDeleteClick = async (event) => {
    const taskId = event.target.getAttribute('data-id');
    
    try {
        if (confirm("Tem certeza de que deseja excluir esta tarefa?")) {
            await deleteTask(taskId);
            todolist = await getTaskList();
            displayTasks(todolist);
        }
    } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
        alert("Erro ao deletar tarefa. Tente novamente.");
    }
};

// Funções auxiliares
const resetForm = () => {
    document.getElementById("addTaskForm").reset();
    currentEditingTaskId = null;
};

const formatDate = (dateInput) => {
    try {
        let date;
        if (typeof dateInput === 'number') {
            date = new Date(dateInput * 1000);
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
    const priorityValue = priority.toLowerCase();
    const labels = {
        low: '🔵 Baixa',
        medium: '🟡 Média',
        high: '🔴 Alta'
    };
    return labels[priority] || priority;
};

// Inicia o tema no localStorage
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

// Função de filtros
const setupFilters = () => {
    const filters = document.querySelectorAll(".task-filters .nav-link");
    
    filters.forEach(filter => {
        filter.addEventListener("click", (event) => {
            const currentFilter = event.target.getAttribute('data-filter');
            const filteredTasks = filterTasksByStatus(todolist, currentFilter);
            displayTasks(filteredTasks);

            // Marcar o filtro ativo
            document.querySelectorAll(".task-filters .nav-link").forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        });
    });
};

// Função para filtrar tarefas por status
const filterTasksByStatus = (tasks, filter) => {
    if (filter === "all") {
        return tasks;
    }
    return tasks.filter(task => filter === "completed" ? task.completed : !task.completed);
};
