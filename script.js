// DOM Elements
const mainNotepad = document.getElementById('mainNotepad');
const addToListBtn = document.getElementById('addToListBtn');
const saveBtn = document.getElementById('saveBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const savedLinesList = document.getElementById('savedLinesList');
const savedNotesList = document.getElementById('savedNotesList');
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authTabs = document.querySelectorAll('.auth-tab');
const userInfo = document.querySelector('.user-info');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const devConsoleBtn = document.getElementById('devConsoleBtn');
const devConsoleModal = document.getElementById('devConsoleModal');
const closeDevConsole = document.getElementById('closeDevConsole');
const editDevProfile = document.getElementById('editDevProfile');
const toggleDevMode = document.getElementById('toggleDevMode');
const exportData = document.getElementById('exportData');
const devName = document.getElementById('devName');
const devRole = document.getElementById('devRole');
const devStatus = document.getElementById('devStatus');
const devAvatar = document.getElementById('devAvatar');
const notesCount = document.getElementById('notesCount');
const lastActive = document.getElementById('lastActive');

// Current user state
let currentUser = null;

// Add developer state
let isDeveloperMode = false;
let developerProfile = JSON.parse(localStorage.getItem('devProfile')) || {
    name: 'Developer Name',
    role: 'Full Stack Developer',
    status: 'Active',
    avatar: 'https://www.gravatar.com/avatar/default?s=150'
};

// Check authentication status
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        currentUser = user;
        showApp();
    } else {
        showAuthModal();
    }
}

// Show authentication modal
function showAuthModal() {
    authModal.classList.add('show');
    document.querySelector('.container').style.filter = 'blur(5px)';
}

// Hide authentication modal
function hideAuthModal() {
    authModal.classList.remove('show');
    document.querySelector('.container').style.filter = 'none';
}

// Show main app
function showApp() {
    hideAuthModal();
    userInfo.style.display = 'flex';
    userEmail.textContent = currentUser.email;
    loadSavedNotes();
    
    // Show developer console button only for developers
    if (currentUser.email.includes('dev') || currentUser.role === 'developer') {
        devConsoleBtn.style.display = 'block';
    } else {
        devConsoleBtn.style.display = 'none';
    }
}

// Handle auth tabs
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (tab.dataset.tab === 'login') {
            loginForm.style.display = 'flex';
            signupForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'flex';
        }
    });
});

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = Object.values(users).find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showApp();
    } else {
        alert('Invalid email or password');
    }
});

// Handle signup
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (Object.values(users).some(u => u.email === email)) {
        alert('Email already exists');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        role: email.includes('dev') ? 'developer' : 'user' // Add role based on email
    };
    
    users[newUser.id] = newUser;
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showApp();
});

// Handle logout
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    userInfo.style.display = 'none';
    savedLinesList.innerHTML = '';
    savedNotesList.innerHTML = '';
    mainNotepad.value = '';
    showAuthModal();
});

// Initialize dark mode from localStorage
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
}

// Dark mode toggle
darkModeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'false');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'true');
    }
});

// Current note state
let currentNoteId = Date.now().toString();
let currentLines = [];

// Modified save function to include user ID
function saveNote() {
    if (currentLines.length === 0 || !currentUser) return;

    const notesKey = `notes_${currentUser.id}`;
    const notes = JSON.parse(localStorage.getItem(notesKey) || '{}');
    notes[currentNoteId] = {
        id: currentNoteId,
        lines: currentLines,
        timestamp: Date.now()
    };
    
    localStorage.setItem(notesKey, JSON.stringify(notes));
    loadSavedNotes();
    
    // Visual feedback
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
    setTimeout(() => {
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
    }, 1000);
}

// Modified load function to use user-specific notes
function loadSavedNotes() {
    if (!currentUser) return;
    
    const notesKey = `notes_${currentUser.id}`;
    const notes = JSON.parse(localStorage.getItem(notesKey) || '{}');
    savedNotesList.innerHTML = '';
    
    Object.values(notes)
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.innerHTML = `
                <div>${new Date(note.timestamp).toLocaleDateString()}</div>
                <div>${note.lines.length} lines</div>
            `;
            
            noteCard.addEventListener('click', () => {
                currentNoteId = note.id;
                currentLines = [...note.lines];
                updateSavedLinesList();
            });
            
            savedNotesList.appendChild(noteCard);
        });
}

// Create a new note
function createNewNote() {
    currentNoteId = Date.now().toString();
    currentLines = [];
    mainNotepad.value = '';
    updateSavedLinesList();
}

