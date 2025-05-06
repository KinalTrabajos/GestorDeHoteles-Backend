export function listDatesInRange(start, end) {
    const dates = [];
    const cur = new Date(start);
    while (cur <= end) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
}