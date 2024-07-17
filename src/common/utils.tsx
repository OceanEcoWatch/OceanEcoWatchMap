type ColorCoding = {
    [key: number]: string
}

export const colorCoding: ColorCoding = {
    10: 'rgba(255, 237, 160, 0.8)',
    20: 'rgba(254, 217, 118, 0.8)',
    30: 'rgba(254, 178, 76, 0.8)',
    40: 'rgba(253, 141, 60, 0.8)',
    50: 'rgba(252, 78, 42, 0.8)',
    60: 'rgba(227, 26, 28, 0.8)',
    70: 'rgba(189, 0, 38, 0.8)',
    80: 'rgba(128, 0, 38, 0.8)',
    90: 'rgba(102, 0, 38, 0.8)',
    100: 'rgba(61, 4, 4, 0.8)',
}

export const getBeginningOfUTCDay = (timestamp: number) => {
    // Given timestamp
    timestamp = timestamp * 1000 // Convert to milliseconds
    const date = new Date(timestamp)
    // Reset the time components to get the start of the UTC day
    date.setUTCHours(0, 0, 0, 0)
    // Get the new timestamp (in milliseconds) and convert to seconds
    return Math.floor(date.getTime() / 1000)
}
