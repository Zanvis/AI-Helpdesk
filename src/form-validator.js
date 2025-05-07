export class FormValidator {
    validateFirstname(firstname) {
        if (!firstname) return { valid: false, message: "First name is required" };
        if (firstname.length > 20)
            return {
                valid: false,
                message: "First name must be 20 characters or less",
            };
        return { valid: true };
    }

    validateLastname(lastname) {
        if (!lastname) return { valid: false, message: "Last name is required" };
        if (lastname.length > 20)
            return {
                valid: false,
                message: "Last name must be 20 characters or less",
            };
        return { valid: true };
    }

    validateEmail(email) {
        if (!email) return { valid: false, message: "Email is required" };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return { valid: false, message: "Please enter a valid email address" };

        return { valid: true };
    }

    validateReasonOfContact(reason) {
        if (!reason)
            return { valid: false, message: "Reason of contact is required" };
        if (reason.length > 100)
            return {
                valid: false,
                message: "Reason of contact must be 100 characters or less",
            };
        return { valid: true };
    }

    validateUrgency(urgency) {
        if (urgency === undefined || urgency === null)
            return { valid: false, message: "Urgency is required" };

        const urgencyNum = Number(urgency);
        if (isNaN(urgencyNum))
            return { valid: false, message: "Urgency must be a number" };
        if (!Number.isInteger(urgencyNum))
            return { valid: false, message: "Urgency must be an integer" };
        if (urgencyNum < 1 || urgencyNum > 10)
            return { valid: false, message: "Urgency must be between 1 and 10" };

        return { valid: true };
    }

    validateForm(form) {
        const validations = {
            firstname: this.validateFirstname(form.firstname),
            lastname: this.validateLastname(form.lastname),
            email: this.validateEmail(form.email),
            reasonOfContact: this.validateReasonOfContact(form.reasonOfContact),
            urgency: this.validateUrgency(form.urgency),
        };

        const isValid = Object.values(validations).every(
            (validation) => validation.valid
        );
        const errors = Object.entries(validations)
        .filter(([_, validation]) => !validation.valid)
        .reduce((acc, [field, validation]) => {
            acc[field] = validation.message;
            return acc;
        }, {});

        return { isValid, errors };
    }
}