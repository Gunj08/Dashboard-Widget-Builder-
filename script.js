// --- STATE MANAGEMENT ---
let widgets = [];
let editingWidgetId = null;

// Mock Data for new widgets
const defaultData = {
    number: { title: 'Total Revenue', content: '1,250' },
    text: { title: 'Notes', content: 'Meeting at 3 PM.\nBuy groceries.' },
    list: { title: 'Pending Tasks', content: ['Design Mockup', 'Client Call', 'Fix Bugs'] },
    progress: { title: 'Project Status', content: '70' },
    chart: { title: 'Weekly Views', content: [40, 60, 25, 80, 50] } // content used for heights
};

// --- DOM ELEMENTS ---
const grid = document.getElementById('widgetGrid');
const emptyState = document.getElementById('emptyState');
const addModal = document.getElementById('addModal');
const editDrawer = document.getElementById('editDrawer');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderWidgets();
    setupEventListeners();
});

function setupEventListeners() {
    // Buttons
    document.getElementById('addWidgetBtn').addEventListener('click', () => addModal.classList.add('active'));
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Close Modal on Outside Click
    window.onclick = (e) => {
        if (e.target === addModal) closeModal('addModal');
        if (e.target === editDrawer) closeDrawer();
    };
}

// --- WIDGET LOGIC ---

function createWidget(type) {
    const data = defaultData[type];
    const newWidget = {
        id: Date.now().toString(),
        type: type,
        title: data.title,
        content: data.content
    };

    widgets.push(newWidget);
    closeModal('addModal');
    renderWidgets();
}

function deleteWidget() {
    if (editingWidgetId) {
        widgets = widgets.filter(w => w.id !== editingWidgetId);
        closeDrawer();
        renderWidgets();
    }
}

function saveWidget() {
    const titleInput = document.getElementById('editTitle').value;
    const contentInput = document.getElementById('editContentInput');
    const contentTextarea = document.getElementById('editContentTextarea');

    const widgetIndex = widgets.findIndex(w => w.id === editingWidgetId);
    if (widgetIndex === -1) return;

    const type = widgets[widgetIndex].type;
    let newContent;

    // Parse content based on type
    if (type === 'list' || type === 'text') {
        let raw = contentTextarea.value;
        newContent = type === 'list' ? raw.split('\n').filter(i => i.trim() !== '') : raw;
    } else if (type === 'number' || type === 'progress') {
        newContent = contentInput.value;
    } else {
        newContent = widgets[widgetIndex].content; // Chart data doesn't change in this demo
    }

    widgets[widgetIndex].title = titleInput;
    widgets[widgetIndex].content = newContent;

    closeDrawer();
    renderWidgets();
}

// --- RENDERING UI ---

function renderWidgets() {
    grid.innerHTML = '';

    if (widgets.length === 0) {
        emptyState.classList.add('active');
        return;
    } else {
        emptyState.classList.remove('active');
    }

    widgets.forEach(widget => {
        const card = document.createElement('div');
        card.className = 'widget-card';
        card.draggable = true;
        card.dataset.id = widget.id;

        // Drag Events
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);

        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <i class="fa-solid ${getIcon(widget.type)}"></i>
                    ${widget.title}
                </div>
                <div class="card-actions">
                    <button class="edit-btn" onclick="openEditDrawer('${widget.id}')">
                        <i class="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                ${getWidgetContentHTML(widget)}
            </div>
        `;
        grid.appendChild(card);
    });
}

function getWidgetContentHTML(widget) {
    switch (widget.type) {
        case 'number':
            return `<div class="content-number">${widget.content}</div>`;
        case 'text':
            return `<div class="content-text">${widget.content}</div>`;
        case 'list':
            return `<div class="content-list"><ul>${widget.content.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
        case 'progress':
            return `
                <div class="progress-container">
                    <div class="progress-label"><span>Complete</span><span>${widget.content}%</span></div>
                    <div class="progress-track"><div class="progress-fill" style="width: ${Math.min(100, widget.content)}%"></div></div>
                </div>`;
        case 'chart':
            return `
                <div class="chart-container">
                    ${widget.content.map(h => `<div class="chart-bar" style="height: ${h}%"></div>`).join('')}
                </div>`;
        default: return '';
    }
}

function getIcon(type) {
    const icons = { number: 'fa-hashtag', text: 'fa-align-left', list: 'fa-list-check', progress: 'fa-bars-progress', chart: 'fa-chart-column' };
    return icons[type] || 'fa-circle';
}

// --- MODALS & DRAWERS ---

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openEditDrawer(id) {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;

    editingWidgetId = id;
    const drawer = document.getElementById('editDrawer');
    const titleInput = document.getElementById('editTitle');
    const contentInput = document.getElementById('editContentInput');
    const contentTextarea = document.getElementById('editContentTextarea');
    const chartMsg = document.getElementById('chartMsg');
    const label = document.getElementById('editContentLabel');

    titleInput.value = widget.title;

    // Toggle Inputs based on type
    contentInput.classList.add('hidden');
    contentTextarea.classList.add('hidden');
    chartMsg.classList.add('hidden');

    if (widget.type === 'text') {
        label.innerText = 'Text Note';
        contentTextarea.value = widget.content;
        contentTextarea.classList.remove('hidden');
    } else if (widget.type === 'list') {
        label.innerText = 'List Items (One per line)';
        contentTextarea.value = widget.content.join('\n');
        contentTextarea.classList.remove('hidden');
    } else if (widget.type === 'chart') {
        label.innerText = 'Chart Data';
        chartMsg.classList.remove('hidden');
    } else {
        label.innerText = 'Value';
        contentInput.value = widget.content;
        contentInput.type = widget.type === 'number' ? 'text' : 'number';
        contentInput.classList.remove('hidden');
    }

    drawer.classList.add('active');
}

function closeDrawer() {
    document.getElementById('editDrawer').classList.remove('active');
    editingWidgetId = null;
}

// --- THEME ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('themeToggle');
    btn.innerHTML = document.body.classList.contains('dark-mode')
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
}

// --- DRAG AND DROP ---
let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');
}

function handleDrop(e) {
    e.stopPropagation();
    const targetCard = this;

    if (dragSrcEl !== targetCard) {
        const draggedId = dragSrcEl.dataset.id;
        const targetId = targetCard.dataset.id;

        const draggedIndex = widgets.findIndex(w => w.id === draggedId);
        const targetIndex = widgets.findIndex(w => w.id === targetId);

        // Swap in array
        const [draggedItem] = widgets.splice(draggedIndex, 1);
        widgets.splice(targetIndex, 0, draggedItem);

        // Re-render
        renderWidgets();
    }
    return false;
}