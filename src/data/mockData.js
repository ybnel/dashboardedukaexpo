export const MOCK_SALES = [
    { username: 'Puri', password: '123' },
    { username: 'Nissya', password: '123' },
    { username: 'Ivan', password: '123' },
    { username: 'Alib', password: '123' },
    { username: 'Dio', password: '123' },
    { username: 'Alif', password: '123' },
    { username: 'Mayon', password: '123' },
    { username: 'Fika', password: '123' },
    { username: 'Zela', password: '123' },
    { username: 'Deva', password: '123' },
    { username: 'Yoga', password: '123' },
    { username: 'Marina', password: '123' },
    { username: 'Arlin', password: '123' },
    { username: 'Gitta', password: '123' },
    { username: 'Rizky', password: '123' },
    { username: 'Laras', password: '123' },
    { username: 'Ayak', password: '123' },
    { username: 'Farhan', password: '123' },
    { username: 'Audrey', password: '123' },
    { username: 'Dimas', password: '123' },
    { username: 'Nafil', password: '123' },
    { username: 'Belinda', password: '123' },
    { username: 'Ayustine', password: '123' },
    { username: 'Dea', password: '123' },
    { username: 'Jessica', password: '123' },
    { username: 'admin', password: 'admin' }
];

import csvContent from '../../Data Kelas untuk upload di Program EXPO - New - Expo Sby 20-26 Jul 2026.csv?raw';

export const PACKAGE_PRICE = 1500000;

export const SCHEDULE_OPTIONS = {
    weekday: {
        label: 'Weekday (Senin - Jumat)',
        days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
        times: ['14:00 - 15:30', '15:30 - 17:00', '17:00 - 18:30']
    },
    weekend: {
        label: 'Weekend (Sabtu & Minggu)',
        days: ['Sabtu', 'Minggu'],
        times: ['09:00 - 10:30', '10:30 - 12:00', '13:00 - 14:30']
    }
};

function getDayOfWeek(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const daysIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return daysIndonesian[date.getDay()];
}

function normalizeProgram(rawProgram) {
    if (!rawProgram) return 'Other';
    const lower = rawProgram.toLowerCase();
    if (lower.includes('small stars')) return 'Small Stars';
    if (lower.includes('high flyers')) return 'High Flyers';
    if (lower.includes('trailblazer')) return 'Trailblazers';
    if (lower.includes('frontrunner')) return 'Frontrunner';
    return 'Other';
}

