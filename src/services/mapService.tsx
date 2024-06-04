import { FeatureCollection, Point } from 'geojson'
import { IAOICenterProperties } from '../interfaces/api/IAOICenterProperties'
import { IPredProperties } from '../interfaces/api/IPredProperties'
import { IAPIRegionDatetimes, IRegionDatetime } from '../interfaces/api/IRegionDatetime'

var baseUrl = process.env.REACT_APP_API_URL

//when the example value is used in the env (if none provided http://localhost:8000/ will be used) the baseUrl is not undefined and a faulty endpoint is used to make the fetches
if (baseUrl === undefined) {
    baseUrl = 'http://localhost:8000/'
}

export async function fetchRegions(): Promise<FeatureCollection<Point, IAOICenterProperties>> {
    try {
        const response = await fetch(`${baseUrl}aoi-centers?bbox=-180,-90,180,90`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const regionsString: string = await response.json() // todo why is result a string?
        const regions: FeatureCollection<Point, IAOICenterProperties> = JSON.parse(regionsString)

        return regions
    } catch (error) {
        console.error('Error loading regions:', error)
        throw error
    }
    // todo use tanstack query
}

function transformRegionDatetimes(request: IAPIRegionDatetimes): IRegionDatetime[] {
    return Object.entries(request).map(([timestamp, imageData]) => ({
        timestamp: parseInt(timestamp, 10),
        imageData: imageData,
    }))
}

export async function fetchRegionDatetimes(regionId: number): Promise<IRegionDatetime[]> {
    try {
        const response = await fetch(`${baseUrl}images-by-day?aoiId=${regionId}`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const apiRegionDatetimes: IAPIRegionDatetimes = await response.json()
        const regionDatetimes: IRegionDatetime[] = transformRegionDatetimes(apiRegionDatetimes)

        return regionDatetimes
    } catch (error) {
        console.error('Error loading region datetimes:', error)
        throw error
    }
    //   todo use tanstack query
}

export async function getJobPredictions(
    datetime: number,
    regionId: number,
    accuracyLimit: number = 10,
): Promise<FeatureCollection<Point, IPredProperties>> {
    try {
        const response = await fetch(`${baseUrl}predictions-by-day-and-aoi?day=${datetime}&aoi_id=${regionId}&accuracy_limit=${accuracyLimit}`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const predictions: FeatureCollection<Point, IPredProperties> = await response.json()

        return predictions
    } catch (error) {
        console.error('Error loading job predictions:', error)
        throw error
    }
    //   todo use tanstack query
}
