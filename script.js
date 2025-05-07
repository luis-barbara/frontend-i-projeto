import { getTaskList, getTask, createTask, updateTask, deleteTask } from "./todolist_api.js";

// Variáveis globais
let currentEditingTaskId = null;
let todolist = [];
let modalElements = {};

// Função para normalizar dados da tarefa
const normalizeTaskData = (task) => {
    // Converte a prioridade para o formato padrão
    let priority = 'média';
    if (task.Priority) {
        const priorityNum = parseInt(task.Priority.replace('Priority ', ''));
        priority = ['baixa', 'média', 'alta'][priorityNum - 1] || 'média';
    }
    
    // Determina a data de criação
    const createdAt = task.Date ? new Date(task.Date) : 
                     task.CreatedAt ? new Date(task.CreatedAt * 1000) : 
                     new Date();
    
    // Retorna apenas os campos necessários para a aplicação
    return {
        id: task.id,
        title: task.Title || '', 
        description: task.Description || null, 
        priority: priority,
        completed: task.Completed || false,
        createdAt: createdAt.toISOString()
    };
};

// Função para inicializar os elementos do modal
const initializeModalElements = () => {
    modalElements = {
        modal: document.getElementById('taskFormModal'),
        title: document.getElementById('modalTaskTitle'),
        description: document.getElementById('modalTaskDescription'),
        priority: document.getElementById('modalTaskPriority'),
        date: document.getElementById('modalTaskDate'),
        form: document.getElementById('taskForm'),
        closeBtn: document.getElementById('closeTaskModal'),
        cancelBtn: document.getElementById('cancelTaskBtn')
    };
    
    if (Object.values(modalElements).some(el => !el)) {
        console.error('Elementos do modal não encontrados:', modalElements);
        return false;
    }
    return true;
};

// Função para configurar os eventos do modal
const setupModal = () => {
    if (!initializeModalElements()) {
        console.error('Modal não pode ser inicializado - elementos em falta');
        return;
    }

    // Event listeners do modal
    modalElements.closeBtn.addEventListener('click', closeEditModal);
    modalElements.modal.addEventListener('click', (event) => {
        if (event.target === modalElements.modal) {
            closeEditModal();
        }
    });
    modalElements.cancelBtn.addEventListener('click', closeEditModal);
    
    // Configurar o formulário do modal
    modalElements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = modalElements.title.value.trim();
        const description = modalElements.description.value.trim();
        const priority = modalElements.priority.value;
        const date = modalElements.date.value;
        
        if (!title) {
            alert('O título é obrigatório!');
            return;
        }
        
        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            
            await updateExistingTask(currentEditingTaskId, title, description, priority, date);
            todolist = await getTaskList();
            displayTasks(todolist);
            closeEditModal();
            
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            alert('Erro ao atualizar tarefa. Tente novamente.');
        }
    });
};

// Configura o formulário principal
const setupForm = () => {
    const form = document.getElementById("addTaskForm");
    if (form) {
        form.reset();
        form.addEventListener("submit", handleFormSubmit);
    } else {
        console.error("Formulário principal não encontrado.");
    }
};

// Função para abrir o modal de edição
const openEditModal = (task) => {
    if (!modalElements.modal && !initializeModalElements()) {
        alert('Erro ao carregar o formulário de edição');
        return;
    }

    const normalizedTask = normalizeTaskData(task);
    
    modalElements.title.value = normalizedTask.title;
    modalElements.description.value = normalizedTask.description || '';
    modalElements.priority.value = normalizedTask.priority;
    
    if (normalizedTask.createdAt) {
        const date = new Date(normalizedTask.createdAt);
        modalElements.date.value = date.toISOString().split('T')[0];
    }
    
    currentEditingTaskId = normalizedTask.id;
    modalElements.modal.style.display = 'block';
};

// Função para fechar o modal
const closeEditModal = () => {
    if (modalElements.modal) {
        modalElements.modal.style.display = 'none';
    }
    currentEditingTaskId = null;
};


