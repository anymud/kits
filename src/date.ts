export function addDate(date: Date, value = 1) {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + value)
  return newDate
}

export function* iterateDate(startDate: Date, endDate: Date) {
  for (let date = startDate; date <= endDate; date = addDate(date))
    yield date
}

export function getYMD(date: Date = new Date()) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}
