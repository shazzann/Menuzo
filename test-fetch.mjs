const url = 'https://jzlfjrwhfcjcqeyculbd.supabase.co/rest/v1/shops?username=eq.spicegardenkitchen&select=*';
const res = await fetch(url, { headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk'} });
const json = await res.json();
console.log(json);
