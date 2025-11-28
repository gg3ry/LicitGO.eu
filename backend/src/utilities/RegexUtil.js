export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password) {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,32}$/;
    return passwordRegex.test(password);
}

export function validateUsertag(usertag) {
    const usertagRegex = /^(?=.{3,32}$)(?!.*[A-Z])[a-z0-9_-]+$/;
    return usertagRegex.test(usertag);
}

export function validateFullname(fullname) {
    const fullnameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ '-]{2,150}$/;
    return fullnameRegex.test(fullname);
}

export function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    return phoneRegex.test(phoneNumber);
}

export function validateSessionToken(token) {
    const tokenRegex = /^[A-Fa-f0-9]{64}$/;
    return tokenRegex.test(token);
}