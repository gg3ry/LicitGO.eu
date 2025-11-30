import en from './EN.json' assert { type: 'json' };
import hu from './HU.json' assert { type: 'json' };

function handleLanguage(lang) {
    const language = String(lang || 'EN').split(',')[0].split('-')[0].toUpperCase();
    switch (language) {
        case 'HU':
            return hu;
        case 'EN':
        default:
            return en;
    }
}

export default function handleStatus(code, lang) {
    const messages = handleLanguage(lang);
    return messages[code] || 'Unknown status code';
}