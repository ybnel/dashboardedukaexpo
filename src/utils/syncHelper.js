import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function syncLeadsToGoogleSheets() {
    try {
        // Fetch ALL leads in Firestore
        const q = collection(db, 'leads');
        const querySnapshot = await getDocs(q);
        const allLeads = [];
        querySnapshot.forEach((doc) => {
            allLeads.push({ id: doc.id, ...doc.data() });
        });

        // Sort by registration date chronological order
        allLeads.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

        const webAppUrl = "https://script.google.com/macros/s/AKfycbwVGcLCEfLJOz7YeGE11i024XOykNt2eOfdmPlzlwUoSQsOzzeQd5pOxsAIGuF_JDdp3A/exec";

        // POST data to Google Sheets Apps Script (fire-and-forget in background)
        fetch(webAppUrl, {
            method: 'POST',
            mode: 'no-cors', // Apps Script requires no-cors for simple redirects
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ leads: allLeads })
        }).catch(err => console.error('Silent Google Sheet sync fetch failed:', err));
        
    } catch (err) {
        console.error('Silent Google Sheet sync database fetch failed:', err);
    }
}
