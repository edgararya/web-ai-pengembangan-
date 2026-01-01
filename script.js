const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const sendBtn = document.getElementById('send-btn');

// Auto-resize textarea
promptInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.value === '') this.style.height = '24px';
});

// Handle Enter key (Shift+Enter for new line)
promptInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Clear and reset input
    promptInput.value = '';
    promptInput.style.height = '24px';

    // Remove welcome message if it exists
    const welcome = document.querySelector('.welcome-message');
    if (welcome) welcome.remove();

    // Add User Message
    addMessage(prompt, 'user');

    // Create AI Message Placeholder
    const aiMessageId = 'ai-' + Date.now();
    addMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'ai', aiMessageId);

    // Call AI
    await fetchAIResponse(prompt, aiMessageId);
});

function addMessage(content, role, id = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    let avatarHTML = '';
    if (role === 'ai') {
        avatarHTML = `
            <div class="avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                    <path d="M12 12 2.3 2.3"></path>
                    <path d="M22 12h-6.2"></path>
                </svg>
            </div>
        `;
    }

    messageDiv.innerHTML = `
        ${avatarHTML}
        <div class="message-content" ${id ? `id="${id}"` : ''}>${content}</div>
    `;

    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function fetchAIResponse(prompt, messageId) {
    const aiContentDiv = document.getElementById(messageId);
    let fullText = "";

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "deepseek-r1",
                prompt: prompt,
                stream: true
            })
        });

        if (!response.ok) throw new Error('Failed to connect to Ollama');

        // Reset content (remove typing indicator)
        aiContentDiv.innerHTML = '';

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // Ollama sends JSON objects one by one in the stream
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (!line) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        const textChunk = json.response;
                        fullText += textChunk;
                        // Simple Markdown-like formatting check (very basic)
                        // A real app would use a library like 'marked'
                        aiContentDiv.innerHTML = simpleFormat(fullText);
                        scrollToBottom();
                    }
                } catch (e) {
                    console.error("Error parsing JSON chunk", e);
                }
            }
        }

    } catch (error) {
        aiContentDiv.innerHTML = `<span style="color: #ef4444;">Error: ${error.message}. Is Ollama running?</span>`;
    }
}

// Basic formatter to handle newlines and code blocks roughly
function simpleFormat(text) {
    // Escape HTML first to prevent XSS (basic)
    let safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Convert newlines to <br>
    safeText = safeText.replace(/\n/g, '<br>');

    // Bold **text**
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Code blocks ```code``` (Very simple implementation)
    safeText = safeText.replace(/```(.*?)```/g, '<pre><code>$1</code></pre>');

    return safeText;
}
