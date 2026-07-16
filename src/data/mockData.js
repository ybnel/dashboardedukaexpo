export const MOCK_SALES = [
    { username: 'sales1', password: '123' },
    { username: 'sales2', password: '123' },
    { username: 'sales3', password: '123' },
    { username: 'sales4', password: '123' },
    { username: 'sales5', password: '123' },
    { username: 'admin', password: 'admin' }
];

import csvContent from '../../Data Jadwal Group.csv?raw';

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

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(';');
    const classes = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(';');
        if (cols.length < headers.length) continue;
        
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = cols[idx];
        });
        
        const center = row['Center'] ? row['Center'].trim() : '';
        const program = row['Program'] ? row['Program'].trim() : '';
        const timeSession = row['Time Session'] ? row['Time Session'].trim() : '';
        const groupName = row['Group: Group Name'] ? row['Group: Group Name'].trim() : '';
        const groupCode = row['Group Code'] ? row['Group Code'].trim() : '';
        const status = row['Status'] ? row['Status'].trim() : '';
        const activeStudents = parseInt(row['Active Students'], 10) || 0;
        
        let startDate = row['Start Date'] ? row['Start Date'].trim() : '';
        if (!startDate) {
            startDate = row['First Session Start Date'] ? row['First Session Start Date'].trim() : '';
        }
        
        let dayOfWeek = getDayOfWeek(startDate);
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
            classes.push({
                school: center,
                program: program,
                hari: dayOfWeek,
                jam: timeSession,
                groupName: groupName,
                groupCode: groupCode,
                status: status,
                kapasitas: 15,
                member: activeStudents
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

