/**
 * Stateful Todo Card logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let state = {
    title: "Design System Audit",
    description: "Review the current component library for consistency, accessibility, and performance bottlenecks. Document findings in the wiki and prepare a report for the engineering leadership team. The audit should cover color contrast, keyboard navigation, and screen reader compatibility across all major browsers.",
    priority: "High", // Low, Medium, High
    status: "In Progress", // Pending, In Progress, Done
    dueDate: new Date('2026-04-18T10:00:00'),
    isEditing: false,
    isExpanded: false
  };

  // --- ELEMENTS ---
  const card = document.querySelector('[data-testid="test-todo-card"]');
  const titleEl = document.querySelector('[data-testid="test-todo-title"]');
  const descEl = document.querySelector('[data-testid="test-todo-description"]');
  const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]');
  const priorityBadge = document.querySelector('[data-testid="test-todo-priority"]');
  const statusControl = document.querySelector('[data-testid="test-todo-status-control"]');
  const dueDateDisplay = document.querySelector('[data-testid="test-todo-due-date"]');
  const timeRemainingEl = document.querySelector('[data-testid="test-todo-time-remaining"]');
  const expandToggle = document.querySelector('[data-testid="test-todo-expand-toggle"]');
  const collapsibleSection = document.querySelector('[data-testid="test-todo-collapsible-section"]');
  
  // Action buttons
  const editBtn = document.querySelector('[data-testid="test-todo-edit-button"]');
  const saveBtn = document.querySelector('[data-testid="test-todo-save-button"]');
  const cancelBtn = document.querySelector('[data-testid="test-todo-cancel-button"]');
  
  // Form inputs
  const editTitleInput = document.querySelector('[data-testid="test-todo-edit-title-input"]');
  const editDescInput = document.querySelector('[data-testid="test-todo-edit-description-input"]');
  const editPrioritySelect = document.querySelector('[data-testid="test-todo-edit-priority-select"]');
  const editDueDateInput = document.querySelector('[data-testid="test-todo-edit-due-date-input"]');

  // --- LOGIC ---

  function formatTime(date) {
    const now = new Date();
    const diff = date - now;
    const absDiff = Math.abs(diff);
    
    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    if (state.status === 'Done') return 'Completed';

    const isOverdue = diff < 0;
    card.classList.toggle('is-overdue', isOverdue);

    if (isOverdue) {
      if (hours < 1) return `Overdue by ${minutes} minutes`;
      if (days < 1) return `Overdue by ${hours} hours`;
      return `Overdue by ${days} days`;
    } else {
      if (minutes < 1) return 'Due now!';
      if (hours < 1) return `Due in ${minutes} minutes`;
      if (days < 1) return `Due in ${hours} hours`;
      if (days === 1) return 'Due tomorrow';
      return `Due in ${days} days`;
    }
  }

  function render() {
    // 1. Update text content
    titleEl.textContent = state.title;
    descEl.textContent = state.description;
    
    // 2. Priority visual indicator
    card.classList.remove('priority-low', 'priority-medium', 'priority-high');
    card.classList.add(`priority-${state.priority.toLowerCase()}`);
    priorityBadge.textContent = state.priority;
    priorityBadge.className = `badge badge-priority-${state.priority.toLowerCase()}`;
    priorityBadge.setAttribute('aria-label', `Priority: ${state.priority}`);

    // 3. Status logic
    statusControl.value = state.status;
    const statusTextEl = document.querySelector('[data-testid="test-todo-status"]');
    if (statusTextEl) statusTextEl.textContent = state.status;
    
    checkbox.checked = state.status === 'Done';
    card.classList.toggle('done', state.status === 'Done');

    // 4. Time
    const formattedDate = state.dueDate.toLocaleDateString(undefined, { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
    dueDateDisplay.textContent = `Due ${formattedDate}`;
    dueDateDisplay.setAttribute('datetime', state.dueDate.toISOString());
    timeRemainingEl.textContent = formatTime(state.dueDate);

    // 5. Expand / Collapse
    const shouldShowToggle = state.description.length > 150;
    expandToggle.style.display = shouldShowToggle ? 'block' : 'none';
    if (state.isExpanded) {
      collapsibleSection.classList.add('expanded');
      expandToggle.textContent = 'Show less';
      expandToggle.setAttribute('aria-expanded', 'true');
    } else {
      collapsibleSection.classList.remove('expanded');
      expandToggle.textContent = 'Show more';
      expandToggle.setAttribute('aria-expanded', 'false');
    }

    // 6. Mode toggle
    card.classList.toggle('editing-mode', state.isEditing);
    
    // Fill inputs if editing
    if (state.isEditing) {
      editTitleInput.value = state.title;
      editDescInput.value = state.description;
      editPrioritySelect.value = state.priority;
      
      // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
      const tzOffset = state.dueDate.getTimezoneOffset() * 60000;
      const localISODate = new Date(state.dueDate - tzOffset).toISOString().slice(0, 16);
      editDueDateInput.value = localISODate;
      
      editTitleInput.focus();
    }
  }

  // --- EVENTS ---

  checkbox.addEventListener('change', (e) => {
    state.status = e.target.checked ? 'Done' : 'Pending';
    render();
  });

  statusControl.addEventListener('change', (e) => {
    state.status = e.target.value;
    render();
  });

  expandToggle.addEventListener('click', () => {
    state.isExpanded = !state.isExpanded;
    render();
  });

  editBtn.addEventListener('click', () => {
    state.isEditing = true;
    render();
  });

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    state.title = editTitleInput.value;
    state.description = editDescInput.value;
    state.priority = editPrioritySelect.value;
    state.dueDate = new Date(editDueDateInput.value);
    state.isEditing = false;
    render();
    editBtn.focus();
  });

  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    state.isEditing = false;
    render();
    editBtn.focus();
  });

  // Time update loop
  setInterval(() => {
    if (!state.isEditing) render();
  }, 30000);

  // Initial render
  render();
});