// Função para criar nova tarefa (MockAPI)
const createNewTask = async (title, description, priority) => {
    const dateInput = document.getElementById("taskDate").value;
    const now = new Date();
    
    const taskData = {
        Title: title.trim(),
        Priority: `Priority ${['baixa', 'média', 'alta'].indexOf(priority.toLowerCase()) + 1}`,
        Completed: false,
        Date: dateInput ? new Date(dateInput) : now,
        Description: null 
    };
    
    // Adiciona descrição apenas se fornecida
    if (description && description.trim() !== "") {
        taskData.Description = description.trim();
    }
    
    const response = await createTask(taskData);
    return normalizeTaskData(response);
};

// Função para atualizar tarefa existente
const updateExistingTask = async (id, title, description, priority, date) => {
    const task = await getTask(id);
    const updateDate = date ? new Date(date) : new Date(task.Date);
    
    // Mapeamento de prioridades
    const priorityMap = {
        'baixa': 1,
        'média': 2,
        'alta': 3
    };
    
    const updateData = {
        Title: title.trim(),
        Priority: `Priority ${priorityMap[priority.toLowerCase()] || 1}`,
        Completed: task.Completed || false,
        Date: updateDate
    };
    
    // Atualiza descrição apenas se fornecida
    if (description && description.trim() !== "") {
        updateData.Description = description.trim();
    } else if ('Description' in task) {
        updateData.Description = null;
    }
    
    await updateTask(id, updateData);
};

// Manipulador para o formulário de criação
const handleFormSubmit = async (event) => {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const priority = document.getElementById("prioritySelect").value;

    if (!title) {
        Swal.fire({
            title: 'Campo obrigatório',
            text: 'Por favor, insira um título para a tarefa',
            icon: 'warning'
        });
        return;
    }

    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A Gravar...';

        await createNewTask(title, description, priority);
        todolist = await getTaskList();
        displayTasks(todolist);
        
        // Feedback visual
        await Swal.fire({
            title: 'Sucesso!',
            text: 'Tarefa criada com sucesso',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
        resetForm();
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        Swal.fire({
            title: 'Erro',
            text: 'Não foi possível criar a tarefa',
            icon: 'error'
        });
    } finally {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Adicionar Tarefa';
        }
    }
};

// Função para marcar tarefa como concluída
const handleCompleteToggle = async (event) => {
    const taskId = event.target.getAttribute('data-id');
    const isChecked = event.target.checked;

    try {
        const task = await getTask(taskId);
        const normalizedTask = normalizeTaskData(task);
        
        await updateTask(taskId, {
            ...normalizedTask,
            completed: isChecked
        });
        
        todolist = todolist.map(t => 
            t.id === taskId ? {...normalizedTask, completed: isChecked} : t
        );
        
        event.target.closest('.task-item').classList.toggle('completed', isChecked);
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        event.target.checked = !isChecked;
        alert("Erro ao atualizar tarefa. Tente novamente.");
    }
};


// Função para marcar todas as tarefas como concluídas
const handleMarkAllToggle = async () => {
    const markAllBtn = document.getElementById("markAllBtn");
    
    try {
        // Verifica se todas já estão completas
        const allCompleted = todolist.every(task => task.Completed);
        
        // Mostrar estado de carregamento
        markAllBtn.disabled = true;
        markAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

        // Atualizar todas as tarefas
        const updatePromises = todolist.map(task => {
            return updateTask(task.id, {
                ...task,
                Completed: !allCompleted // Inverte o estado atual
            });
        });

        // Esperar todas as atualizações
        await Promise.all(updatePromises);
        
        // Atualizar a lista local
        todolist = todolist.map(task => ({
            ...task,
            Completed: !allCompleted
        }));

        // Atualizar a exibição
        displayTasks(todolist);

        // Atualizar o texto do botão
        markAllBtn.innerHTML = !allCompleted
            ? '<i class="fas fa-times-circle"></i> Desmarcar Todas'
            : '<i class="fas fa-check-circle"></i> Marcar Todas';

    } catch (error) {
        console.error("Erro ao alternar o status de todas as tarefas:", error);
        alert("Erro ao alternar o status das tarefas");
    } finally {
        markAllBtn.disabled = false;
    }
};


