import { FormValidator } from './form-validator.js';
import fs from 'fs';

export class FormManager {
    constructor() {
        this.form = {
            firstname: '',
            lastname: '',
            email: '',
            reasonOfContact: '',
            urgency: null
        };
        
        this.validator = new FormValidator();
        this.formComplete = false;
    }

    updateForm(data) {
        this.form = { ...this.form, ...data };
    }

    getCurrentState() {
        return { ...this.form };
    }

    getFormStatus() {
        const { isValid, errors } = this.validator.validateForm(this.form);
        const fieldsStatus = {
            firstname: this.form.firstname ? '✓' : '✗',
            lastname: this.form.lastname ? '✓' : '✗',
            email: this.validator.validateEmail(this.form.email).valid ? '✓' : '✗',
            reasonOfContact: this.form.reasonOfContact ? '✓' : '✗',
            urgency: this.validator.validateUrgency(this.form.urgency).valid ? '✓' : '✗'
        };
        
        return {
            complete: isValid,
            fieldsStatus,
            errors
        };
    }

    saveForm() {
        const { isValid } = this.validator.validateForm(this.form);
        
        if (isValid) {
            try {
                if (!fs.existsSync('data')) {
                fs.mkdirSync('data');
                }
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `data/form_${timestamp}.json`;
                
                fs.writeFileSync(filename, JSON.stringify(this.form, null, 2));
                this.formComplete = true;
                return { success: true, filename };
            } catch (error) {
                console.error('Error saving form:', error);
                return { success: false, error: 'Failed to save form data' };
            }
        } else {
            return { success: false, error: 'Form validation failed' };
        }
    }

    resetForm() {
        this.form = {
            firstname: '',
            lastname: '',
            email: '',
            reasonOfContact: '',
            urgency: null
        };
        this.formComplete = false;
    }

    isComplete() {
        return this.formComplete;
    }
}