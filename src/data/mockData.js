export const MOCK_SALES = [
    { username: 'Puri', password: '123' },
    { username: 'Bunga', password: '123' },
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
    { username: 'Anna', password: '123' },
    { username: 'Wulan', password: '123' },
    { username: 'Ria', password: '123' },
    { username: 'sales1', password: '123' },
    { username: 'admin', password: 'admin' }
];

import csvContent from '../../Data Kelas Expo 2026.csv?raw';

export const PACKAGE_PRICE = 1500000;

export const SCHEDULE_OPTIONS = {
    weekday: {
        label: 'Weekday (Monday - Friday)',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        times: ['14:00 - 15:30', '15:30 - 17:00', '17:00 - 18:30']
    },
    weekend: {
        label: 'Weekend (Saturday & Sunday)',
        days: ['Saturday', 'Sunday'],
        times: ['09:00 - 10:30', '10:30 - 12:00', '13:00 - 14:30']
    }
};

function getDayOfWeek(dateStr) {
    if (!dateStr) return null;
    const clean = dateStr.replace(/-/g, '/').trim();
    const parts = clean.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const daysEnglish = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysEnglish[date.getDay()];
}

function resolveDate(rawDate, sessionDays) {
    if (!rawDate) return '';
    const clean = rawDate.replace(/-/g, '/').trim();
    const parts = clean.split('/');
    if (parts.length !== 3) return rawDate;

    let A = parseInt(parts[0], 10);
    let B = parseInt(parts[1], 10);
    let yearPart = parts[2].trim();
    let year = yearPart.length === 2 ? '20' + yearPart : yearPart;

    let day = A;
    let month = B;

    if (A > 12) {
        day = A;
        month = B;
    } else if (B > 12) {
        day = B;
        month = A;
    } else {
        if (sessionDays) {
            const tokens = sessionDays.toLowerCase().split(/[\s,&]+/);
            const activeDays = tokens.map(t => {
                if (t.includes('mon') || t.includes('senin')) return 1;
                if (t.includes('tue') || t.includes('selasa')) return 2;
                if (t.includes('wed') || t.includes('rabu')) return 3;
                if (t.includes('thu') || t.includes('kamis')) return 4;
                if (t.includes('fri') || t.includes('jumat')) return 5;
                if (t.includes('sat') || t.includes('sabtu')) return 6;
                if (t.includes('sun') || t.includes('minggu')) return 0;
                return null;
            }).filter(x => x !== null);

            if (activeDays.length > 0) {
                const date1 = new Date(parseInt(year, 10), B - 1, A);
                const match1 = activeDays.includes(date1.getDay());

                const date2 = new Date(parseInt(year, 10), A - 1, B);
                const match2 = activeDays.includes(date2.getDay());

                if (match1 && !match2) {
                    day = A;
                    month = B;
                } else if (match2 && !match1) {
                    day = B;
                    month = A;
                }
            }
        }
    }

    return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

export function normalizeProgram(rawProgram) {
    if (!rawProgram) return 'Other';
    const lower = rawProgram.toLowerCase().replace(/\s+/g, '');
    if (lower.includes('smallstars')) return 'Small Stars';
    if (lower.includes('highflyers')) return 'High Flyers';
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
        'mon': 'Monday',
        'tue': 'Tuesday',
        'wed': 'Wednesday',
        'thu': 'Thursday',
        'fri': 'Friday',
        'sat': 'Saturday',
        'sun': 'Sunday'
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

function getCapacity(program, level) {
    const prog = (program || '').toLowerCase();
    const lvl = (level || '').trim();
    
    if (prog.includes('small stars')) {
        if (lvl === '1' || lvl === '2') {
            return 8;
        }
        if (lvl === '3' || lvl === '4') {
            return 12;
        }
        return 15; // default fallback
    }
    
    if (prog.includes('high flyers')) {
        return 14;
    }
    
    if (prog.includes('trailblazer')) {
        return 14;
    }
    
    return 15; // Frontrunner and others remain unchanged
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
        let rawProgram = row['Program'] ? row['Program'].trim() : '';
        const program = normalizeProgram(rawProgram);
        if (rawProgram) {
            rawProgram = rawProgram
                .split(/\s+/)
                .map(word => {
                    if (word.toUpperCase() === word && word.length > 1) {
                        return word;
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join(' ');
        }
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
        const startWeek = row['Start Week'] ? row['Start Week'].trim() : '';
        
        let startDate = row['Start Date'] ? row['Start Date'].trim() : '';
        if (!startDate) {
            startDate = row['First Session Start Date'] ? row['First Session Start Date'].trim() : '';
        }
        startDate = resolveDate(startDate, row['Session Days']);
        
        let dayOfWeek = '';
        if (row['Session Days']) {
            dayOfWeek = translateDays(row['Session Days']);
        }
        if (!dayOfWeek) {
            dayOfWeek = getDayOfWeek(startDate);
        }
        if (!dayOfWeek) {
            const nameUpper = groupName.toUpperCase();
            if (nameUpper.includes('SAT') || nameUpper.includes('SABTU')) dayOfWeek = 'Saturday';
            else if (nameUpper.includes('SUN') || nameUpper.includes('MINGGU')) dayOfWeek = 'Sunday';
            else if (nameUpper.includes('MON') || nameUpper.includes('SENIN')) dayOfWeek = 'Monday';
            else if (nameUpper.includes('TUE') || nameUpper.includes('SELASA')) dayOfWeek = 'Tuesday';
            else if (nameUpper.includes('WED') || nameUpper.includes('RABU')) dayOfWeek = 'Wednesday';
            else if (nameUpper.includes('THU') || nameUpper.includes('KAMIS')) dayOfWeek = 'Thursday';
            else if (nameUpper.includes('FRI') || nameUpper.includes('JUMAT')) dayOfWeek = 'Friday';
            else {
                if (timeSession && (timeSession.startsWith('09') || timeSession.startsWith('10') || timeSession.startsWith('13'))) {
                    dayOfWeek = 'Saturday';
                } else {
                    dayOfWeek = 'Monday';
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
                rawProgram: rawProgram,
                hari: dayOfWeek,
                jam: timeSession,
                groupName: groupName,
                groupCode: groupCode,
                status: status,
                kapasitas: getCapacity(program, level),
                member: activeStudents,
                level: level,
                startDate: startDate,
                startWeek: startWeek
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

