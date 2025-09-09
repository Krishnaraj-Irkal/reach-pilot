/**
 * Validation utilities for ReachPilot connections
 */

export type ValidationResult = {
    isValid: boolean;
    error?: string;
};

/**
 * Validates email address using a simplified RFC-like pattern
 */
export function validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
        return { isValid: false, error: 'Email is required' };
    }

    // RFC-like email validation (simplified but robust)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    if (trimmedEmail.length > 320) {
        return { isValid: false, error: 'Email address is too long' };
    }

    return { isValid: true };
}

/**
 * Validates LinkedIn URL format
 */
export function validateLinkedInUrl(url: string | null | undefined): ValidationResult {
    // LinkedIn URL is optional - empty/null values are valid
    if (!url || typeof url !== 'string') {
        return { isValid: true };
    }

    const trimmedUrl = url.trim();

    // Empty string after trimming is valid (optional field)
    if (!trimmedUrl) {
        return { isValid: true };
    }

    // Must start with https://www.linkedin.com/
    if (!trimmedUrl.startsWith('https://www.linkedin.com/')) {
        return {
            isValid: false,
            error: 'LinkedIn URL must start with https://www.linkedin.com/'
        };
    }

    // Basic URL format validation
    try {
        const urlObj = new URL(trimmedUrl);
        if (urlObj.hostname !== 'www.linkedin.com') {
            return {
                isValid: false,
                error: 'LinkedIn URL must be from www.linkedin.com domain'
            };
        }
    } catch {
        return {
            isValid: false,
            error: 'Please enter a valid LinkedIn URL'
        };
    }

    return { isValid: true };
}

/**
 * Validates name field (optional but with constraints if provided)
 */
export function validateName(name: string | null | undefined): ValidationResult {
    // Name is optional
    if (!name || typeof name !== 'string') {
        return { isValid: true };
    }

    const trimmedName = name.trim();

    // Empty string after trimming is valid (optional field)
    if (!trimmedName) {
        return { isValid: true };
    }

    if (trimmedName.length > 100) {
        return { isValid: false, error: 'Name is too long (maximum 100 characters)' };
    }

    // Basic name validation - allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(trimmedName)) {
        return {
            isValid: false,
            error: 'Name can only contain letters, spaces, hyphens, and apostrophes'
        };
    }

    return { isValid: true };
}

/**
 * Normalizes email by trimming whitespace and converting to lowercase
 */
export function normalizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
        return '';
    }
    return email.trim().toLowerCase();
}

/**
 * Normalizes name by trimming whitespace
 */
export function normalizeName(name: string | null | undefined): string | null {
    if (!name || typeof name !== 'string') {
        return null;
    }
    const trimmed = name.trim();
    return trimmed || null;
}

/**
 * Normalizes LinkedIn URL by trimming whitespace
 */
export function normalizeLinkedInUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== 'string') {
        return null;
    }
    const trimmed = url.trim();
    return trimmed || null;
}

/**
 * Validates and normalizes a complete connection object
 */
export function validateConnection(data: {
    email: string;
    name?: string | null;
    linkedin_url?: string | null;
}): {
    isValid: boolean;
    errors: Record<string, string>;
    normalized: {
        email: string;
        name: string | null;
        linkedin_url: string | null;
    };
} {
    const errors: Record<string, string> = {};

    // Validate email
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid && emailValidation.error) {
        errors.email = emailValidation.error;
    }

    // Validate name
    const nameValidation = validateName(data.name);
    if (!nameValidation.isValid && nameValidation.error) {
        errors.name = nameValidation.error;
    }

    // Validate LinkedIn URL
    const linkedinValidation = validateLinkedInUrl(data.linkedin_url);
    if (!linkedinValidation.isValid && linkedinValidation.error) {
        errors.linkedin_url = linkedinValidation.error;
    }

    // Normalize data
    const normalized = {
        email: normalizeEmail(data.email),
        name: normalizeName(data.name),
        linkedin_url: normalizeLinkedInUrl(data.linkedin_url),
    };

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        normalized,
    };
}