// Função para exibir as tarefas 
const displayTasks = (tasks) => {
    const taskListContainer = document.getElementById("task-list");
    taskListContainer.innerHTML = "";

    tasks.forEach(task => {
        const normalizedTask = normalizeTaskData(task);
        const { id, title, description, priority, completed, createdAt } = normalizedTask;

        const listItem = document.createElement("li");
        listItem.className = `task-item ${completed ? 'completed' : ''} priority-${priority.toLowerCase()}`;

        listItem.innerHTML = `
            <div class="task-content">
                <div class="task-header">
                    <input type="checkbox" ${completed ? 'checked' : ''} 
                           data-id="${id}" class="complete-checkbox">
                    <span class="task-title">${title}</span>
                </div>
                <div class="task-meta">
                    <span class="task-date">${formatDate(createdAt)}</span>
                    <span class="priority-badge">${getPriorityLabel(priority)}</span>
                </div>
                ${description ? `<div class="task-description">${description}</div>` : ''}
                <div class="task-footer">
                    <button data-id="${id}" class="edit-btn">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button data-id="${id}" class="delete-btn">
                        <i class="fas fa-trash-alt"></i> Remover
                    </button>
                </div>
            </div>
        `;

        taskListContainer.appendChild(listItem);
    });

    setupTaskEventListeners();
};


// Configurar listeners de eventos
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

// Função para edição de tarefa
const handleEditClick = async (event) => {
    const taskId = event.target.getAttribute('data-id');
    try {
        const task = await getTask(taskId);
        openEditModal(task);
    } catch (error) {
        console.error('Erro ao carregar tarefa para edição:', error);
        alert('Erro ao carregar tarefa para edição.');
    }
};



// Função para apagar tarefa com SweetAlert
const handleDeleteClick = async (event) => {
    const taskId = event.target.getAttribute('data-id');
    const deleteButton = event.target;
    
    // Salvar estado original do botão
    const originalContent = deleteButton.innerHTML;
    
    try {
        // Configuração do SweetAlert
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá reverter esta ação!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            allowOutsideClick: false
        });

        if (result.isConfirmed) {
            // Mostrar loading
            deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            deleteButton.disabled = true;

            await deleteTask(taskId);
            todolist = await getTaskList();
            displayTasks(todolist);

            // Feedback de sucesso
            await Swal.fire({
                title: 'Excluído!',
                text: 'A tarefa foi removida com sucesso.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
        Swal.fire({
            title: 'Erro!',
            text: 'Ocorreu um erro ao excluir a tarefa.',
            icon: 'error'
        });
    } finally {
        // Restaurar o botão
        deleteButton.innerHTML = originalContent;
        deleteButton.disabled = false;
    }
};

// Função para configurar o botão de marcar todas
const setupMarkAllButton = () => {
    const markAllBtn = document.getElementById("markAllBtn");
    if (markAllBtn) {
        markAllBtn.addEventListener("click", handleMarkAllToggle);
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
        baixa: '🔵 Baixa',
        média: '🟡 Média',
        alta: '🔴 Alta'
    };
    return labels[priorityValue] || priority;
};

// Função de filtros
const setupFilters = () => {
    const filters = document.querySelectorAll(".task-filters .nav-link");
    
    filters.forEach(filter => {
        filter.addEventListener("click", (event) => {
            const currentFilter = event.target.getAttribute('data-filter');
            const filteredTasks = filterTasksByStatus(todolist, currentFilter);
            displayTasks(filteredTasks);

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
    return tasks.filter(task => {
        const normalizedTask = normalizeTaskData(task);
        return filter === "completed" ? normalizedTask.completed : !normalizedTask.completed;
    });
};

// Tema
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon('sun');
    }
};

const setupThemeToggle = () => {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (!themeToggleBtn) return;

    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark ? 'sun' : 'moon');
    });
};

const updateThemeIcon = (icon) => {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = `<i class="fa-solid fa-${icon}"></i>`;
    }
};

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", async () => {
    try {
        setupModal();
        setupForm();
        
        todolist = await getTaskList();  
        displayTasks(todolist);
        setupThemeToggle();
        initializeTheme();
        setupFilters();
        setupMarkAllButton();
        
        document.getElementById('year').textContent = new Date().getFullYear();
    } catch (error) {
        console.error("Error initializing app:", error);
        alert("Erro ao carregar tarefas. Por favor, recarregue a página.");
    }
});