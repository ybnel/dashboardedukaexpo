export const MOCK_SALES = [
    { username: 'sales1', password: '123' },
    { username: 'sales2', password: '123' },
    { username: 'sales3', password: '123' },
    { username: 'sales4', password: '123' },
    { username: 'sales5', password: '123' },
    { username: 'admin', password: 'admin' }
];

export const CENTERS = [
    'Jakarta Selatan',
    'Jakarta Barat',
    'Jakarta Utara',
    'Jakarta Pusat',
    'Jakarta Timur',
    'Tangerang',
    'Bekasi',
    'Depok',
    'Bandung'
];

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

export const PACKAGE_PRICE = 1500000;

export const MOCK_AVAILABLE_CLASSES = [];

// Generate dummy classes for ALL schedules across ALL branches
let groupCounter = 1;
CENTERS.forEach(center => {
    // Weekday
    SCHEDULE_OPTIONS.weekday.days.forEach(day => {
        SCHEDULE_OPTIONS.weekday.times.forEach(time => {
            const groupCodeBase = day.substring(0,2).toUpperCase() + time.substring(0,2);
            MOCK_AVAILABLE_CLASSES.push({ 
                school: center, 
                groupName: `${groupCodeBase}A 25${groupCounter} / ${groupCodeBase}B 25${groupCounter+1} END 26${groupCounter}`, 
                hari: day, 
                jam: time, 
                kapasitas: 15, 
                member: Math.floor(Math.random() * 10), 
                status: 'Open' 
            });
            MOCK_AVAILABLE_CLASSES.push({ 
                school: center, 
                groupName: `${groupCodeBase}C 25${groupCounter+2} / ${groupCodeBase}D 25${groupCounter+3} END 26${groupCounter+1}`, 
                hari: day, 
                jam: time, 
                kapasitas: 15, 
                member: Math.floor(Math.random() * 5), 
                status: 'Open' 
            });
            groupCounter += 4;
        });
    });
    
    // Weekend
    SCHEDULE_OPTIONS.weekend.days.forEach(day => {
        SCHEDULE_OPTIONS.weekend.times.forEach(time => {
            const groupCodeBase = day.substring(0,2).toUpperCase() + time.substring(0,2);
            MOCK_AVAILABLE_CLASSES.push({ 
                school: center, 
                groupName: `${groupCodeBase}A 25${groupCounter} / ${groupCodeBase}B 25${groupCounter+1} END 26${groupCounter}`, 
                hari: day, 
                jam: time, 
                kapasitas: 15, 
                member: Math.floor(Math.random() * 10), 
                status: 'Open' 
            });
            MOCK_AVAILABLE_CLASSES.push({ 
                school: center, 
                groupName: `${groupCodeBase}C 25${groupCounter+2} / ${groupCodeBase}D 25${groupCounter+3} END 26${groupCounter+1}`, 
                hari: day, 
                jam: time, 
                kapasitas: 15, 
                member: Math.floor(Math.random() * 5), 
                status: 'Open' 
            });
            groupCounter += 4;
        });
    });
});
