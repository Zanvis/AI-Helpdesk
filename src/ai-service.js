import { GoogleGenAI } from '@google/genai';

export class AIService {
    constructor(apiKey) {
        this.genAI = new GoogleGenAI({ apiKey });
        this.model = this.genAI.models;
        this.chatHistory = [];

        this.chatHistory.push({ 
                role: 'model', 
                parts: [{ 
                text: "I am an AI assistant designed to help you fill out a helpdesk form. I'll guide you through the process by asking for information one piece at a time. Let's get started!"
            }]
        });
    }

    async sendMessage(message) {
        try {
            this.chatHistory.push({ role: 'user', parts: [{ text: message }] });
            
            const instructions = `Please help the user fill out a helpdesk form by collecting the following information:
            - Firstname (string, max 20 characters)
            - Lastname (string, max 20 characters)
            - Email (valid email format)
            - Reason of contact (string, max 100 characters)
            - Urgency (integer, range 1-10)
            
            Guide the user through providing this information in a conversational manner. Ask for one piece of information at a time.
            If any information is invalid (e.g., email format is wrong, text is too long, urgency not in range 1-10), politely ask for it again.
            
            When you have all the required information, format the final response in JSON like this:
            {
                "firstname": "...",
                "lastname": "...",
                "email": "...",
                "reasonOfContact": "...",
                "urgency": #
            }
            
            If this is the start of the conversation, greet the user and ask for their first name.`;
            
            const response = await this.model.generateContent({
                model: 'gemini-2.0-flash',
                contents: [
                    { role: 'user', parts: [{ text: instructions }] },
                    ...this.chatHistory
                ],
                generationConfig: {
                    temperature: 0.5,
                    topP: 0.8,
                    topK: 16,
                    maxOutputTokens: 800,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    }, 
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                ],
            });
            
            let responseText;
            try {
                responseText = response.candidates[0].content.parts[0].text;
            } catch (error) {
                console.error('Error extracting text from response:', error);
                responseText = "I couldn't process your request correctly. Let's try again.";
            }
            
            this.chatHistory.push({ role: 'model', parts: [{ text: responseText }] });
            
            return responseText;
        } catch (error) {
            console.error('Error sending message to AI:', error);
            return 'Sorry, I encountered an error processing your request. Please try again.';
        }
    }

    hasJsonFormat(text) {
        try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            JSON.parse(jsonMatch[0]);
            return true;
        }
        return false;
        } catch (e) {
        return false;
        }
    }

    extractJson(text) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
                return null;
        } catch (e) {
            return null;
        }
    }
}