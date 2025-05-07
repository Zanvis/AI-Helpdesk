import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { AIService } from './ai-service.js';
import { FormManager } from './form-manager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('GEMINI_API_KEY is required. Please set it in .env file.');
    process.exit(1);
}

app.use(express.static(join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

const formManagers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    const aiService = new AIService(API_KEY);
    const formManager = new FormManager();
    formManagers.set(socket.id, { aiService, formManager });

    socket.on('start_conversation', async () => {
        try {
            const response = await aiService.sendMessage('Hello');
            socket.emit('ai_response', { message: response, formState: formManager.getCurrentState() });
        } catch (error) {
            console.error('Error starting conversation:', error);
            socket.emit('ai_response', { 
                message: 'Sorry, I encountered an error starting the conversation. Please try again.', 
                formState: formManager.getCurrentState() 
            });
        }
    });

    socket.on('send_message', async (data) => {
        try {
            const { message } = data;
            const response = await aiService.sendMessage(message);
            
            if (aiService.hasJsonFormat(response)) {
                const formData = aiService.extractJson(response);
                formManager.updateForm(formData);
                
                const saveResult = formManager.saveForm();
                if (saveResult.success) {
                    socket.emit('form_complete', { 
                        message: response,
                        formState: formManager.getCurrentState()
                    });
                } else {
                    socket.emit('ai_response', { 
                        message: response,
                        formState: formManager.getCurrentState() 
                    });
                }
            } else {
                socket.emit('ai_response', { 
                    message: response,
                    formState: formManager.getCurrentState() 
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
            socket.emit('ai_response', { 
                message: 'Sorry, I encountered an error processing your request. Please try again.',
                formState: formManager.getCurrentState()
            });
        }
    });

    socket.on('get_form_state', () => {
        socket.emit('form_state', { formState: formManager.getCurrentState() });
    });

    socket.on('reset_form', async () => {
        formManager.resetForm();
        const aiService = new AIService(API_KEY);
        formManagers.set(socket.id, { aiService, formManager });
        
        try {
            const response = await aiService.sendMessage('Hello');
            socket.emit('ai_response', { message: response, formState: formManager.getCurrentState() });
        } catch (error) {
            console.error('Error resetting form:', error);
            socket.emit('ai_response', { 
                message: 'Sorry, I encountered an error resetting the form. Please try again.', 
                formState: formManager.getCurrentState() 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        formManagers.delete(socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});