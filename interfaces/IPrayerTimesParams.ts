export interface IPrayerTimesParams {
    school: number,
    method: number,
    country: string,
    city: string,
    date_or_timestamp?: string,
    state?: string,
    tune?: string,
    midnightMode?: number,
    timezonestring?: string,
    latitudeAdjustmentMethod?: number
}

export default IPrayerTimesParams;