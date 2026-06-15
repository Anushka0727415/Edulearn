// static/script.js - Handles chat and quiz interactions

// Global variables
let currentGrade = 8;

// DOM Elements
const gradeSelect = document.getElementById('gradeSelect');
const chatMessages = document.getElementById('chatMessages');
const userQuestion = document.getElementById('userQuestion');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const topicInput = document.getElementById('topicInput');
const generateQuizBtn = document.getElementById('generateQuizBtn');
const quizResult = document.getElementById('quizResult');

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active content
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}Tab`).classList.add('active');
    });
});

// Update grade when changed
gradeSelect.addEventListener('change', (e) => {
    currentGrade = parseInt(e.target.value);
    addSystemMessage(`📚 Switched to Class ${currentGrade}. I'll explain accordingly!`);
});

// Send question
async function sendQuestion() {
    const question = userQuestion.value.trim();
    if (!question) {
        addSystemMessage("Please enter a question first!");
        return;
    }
    
    // Add user message to chat
    addUserMessage(question);
    userQuestion.value = '';
    
    // Show loading indicator
    const loadingId = addLoadingMessage();
    
    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                grade_level: currentGrade
            })
        });
        
        const data = await response.json();
        
        // Remove loading message
        removeLoadingMessage(loadingId);
        
        if (data.error) {
            addBotMessage(`❌ ${data.error}`);
        } else {
            addBotMessage(data.answer);
        }
    } catch (error) {
        removeLoadingMessage(loadingId);
        addBotMessage(`⚠️ Network error: ${error.message}. Make sure the server is running.`);
    }
}

// Generate quiz
async function generateQuiz() {
    const topic = topicInput.value.trim();
    if (!topic) {
        quizResult.innerHTML = '<p style="color: #EF4444;">⚠️ Please enter a topic first!</p>';
        return;
    }
    
    quizResult.innerHTML = '<div class="loading">✨ Generating your quiz... Please wait 5-10 seconds.</div>';
    
    try {
        const response = await fetch('/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                grade_level: currentGrade
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            quizResult.innerHTML = `<p style="color: #EF4444;">❌ ${data.error}</p>`;
        } else {
            // Format quiz nicely
            let formattedQuiz = `<div style="background: white; padding: 8px;">`;
            formattedQuiz += `<strong>📝 Quiz on "${data.topic}" for Class ${data.grade_level}</strong><br><br>`;
            formattedQuiz += data.quiz.replace(/\n/g, '<br>');
            formattedQuiz += `<br><br><em>⭐ Write your answers on paper and check with a teacher!</em>`;
            formattedQuiz += `</div>`;
            quizResult.innerHTML = formattedQuiz;
        }
    } catch (error) {
        quizResult.innerHTML = `<p style="color: #EF4444;">⚠️ Error: ${error.message}</p>`;
    }
}

// Helper: Add user message to chat
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-icon">👤</div>
        <div class="message-bubble">${escapeHtml(text)}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Helper: Add bot message
function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-icon">🤖</div>
        <div class="message-bubble">${formatBotMessage(escapeHtml(text))}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Helper: Add system message
function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-icon">ℹ️</div>
        <div class="message-bubble" style="background: #FEF3C7;">${escapeHtml(text)}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Helper: Add loading message
function addLoadingMessage() {
    const id = 'loading-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.id = id;
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-icon">🤖</div>
        <div class="message-bubble loading">Thinking... 🤔</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    return id;
}

// Helper: Remove loading message
function removeLoadingMessage(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

// Helper: Format bot message (bold, line breaks)
function formatBotMessage(text) {
    // Convert line breaks to <br>
    let formatted = text.replace(/\n/g, '<br>');
    // Make **bold** into <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formatted;
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper: Scroll chat to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Clear chat
function clearChat() {
    chatMessages.innerHTML = '';
    addBotMessage("👋 Chat cleared! Ask me anything about your studies. 📖");
}

// Event listeners
sendBtn.addEventListener('click', sendQuestion);
clearChatBtn.addEventListener('click', clearChat);
generateQuizBtn.addEventListener('click', generateQuiz);

// Send on Enter (Ctrl+Enter for new line)
userQuestion.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        sendQuestion();
    }
});

// Initial welcome
console.log('EduTutorAI loaded - SDG 4: Quality Education');