// Add text to lines list
addToListBtn.addEventListener('click', () => {
    const text = mainNotepad.value.trim();
    if (text) {
        const lines = text.split('\n').filter(line => line.trim());
        currentLines.push(...lines);
        mainNotepad.value = '';
        updateSavedLinesList();
    }
});

// Update the saved lines list
function updateSavedLinesList() {
    savedLinesList.innerHTML = '';
    currentLines.forEach((line, index) => {
        const lineItem = document.createElement('div');
        lineItem.className = 'line-item';
        
        const lineContent = document.createElement('input');
        lineContent.type = 'text';
        lineContent.className = 'line-content';
        lineContent.value = line;
        lineContent.addEventListener('change', (e) => {
            currentLines[index] = e.target.value;
        });

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'line-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => {
            currentLines.splice(index, 1);
            updateSavedLinesList();
        });

        const moveUpBtn = document.createElement('button');
        moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        moveUpBtn.disabled = index === 0;
        moveUpBtn.addEventListener('click', () => {
            if (index > 0) {
                [currentLines[index], currentLines[index - 1]] = 
                [currentLines[index - 1], currentLines[index]];
                updateSavedLinesList();
            }
        });

        const moveDownBtn = document.createElement('button');
        moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
        moveDownBtn.disabled = index === currentLines.length - 1;
        moveDownBtn.addEventListener('click', () => {
            if (index < currentLines.length - 1) {
                [currentLines[index], currentLines[index + 1]] = 
                [currentLines[index + 1], currentLines[index]];
                updateSavedLinesList();
            }
        });

        actionsDiv.appendChild(moveUpBtn);
        actionsDiv.appendChild(moveDownBtn);
        actionsDiv.appendChild(deleteBtn);

        lineItem.appendChild(lineContent);
        lineItem.appendChild(actionsDiv);
        savedLinesList.appendChild(lineItem);
    });
}

// Event listeners
saveBtn.addEventListener('click', saveNote);
newNoteBtn.addEventListener('click', createNewNote);

// Developer Console Functions
function showDevConsole() {
    devConsoleModal.classList.add('show');
    updateDevStats();
}

function hideDevConsole() {
    devConsoleModal.classList.remove('show');
}

function updateDevStats() {
    // Update developer profile
    devName.textContent = developerProfile.name;
    devRole.textContent = `Role: ${developerProfile.role}`;
    devStatus.textContent = `Status: ${developerProfile.status}`;
    devAvatar.src = developerProfile.avatar;

    // Update statistics
    if (currentUser) {
        const notesKey = `notes_${currentUser.id}`;
        const notes = JSON.parse(localStorage.getItem(notesKey) || '{}');
        notesCount.textContent = Object.keys(notes).length;
    }

    // Update last active
    const lastActiveTime = new Date();
    lastActive.textContent = lastActiveTime.toLocaleTimeString();
}

function editProfile() {
    const newProfile = {
        name: prompt('Enter your name:', developerProfile.name),
        role: prompt('Enter your role:', developerProfile.role),
        status: prompt('Enter your status:', developerProfile.status),
        avatar: prompt('Enter avatar URL:', developerProfile.avatar)
    };

    if (newProfile.name && newProfile.role && newProfile.status) {
        developerProfile = newProfile;
        localStorage.setItem('devProfile', JSON.stringify(developerProfile));
        updateDevStats();
    }
}

function toggleDeveloperMode() {
    isDeveloperMode = !isDeveloperMode;
    document.body.classList.toggle('dev-mode', isDeveloperMode);
    toggleDevMode.innerHTML = isDeveloperMode ? 
        '<i class="fas fa-code"></i> Disable Dev Mode' : 
        '<i class="fas fa-code"></i> Developer Mode';
}

function exportUserData() {
    if (!currentUser) return;

    const notesKey = `notes_${currentUser.id}`;
    const userData = {
        profile: currentUser,
        notes: JSON.parse(localStorage.getItem(notesKey) || '{}'),
        developerProfile: developerProfile,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dx-notepad-data-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add these event listeners after your existing event listeners
devConsoleBtn.addEventListener('click', showDevConsole);
closeDevConsole.addEventListener('click', hideDevConsole);
editDevProfile.addEventListener('click', editProfile);
toggleDevMode.addEventListener('click', toggleDeveloperMode);
exportData.addEventListener('click', exportUserData);

// Initialize app
window.addEventListener('load', () => {
    checkAuth();
}); 