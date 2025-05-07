document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const resetButton = document.getElementById('reset-button');

    const firstnameValue = document.getElementById('firstname-value');
    const lastnameValue = document.getElementById('lastname-value');
    const emailValue = document.getElementById('email-value');
    const reasonValue = document.getElementById('reason-value');
    const urgencyValue = document.getElementById('urgency-value');

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        contentElement.textContent = message;
        
        messageElement.appendChild(contentElement);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function updateFormState(formState) {
        firstnameValue.textContent = formState.firstname || '(Not provided)';
        lastnameValue.textContent = formState.lastname || '(Not provided)';
        emailValue.textContent = formState.email || '(Not provided)';
        reasonValue.textContent = formState.reasonOfContact || '(Not provided)';
        urgencyValue.textContent = formState.urgency !== null ? formState.urgency : '(Not provided)';
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            appendMessage('user', message);
            socket.emit('send_message', { message });
            messageInput.value = '';
        }
    }

    socket.on('connect', () => {
        socket.emit('start_conversation');
    });

    socket.on('ai_response', (data) => {
        appendMessage('ai', data.message);
        updateFormState(data.formState);
    });

    socket.on('form_complete', (data) => {
        appendMessage('ai', data.message);
        updateFormState(data.formState);
        appendMessage('ai', 'Thank you! Your form has been submitted successfully. You can reset the form to start again.');
    });

    socket.on('form_state', (data) => {
        updateFormState(data.formState);
    });

    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    resetButton.addEventListener('click', () => {
        chatMessages.innerHTML = '';
        socket.emit('reset_form');
    });
});