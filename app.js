// Translations
const translations = {
    en: {
        homeTitle: "Lists",
        listNamePlaceholder: "New list...",
        createBtn: "Create",
        newListBtn: "+ New List",
        cancelBtn: "Cancel",
        deleteListTooltip: "Delete list",
        deleteConfirm: 'Are you sure you want to delete "{name}"?',
        pending: "pending",
        total: "total",
        backBtn: "Back",
        taskPlaceholder: "New items (Paste a list or type one)",
        addBtn: "Add",
        sectionPending: "Pending",
        sectionCompleted: "Completed",
        deleteTooltip: "Delete task",
        editTooltip: "Edit item",
        insertTooltip: "Insert item below",
        editItemLabel: "Item text",
        newItemLabel: "New item",
        saveItem: "Save item",
        cancelItem: "Cancel",
        itemMoved: "{name}: position {position} of {total}.",
        moveCancelled: "Move cancelled.",
        toggleDone: "Toggle done",
        copyListBtn: "Copy pending items",
        copiedBtn: "Copied!",
        installBtn: "Install app"
    },
    'pt-BR': {
        homeTitle: "Listas",
        listNamePlaceholder: "Nova lista...",
        createBtn: "Criar",
        newListBtn: "+ Nova Lista",
        cancelBtn: "Cancelar",
        deleteListTooltip: "Excluir lista",
        deleteConfirm: 'Tem certeza que deseja excluir "{name}"?',
        pending: "pendente(s)",
        total: "total",
        backBtn: "Voltar",
        taskPlaceholder: "Novos ítens (Cole ou digite uma lista)",
        addBtn: "Adicionar",
        sectionPending: "Pendentes",
        sectionCompleted: "Concluídas",
        deleteTooltip: "Excluir tarefa",
        editTooltip: "Editar item",
        insertTooltip: "Inserir item abaixo",
        editItemLabel: "Texto do item",
        newItemLabel: "Novo item",
        saveItem: "Salvar item",
        cancelItem: "Cancelar",
        itemMoved: "{name}: posição {position} de {total}.",
        moveCancelled: "Movimento cancelado.",
        toggleDone: "Alternar concluído",
        copyListBtn: "Copiar itens pendentes",
        copiedBtn: "Copiado!",
        installBtn: "Instalar app"
    },
    es: {
        homeTitle: "Listas",
        listNamePlaceholder: "Nueva lista...",
        createBtn: "Crear",
        newListBtn: "+ Nueva Lista",
        cancelBtn: "Cancelar",
        deleteListTooltip: "Eliminar lista",
        deleteConfirm: '¿Estás seguro de que quieres eliminar "{name}"?',
        pending: "pendiente(s)",
        total: "total",
        backBtn: "Volver",
        taskPlaceholder: "Nuevos itens (Pegue o escriba una lista)",
        addBtn: "Agregar",
        sectionPending: "Pendientes",
        sectionCompleted: "Completadas",
        deleteTooltip: "Eliminar item",
        editTooltip: "Editar ítem",
        insertTooltip: "Insertar ítem debajo",
        editItemLabel: "Texto del ítem",
        newItemLabel: "Nuevo ítem",
        saveItem: "Guardar ítem",
        cancelItem: "Cancelar",
        itemMoved: "{name}: posición {position} de {total}.",
        moveCancelled: "Movimiento cancelado.",
        toggleDone: "Alternar completado",
        copyListBtn: "Copiar ítems pendientes",
        copiedBtn: "¡Copiado!",
        installBtn: "Instalar app"
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
    document.getElementById('copy-list-btn').textContent = t('copyListBtn');
    document.getElementById('install-btn').textContent = t('installBtn');
    document.getElementById('task-move-status').textContent = '';
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
const copyListBtn = document.getElementById('copy-list-btn');

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
let selectedTask = null;
let taskEditor = null;
let taskDrag = null;
let suppressTaskClick = false;
const tasksByRow = new WeakMap();

// Persistent storage functions
function saveTodoLists() {
    localStorage.setItem('todo_lists', JSON.stringify(todoLists));
}

// View switching
function showHomeView() {
    clearTaskDrag();
    finishTaskEditor();
    selectedTask = null;
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
    selectedTask = null;
    taskEditor = null;
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
                <span class="list-name"></span>
                <span class="list-count">${pendingCount} ${t('pending')} / ${totalCount} ${t('total')}</span>
            </div>
            <div class="list-actions">
                <button class="delete-btn" data-action="delete" title="${t('deleteListTooltip')}">&times;</button>
            </div>
        `;
        li.querySelector('.list-name').textContent = list.name;

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
const taskIcons = {
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3 5 5M4 20l5-1L21 7l-5-5L4 14z"/></svg>',
    insert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M12 11v10M7 16h10"/></svg>',
    save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    cancel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>'
};

function taskAction(action, label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `task-action ${action}-btn`;
    button.title = label;
    button.setAttribute('aria-label', label);
    button.innerHTML = taskIcons[action] || '&times;';
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        onClick();
    });
    return button;
}

// Drafts stay out of localStorage until saved. Leaving an editor saves nonempty text.
function finishTaskEditor() {
    if (!taskEditor) return;
    const { mode, task, text } = taskEditor;
    const list = todoLists.find(l => l.id === currentListId);
    taskEditor = null;
    const index = list ? list.tasks.indexOf(task) : -1;
    if (index < 0 || !text.trim()) return;

    if (mode === 'edit') {
        task.text = text.trim();
    } else {
        const newTask = { text: text.trim(), completed: task.completed };
        list.tasks.splice(index + 1, 0, newTask);
        selectedTask = newTask;
    }
    saveTodoLists();
}

function focusTask(task = selectedTask) {
    const row = Array.from(listDetailView.querySelectorAll('.task-row')).find(row => tasksByRow.get(row) === task);
    if (row) row.querySelector('.task-text').focus();
}

function announceTaskPosition(task) {
    const list = todoLists.find(l => l.id === currentListId);
    const section = list.tasks.filter(item => item.completed === task.completed);
    document.getElementById('task-move-status').textContent = t('itemMoved', {
        name: task.text,
        position: section.indexOf(task) + 1,
        total: section.length
    });
}

// Replace only this section's slots, leaving the other section's order intact.
function saveTaskOrder(task, orderedTasks) {
    const list = todoLists.find(l => l.id === currentListId);
    let index = 0;
    list.tasks = list.tasks.map(item => item.completed === task.completed ? orderedTasks[index++] : item);
    saveTodoLists();
}

function moveSelectedTask(direction) {
    const list = todoLists.find(l => l.id === currentListId);
    const section = list.tasks.filter(task => task.completed === selectedTask.completed);
    const index = section.indexOf(selectedTask);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= section.length) return;
    [section[index], section[next]] = [section[next], section[index]];
    saveTaskOrder(selectedTask, section);
    renderTasks();
    focusTask();
    listDetailView.querySelector('.task-row.selected').scrollIntoView({ block: 'nearest' });
    announceTaskPosition(selectedTask);
}

function clearTaskDrag() {
    if (!taskDrag) return;
    const drag = taskDrag;
    taskDrag = null;
    cancelAnimationFrame(drag.frame);
    if (drag.preview) drag.preview.remove();
    drag.row.classList.remove('task-drag-placeholder');
    document.body.classList.remove('task-dragging');
    if (listDetailView.hasPointerCapture(drag.pointerId)) {
        listDetailView.releasePointerCapture(drag.pointerId);
    }
}

function updateTaskDragPosition() {
    const drag = taskDrag;
    if (!drag || !drag.active) return;
    drag.preview.style.top = `${drag.y - drag.offsetY}px`;
    const before = Array.from(drag.container.children).find(row => {
        if (row === drag.row) return false;
        const rect = row.getBoundingClientRect();
        return drag.y < rect.top + rect.height / 2;
    });
    if (drag.row.nextElementSibling !== (before || null)) {
        drag.container.insertBefore(drag.row, before || null);
    }
}

function scrollTaskDrag() {
    if (!taskDrag || !taskDrag.active) return;
    const edge = 56;
    const y = taskDrag.y;
    const speed = y < edge ? -Math.min(18, (edge - y) / 3)
        : y > innerHeight - edge ? Math.min(18, (y - innerHeight + edge) / 3) : 0;
    if (speed) window.scrollBy(0, speed);
    updateTaskDragPosition();
    taskDrag.frame = requestAnimationFrame(scrollTaskDrag);
}

function startTaskDrag(event, task, row) {
    if (selectedTask !== task || taskEditor || taskDrag || !event.isPrimary || event.button !== 0) return;
    if (event.target.closest('input, textarea, .task-actions')) return;
    const rect = row.getBoundingClientRect();
    taskDrag = {
        task, row, container: row.parentElement, pointerId: event.pointerId,
        startX: event.clientX, startY: event.clientY, y: event.clientY,
        offsetY: event.clientY - rect.top, active: false
    };
    // The selected row is the drag surface; normal scrolling remains on other rows.
    event.preventDefault();
}

function finishTaskDrag(cancelled) {
    if (!taskDrag) return;
    const { task, container, active } = taskDrag;
    if (active && !cancelled) {
        updateTaskDragPosition();
        saveTaskOrder(task, Array.from(container.children, row => tasksByRow.get(row)));
    }
    clearTaskDrag();
    if (!active) return;
    suppressTaskClick = true;
    renderTasks();
    focusTask();
    if (cancelled) {
        document.getElementById('task-move-status').textContent = t('moveCancelled');
    } else {
        announceTaskPosition(task);
    }
}

function selectTask(task) {
    const deselect = selectedTask === task;
    finishTaskEditor();
    selectedTask = deselect ? null : task;
    renderTasks();
    focusTask(task);
}

function startTaskEditor(task, mode) {
    finishTaskEditor();
    selectedTask = task;
    taskEditor = { mode, task, text: mode === 'edit' ? task.text : '' };
    renderTasks();
    const input = listDetailView.querySelector('.task-editor');
    input.focus();
    if (mode === 'edit') input.select();
}

function renderTaskEditor(task) {
    const li = document.createElement('li');
    li.className = 'task-row selected editing';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.completed;
    checkbox.disabled = true;
    checkbox.setAttribute('aria-label', t('toggleDone'));

    const input = document.createElement('textarea');
    input.className = 'task-editor';
    input.rows = 1;
    input.value = taskEditor.text;
    input.setAttribute('aria-label', t(taskEditor.mode === 'edit' ? 'editItemLabel' : 'newItemLabel'));
    input.placeholder = t('newItemLabel');

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const save = taskAction('save', t('saveItem'), () => {
        finishTaskEditor();
        renderTasks();
        focusTask();
    });
    save.disabled = !input.value.trim();
    const cancel = taskAction('cancel', t('cancelItem'), () => {
        taskEditor = null;
        renderTasks();
        focusTask();
    });
    actions.append(save, cancel);
    input.addEventListener('input', () => {
        taskEditor.text = input.value;
        save.disabled = !input.value.trim();
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
    });
    input.addEventListener('keydown', (event) => {
        if (event.isComposing) return;
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!save.disabled) save.click();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            cancel.click();
        }
    });
    li.append(checkbox, input, actions);
    return li;
}

function renderTasks() {
    clearTaskDrag();
    const list = todoLists.find(l => l.id === currentListId);
    if (!list) return;

    copyListBtn.disabled = !list.tasks.some(task => !task.completed);

    todoList.innerHTML = '';
    completedList.innerHTML = '';

    list.tasks.forEach(task => {
        const targetList = task.completed ? completedList : todoList;
        if (taskEditor && taskEditor.task === task && taskEditor.mode === 'edit') {
            targetList.appendChild(renderTaskEditor(task));
            return;
        }
        const li = document.createElement('li');
        li.className = 'task-row';
        tasksByRow.set(li, task);
        if (task.completed) li.classList.add('completed');
        if (selectedTask === task) li.classList.add('selected');

        li.innerHTML = `
            <input type="checkbox" class="task-check" aria-label="${t('toggleDone')}" ${task.completed ? 'checked' : ''}>
            <button type="button" class="task-text" aria-pressed="${selectedTask === task}"></button>
        `;
        if (selectedTask === task) li.querySelector('.task-text').setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown');
        li.querySelector('.task-text').textContent = task.text;
        li.addEventListener('click', () => selectTask(task));
        li.addEventListener('pointerdown', event => startTaskDrag(event, task, li));
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        actions.hidden = selectedTask !== task;
        actions.append(
            taskAction('edit', t('editTooltip'), () => startTaskEditor(task, 'edit')),
            taskAction('insert', t('insertTooltip'), () => startTaskEditor(task, 'insert')),
            taskAction('delete', t('deleteTooltip'), () => deleteTask(task))
        );
        li.appendChild(actions);

        const checkbox = li.querySelector('.task-check');
        checkbox.addEventListener('click', (event) => event.stopPropagation());
        checkbox.addEventListener('change', () => {
            toggleTask(task);
        });

        targetList.appendChild(li);
        if (taskEditor && taskEditor.task === task && taskEditor.mode === 'insert') {
            targetList.appendChild(renderTaskEditor(task));
        }
    });

    const editor = listDetailView.querySelector('.task-editor');
    if (editor) editor.style.height = `${editor.scrollHeight}px`;
}

function addTask() {
    finishTaskEditor();
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
    }
    renderTasks();
}

function toggleTask(task) {
    finishTaskEditor();
    task.completed = !task.completed;
    saveTodoLists();
    renderTasks();
}

function deleteTask(task) {
    finishTaskEditor();
    const list = todoLists.find(l => l.id === currentListId);
    const index = list.tasks.indexOf(task);
    if (index < 0) return;
    list.tasks.splice(index, 1);
    if (selectedTask === task) selectedTask = null;
    saveTodoLists();
    renderTasks();
}

// Event Listeners
document.addEventListener('pointerdown', () => { suppressTaskClick = false; }, true);
document.addEventListener('click', (event) => {
    if (suppressTaskClick && event.detail !== 0) {
        suppressTaskClick = false;
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

document.addEventListener('pointermove', (event) => {
    if (!taskDrag || event.pointerId !== taskDrag.pointerId) return;
    taskDrag.y = event.clientY;
    if (!taskDrag.active) {
        if (Math.hypot(event.clientX - taskDrag.startX, event.clientY - taskDrag.startY) < 8) return;
        taskDrag.active = true;
        const rect = taskDrag.row.getBoundingClientRect();
        const preview = taskDrag.row.cloneNode(true);
        preview.classList.add('task-drag-preview');
        preview.setAttribute('aria-hidden', 'true');
        preview.inert = true;
        preview.style.left = `${rect.left}px`;
        preview.style.width = `${rect.width}px`;
        document.body.appendChild(preview);
        taskDrag.preview = preview;
        taskDrag.row.classList.add('task-drag-placeholder');
        document.body.classList.add('task-dragging');
        listDetailView.setPointerCapture(event.pointerId);
        taskDrag.frame = requestAnimationFrame(scrollTaskDrag);
    }
    event.preventDefault();
    updateTaskDragPosition();
}, { passive: false });

document.addEventListener('pointerup', (event) => {
    if (!taskDrag || event.pointerId !== taskDrag.pointerId) return;
    const { task, active } = taskDrag;
    taskDrag.y = event.clientY;
    finishTaskDrag(false);
    // Handle taps directly: browsers can omit the click immediately after a touch drag.
    if (!active && event.pointerType === 'touch') {
        suppressTaskClick = true;
        selectTask(task);
    }
});
document.addEventListener('pointercancel', (event) => {
    if (taskDrag && event.pointerId === taskDrag.pointerId) finishTaskDrag(true);
});
listDetailView.addEventListener('lostpointercapture', (event) => {
    if (event.target === listDetailView && taskDrag && event.pointerId === taskDrag.pointerId) finishTaskDrag(true);
});
window.addEventListener('blur', () => finishTaskDrag(true));
document.addEventListener('keydown', (event) => {
    if (taskDrag && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        finishTaskDrag(true);
    }
}, true);

document.addEventListener('click', (event) => {
    if (!currentListId || event.target.closest('.task-row') || (!selectedTask && !taskEditor)) return;
    finishTaskEditor();
    selectedTask = null;
    renderTasks();
});

listDetailView.addEventListener('keydown', (event) => {
    if (!taskEditor && !taskDrag && selectedTask && !event.isComposing && !event.altKey && !event.ctrlKey && !event.metaKey
        && event.target.closest('.task-row.selected') && !event.target.closest('input, textarea')
        && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault();
        moveSelectedTask(event.key === 'ArrowUp' ? -1 : 1);
    }
    if (event.key === 'Escape' && !event.defaultPrevented && selectedTask) {
        const texts = Array.from(listDetailView.querySelectorAll('.task-text'));
        const index = texts.findIndex(button => button.getAttribute('aria-pressed') === 'true');
        selectedTask = null;
        renderTasks();
        const text = listDetailView.querySelectorAll('.task-text')[index];
        if (text) text.focus();
    }
});

newListBtn.addEventListener('click', showNewListInput);
cancelNewListBtn.addEventListener('click', hideNewListInput);
createListBtn.addEventListener('click', createList);
listNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createList();
    if (e.key === 'Escape') hideNewListInput();
});

backBtn.addEventListener('click', showHomeView);
addBtn.addEventListener('click', addTask);
// Enter submits (pasted multi-line input is still split per line); Shift+Enter makes a newline
todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        addTask();
    }
});

copyListBtn.addEventListener('click', async () => {
    finishTaskEditor();
    renderTasks();
    const list = todoLists.find(l => l.id === currentListId);
    if (!list) return;

    const text = list.tasks
        .filter(task => !task.completed)
        .map(task => task.text)
        .join('\n');
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
    } catch {
        // Fallback for browsers/contexts without the async clipboard API
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
    }

    copyListBtn.textContent = t('copiedBtn');
    setTimeout(() => {
        copyListBtn.textContent = t('copyListBtn');
    }, 1500);
});

// Initial render
initI18n();
showHomeView();

// PWA: custom install button (shown only when the browser offers installation)
let deferredInstallPrompt = null;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.hidden = true;
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installBtn.hidden = true;
});

// PWA: offline support. Skipped on file:// (only http(s) pages can register workers).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js');
}
