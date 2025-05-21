export function listDatesInRange(start, end) {
    const dates = [];
    const cur = new Date(start);
    while (cur <= end) {
        dates.push(new Date(cur)); // Guardar fecha completa con hora
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
}