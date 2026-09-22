// Translations
const translations = {
    en: {
        homeTitle: "Lists",
        listNamePlaceholder: "New list...",
        createBtn: "Create",
        newListBtn: "+ New List",
        cancelBtn: "Cancel",
        deleteBtn: "Delete",
        deleteConfirm: 'Are you sure you want to delete "{name}"?',
        pending: "pending",
        total: "total",
        backBtn: "Back",
        taskPlaceholder: "New items (Paste a list or type one)",
        addBtn: "Add",
        sectionPending: "Pending",
        sectionCompleted: "Completed",
        deleteTooltip: "Delete task"
    },
    'pt-BR': {
        homeTitle: "Listas",
        listNamePlaceholder: "Nova lista...",
        createBtn: "Criar",
        newListBtn: "+ Nova Lista",
        cancelBtn: "Cancelar",
        deleteBtn: "Excluir",
        deleteConfirm: 'Tem certeza que deseja excluir "{name}"?',
        pending: "pendente(s)",
        total: "total",
        backBtn: "Voltar",
        taskPlaceholder: "Novos ítens (Cole ou digite uma lista)",
        addBtn: "Adicionar",
        sectionPending: "Pendentes",
        sectionCompleted: "Concluídas",
        deleteTooltip: "Excluir tarefa"
    },
    es: {
        homeTitle: "Listas",
        listNamePlaceholder: "Nueva lista...",
        createBtn: "Crear",
        newListBtn: "+ Nueva Lista",
        cancelBtn: "Cancelar",
        deleteBtn: "Eliminar",
        deleteConfirm: '¿Estás seguro de que quieres eliminar "{name}"?',
        pending: "pendiente(s)",
        total: "total",
        backBtn: "Volver",
        taskPlaceholder: "Nuevos itens (Pegue o escriba una lista)",
        addBtn: "Agregar",
        sectionPending: "Pendientes",
        sectionCompleted: "Completadas",
        deleteTooltip: "Eliminar item"
    }
};

const userLocale = navigator.language;
let lang = localStorage.getItem('user_lang') || (translations[userLocale] ? userLocale : (translations[userLocale.split('-')[0]] ? userLocale.split('-')[0] : 'en'));
localStorage.setItem('user_lang', lang);

const t = (key, params = {}) => {
    let text = translations[lang][key] || translations['en'][key] || key;
    Object.keys(params).forEach(p => {
        text = text.replace(`{${p}}`, params[p]);
    });
    return text;
};

// Initialize UI strings
function initI18n() {
    document.getElementById('lang-select').value = lang;
    document.getElementById('home-title').textContent = t('homeTitle');
    document.getElementById('list-name-input').placeholder = t('listNamePlaceholder');
    document.getElementById('create-list-btn').textContent = t('createBtn');
    document.getElementById('new-list-btn').textContent = t('newListBtn');
    document.getElementById('cancel-new-list-btn').textContent = t('cancelBtn');
    document.getElementById('back-btn-text').textContent = t('backBtn');
    document.getElementById('todo-input').placeholder = t('taskPlaceholder');
    document.getElementById('add-btn').textContent = t('addBtn');
    document.getElementById('pending-title').textContent = t('sectionPending');
    document.getElementById('completed-title').textContent = t('sectionCompleted');
}

function changeLanguage(newLang) {
    lang = newLang;
    localStorage.setItem('user_lang', lang);
    initI18n();
    if (currentListId) {
        renderTasks();
    } else {
        renderHome();
    }
}

const langSelect = document.getElementById('lang-select');
langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));

// Elements
const homeView = document.getElementById('home-view');
const listDetailView = document.getElementById('list-detail-view');
const listsContainer = document.getElementById('lists-container');
const newListBtn = document.getElementById('new-list-btn');
const newListSection = document.getElementById('new-list-section');
const listNameInput = document.getElementById('list-name-input');
const createListBtn = document.getElementById('create-list-btn');
const cancelNewListBtn = document.getElementById('cancel-new-list-btn');

const currentListTitle = document.getElementById('current-list-title');
const backBtn = document.getElementById('back-btn');
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const completedList = document.getElementById('completed-list');

// State
let todoLists = JSON.parse(localStorage.getItem('todo_lists')) || [];