function getLevelFromGroupCode(groupCode) {
    if (!groupCode) return '';
    const part0 = groupCode.split('-')[0];
    if (part0.length < 5) return '';
    const remaining = part0.substring(2);
    let rawLevel = '';
    if (remaining.toUpperCase().startsWith('V')) {
        rawLevel = remaining.substring(2);
    } else {
        rawLevel = remaining;
    }
    return rawLevel.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function normalizeCenter(rawCenter) {
    if (!rawCenter) return '';
    let c = rawCenter.trim();
    if (c.toLowerCase().startsWith('sby ')) {
        c = c.substring(4).trim();
    }
    return c;
}

function translateDays(rawDays) {
    if (!rawDays) return '';
    const mapping = {
        'mon': 'Senin',
        'tue': 'Selasa',
        'wed': 'Rabu',
        'thu': 'Kamis',
        'fri': 'Jumat',
        'sat': 'Sabtu',
        'sun': 'Minggu'
    };
    const tokens = rawDays.toLowerCase().split(/[\s,&]+/);
    const translated = tokens.map(t => mapping[t.trim()] || t).filter(Boolean);
    if (translated.length === 2) {
        return `${translated[0]} & ${translated[1]}`;
    }
    return translated.join(' ');
}

function getLevelFromGroupName(groupName, program) {
    if (!groupName) return '';
    const nameUpper = groupName.toUpperCase().trim();
    const progLower = program.toLowerCase();

    if (progLower.includes('small stars')) {
        const match = nameUpper.match(/SS\s*([1-4])/);
        if (match) return match[1];
        const standalone = nameUpper.match(/\b([1-4])\b/);
        if (standalone) return standalone[1];
        const firstDigit = nameUpper.match(/([1-4])/);
        if (firstDigit) return firstDigit[1];
    }

    if (progLower.includes('high flyers')) {
        if (nameUpper.includes('FOUNDATION') || nameUpper.includes('FOUND') || nameUpper.includes('FND')) {
            return '0';
        }
        const levelPattern = /(?:1A|1B|2A|2B|3A|3B|4A|4B|G|H|I|J)\b/i;
        const match = nameUpper.match(levelPattern);
        if (match) return match[0].toUpperCase();
    }

    if (progLower.includes('trailblazer')) {
        const match = nameUpper.match(/TB\s*([1-8])/);
        if (match) return match[1];
        const standalone = nameUpper.match(/\b([1-8])\b/);
        if (standalone) return standalone[1];
        const firstDigit = nameUpper.match(/([1-8])/);
        if (firstDigit) return firstDigit[1];
    }

    if (progLower.includes('frontrunner')) {
        const match = nameUpper.match(/FR\s*([1-9]|1[0-6])/);
        if (match) return match[1];
        const standalone = nameUpper.match(/\b([1-9]|1[0-6])\b/);
        if (standalone) return standalone[1];
        const firstDigit = nameUpper.match(/([1-9]|1[0-6])/);
        if (firstDigit) return firstDigit[1];
    }

    return '';
}

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    let delimiter = ';';
    if (lines[0] && lines[0].includes(',')) {
        delimiter = ',';
    }
    const headers = lines[0].split(delimiter);
    const classes = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(delimiter);
        if (cols.length < headers.length) continue;
        
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = cols[idx];
        });
        
        const center = normalizeCenter(row['Center']);
        const rawProgram = row['Program'] ? row['Program'].trim() : '';
        const program = normalizeProgram(rawProgram);
        let timeSession = row['Time Session'] ? row['Time Session'].trim() : '';
        if (!timeSession) {
            timeSession = row['Time'] ? row['Time'].trim() : '';
        }
        if (timeSession) {
            const isPM = timeSession.toLowerCase().includes('pm');
            const isAM = timeSession.toLowerCase().includes('am');
            let cleanTime = timeSession.replace(/\s*[aApP][mM]\s*/g, '').trim();
            const timeParts = cleanTime.split(':');
            if (timeParts.length >= 2) {
                let hour = parseInt(timeParts[0], 10);
                const minute = timeParts[1].padStart(2, '0');
                if (isPM && hour < 12) hour += 12;
                if (isAM && hour === 12) hour = 0;
                timeSession = `${String(hour).padStart(2, '0')}:${minute}`;
            }
        }
        
        const groupName = row['Group: Group Name'] ? row['Group: Group Name'].trim() : '';
        const groupCode = row['Group Code'] ? row['Group Code'].trim() : '';
        const status = row['Status'] ? row['Status'].trim() : '';
        const activeStudents = parseInt(row['Active Students'], 10) || 0;
        
        let startDate = row['Start Date'] ? row['Start Date'].trim() : '';
        if (!startDate) {
            startDate = row['First Session Start Date'] ? row['First Session Start Date'].trim() : '';
        }
        
        let dayOfWeek = '';
        if (row['Session Days']) {
            dayOfWeek = translateDays(row['Session Days']);
        }
        if (!dayOfWeek) {
            dayOfWeek = getDayOfWeek(startDate);
        }
        if (!dayOfWeek) {
            const nameUpper = groupName.toUpperCase();
            if (nameUpper.includes('SAT') || nameUpper.includes('SABTU')) dayOfWeek = 'Sabtu';
            else if (nameUpper.includes('SUN') || nameUpper.includes('MINGGU')) dayOfWeek = 'Minggu';
            else if (nameUpper.includes('MON') || nameUpper.includes('SENIN')) dayOfWeek = 'Senin';
            else if (nameUpper.includes('TUE') || nameUpper.includes('SELASA')) dayOfWeek = 'Selasa';
            else if (nameUpper.includes('WED') || nameUpper.includes('RABU')) dayOfWeek = 'Rabu';
            else if (nameUpper.includes('THU') || nameUpper.includes('KAMIS')) dayOfWeek = 'Kamis';
            else if (nameUpper.includes('FRI') || nameUpper.includes('JUMAT')) dayOfWeek = 'Jumat';
            else {
                if (timeSession && (timeSession.startsWith('09') || timeSession.startsWith('10') || timeSession.startsWith('13'))) {
                    dayOfWeek = 'Sabtu';
                } else {
                    dayOfWeek = 'Senin';
                }
            }
        }
        
        if (center && program && timeSession) {
            let level = row['Level Program'] ? row['Level Program'].trim() : '';
            if (!level) {
                level = getLevelFromGroupCode(groupCode);
            }
            if (!level) {
                level = getLevelFromGroupName(groupName, program);
            }
            if (level) {
                level = level.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                if (level === 'FOUNDATION' || level === 'FOUND') {
                    level = '0';
                }
            }
            classes.push({
                school: center,
                program: program,
                hari: dayOfWeek,
                jam: timeSession,
                groupName: groupName,
                groupCode: groupCode,
                status: status,
                kapasitas: 15,
                member: activeStudents,
                level: level,
                startDate: startDate
            });
        }
    }
    return classes;
}

export const MOCK_AVAILABLE_CLASSES = parseCSV(csvContent);

// Get unique centers and programs
const centersSet = new Set();
const programsSet = new Set();
MOCK_AVAILABLE_CLASSES.forEach(c => {
    centersSet.add(c.school);
    programsSet.add(c.program);
});

export const CENTERS = Array.from(centersSet).sort();
export const PROGRAMS = Array.from(programsSet).sort();

