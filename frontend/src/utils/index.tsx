export function formatDateTime(iso: string): string {
    const date = new Date(iso);

    // Ottieni il giorno, il mese e l'ora
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Combina i valori nel formato desiderato
    return `${day} ${month}, ${hours}:${minutes}`;
}

export function formatMinutesToHour(value: number): string {
    if (value <= 0) {
        return '0m'
    }

    let hours = Math.trunc(value / 60)
    let minutes = value % 60


    return `${hours !== 0 ? hours + "h" : ""} ${minutes !== 0 ? minutes + "m" : ""}`
}