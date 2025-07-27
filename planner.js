document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const currentMonthEl = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const taskDateEl = document.getElementById('task-date');
    const taskList = document.getElementById('task-list');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');

    if (!calendar) return;

    let currentDate = new Date();
    let selectedDate = new Date();
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

    // Helper to get a timezone-safe YYYY-MM-DD string
    const toYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const renderCalendar = () => {
        calendar.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        currentMonthEl.textContent = `${currentDate.toLocaleString('it-IT', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0=Lunedì
        const lastDayDate = lastDayOfMonth.getDate();
        const prevLastDay = new Date(year, month, 0);
        const prevLastDayDate = prevLastDay.getDate();

        for (let i = firstDayOfWeek; i > 0; i--) {
            calendar.innerHTML += `<div class="p-2 text-gray-300">${prevLastDayDate - i + 1}</div>`;
        }

        for (let i = 1; i <= lastDayDate; i++) {
            const date = new Date(year, month, i);
            const dateString = toYYYYMMDD(date);
            let classes = 'p-2 cursor-pointer rounded-full transition-colors duration-300';

            if (toYYYYMMDD(date) === toYYYYMMDD(new Date())) {
                classes += ' bg-purple-600 text-white';
            } else if (toYYYYMMDD(date) === toYYYYMMDD(selectedDate)) {
                classes += ' bg-purple-200';
            } else {
                classes += ' hover:bg-gray-200';
            }

            if (tasks[dateString] && tasks[dateString].length > 0) {
                classes += ' border-2 border-purple-400';
            }

            calendar.innerHTML += `<div class="${classes}" data-date="${dateString}">${i}</div>`;
        }

        calendar.querySelectorAll('[data-date]').forEach(day => {
            day.addEventListener('click', () => {
                const [year, month, date] = day.dataset.date.split('-').map(Number);
                selectedDate = new Date(year, month - 1, date);
                renderTasks();
                renderCalendar();
            });
        });
    };

    const renderTasks = () => {
        const dateString = toYYYYMMDD(selectedDate);
        taskDateEl.textContent = selectedDate.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        taskList.innerHTML = '';
        const dayTasks = tasks[dateString] || [];

        if (dayTasks.length === 0) {
            taskList.innerHTML = '<li class="text-gray-500">Nessuna attività per oggi.</li>';
            return;
        }

        dayTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-2 rounded-lg transition-colors duration-300 ${task.completed ? 'bg-green-100' : 'bg-gray-100'}`;
            li.innerHTML = `
                <span class="task-item ${task.completed ? 'completed' : ''} cursor-pointer" data-index="${index}">${task.text}</span>
                <button class="delete-btn text-red-500 hover:text-red-700" data-index="${index}"><i class="fas fa-trash"></i></button>`;
            taskList.appendChild(li);
        });

        taskList.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                tasks[dateString][index].completed = !tasks[dateString][index].completed;
                saveAndRerender();
            });
        });

        taskList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                tasks[dateString].splice(index, 1);
                if (tasks[dateString].length === 0) {
                    delete tasks[dateString];
                }
                saveAndRerender();
            });
        });
    };

    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        const dateString = toYYYYMMDD(selectedDate);
        if (!tasks[dateString]) tasks[dateString] = [];
        tasks[dateString].push({ text: taskText, completed: false });
        taskInput.value = '';
        saveAndRerender();
    };

    const saveAndRerender = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        renderCalendar();
    };

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

    renderCalendar();
    renderTasks();
});