// Migrate old todos if they exist
const oldTodos = JSON.parse(localStorage.getItem('todos'));
if (oldTodos && oldTodos.length > 0 && todoLists.length === 0) {
    todoLists.push({
        id: Date.now().toString(),
        name: 'My Tasks',
        tasks: oldTodos
    });
    localStorage.removeItem('todos');
    saveTodoLists();
}

let currentListId = null;

// Persistent storage functions
function saveTodoLists() {
    localStorage.setItem('todo_lists', JSON.stringify(todoLists));
}

// View switching
function showHomeView() {
    homeView.style.display = 'block';
    listDetailView.style.display = 'none';
    currentListId = null;
    hideNewListInput();
    renderHome();
}

function showDetailView(listId) {
    homeView.style.display = 'none';
    listDetailView.style.display = 'block';
    currentListId = listId;
    const list = todoLists.find(l => l.id === listId);
    currentListTitle.textContent = list.name;
    renderTasks();
}

// Home View Rendering
function renderHome() {
    listsContainer.innerHTML = '';
    todoLists.forEach(list => {
        const li = document.createElement('li');
        li.className = 'list-item';
        
        const pendingCount = list.tasks.filter(t => !t.completed).length;
        const totalCount = list.tasks.length;
        
        li.innerHTML = `
            <div class="list-info">
                <span class="list-name">${list.name}</span>
                <span class="list-count">${pendingCount} ${t('pending')} / ${totalCount} ${t('total')}</span>
            </div>
            <div class="list-actions">
                <button class="btn-danger" data-action="delete">${t('deleteBtn')}</button>
            </div>
        `;

        li.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'delete') {
                e.stopPropagation();
                if (confirm(t('deleteConfirm', { name: list.name }))) {
                    deleteList(list.id);
                }
            } else {
                showDetailView(list.id);
            }
        });

        listsContainer.appendChild(li);
    });
}

// New list input toggling
function showNewListInput() {
    newListSection.hidden = false;
    newListBtn.hidden = true;
    listNameInput.focus();
}

function hideNewListInput() {
    newListSection.hidden = true;
    newListBtn.hidden = false;
    listNameInput.value = '';
}

// List management
function createList() {
    const name = listNameInput.value.trim();
    if (name) {
        const newList = {
            id: Date.now().toString(),
            name: name,
            tasks: []
        };
        todoLists.push(newList);
        saveTodoLists();
        hideNewListInput();
        renderHome();
    }
}

function deleteList(id) {
    todoLists = todoLists.filter(l => l.id !== id);
    saveTodoLists();
    renderHome();
}

// Task management
function renderTasks() {
    const list = todoLists.find(l => l.id === currentListId);
    if (!list) return;

    todoList.innerHTML = '';
    completedList.innerHTML = '';

    list.tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        li.innerHTML = `
            <span>${task.text}</span>
            <button class="delete-btn" title="${t('deleteTooltip')}">&times;</button>
        `;

        li.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                toggleTask(index);
            }
        });

        li.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(index);
        });

        if (task.completed) {
            completedList.appendChild(li);
        } else {
            todoList.appendChild(li);
        }
    });
}

function addTask() {
    const list = todoLists.find(l => l.id === currentListId);
    if (!list) return;

    const rawInput = todoInput.value;
    const lines = rawInput.split(/\r?\n/).filter(line => line.trim() !== "");
    
    if (lines.length > 0) {
        lines.forEach(text => {
            list.tasks.push({ text: text.trim(), completed: false });
        });
        todoInput.value = '';
        saveTodoLists();
        renderTasks();
    }
}

function toggleTask(index) {
    const list = todoLists.find(l => l.id === currentListId);
    list.tasks[index].completed = !list.tasks[index].completed;
    saveTodoLists();
    renderTasks();
}

function deleteTask(index) {
    const list = todoLists.find(l => l.id === currentListId);
    list.tasks.splice(index, 1);
    saveTodoLists();
    renderTasks();
}

// Event Listeners
newListBtn.addEventListener('click', showNewListInput);
cancelNewListBtn.addEventListener('click', hideNewListInput);
createListBtn.addEventListener('click', createList);
listNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createList();
    if (e.key === 'Escape') hideNewListInput();
});

backBtn.addEventListener('click', showHomeView);
addBtn.addEventListener('click', addTask);
// todoInput is a textarea, Enter shouldn't submit, unless we want Cmd/Ctrl+Enter
todoInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        addTask();
    }
});

// Initial render
initI18n();
showHomeView();
