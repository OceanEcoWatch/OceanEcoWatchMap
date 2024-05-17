import { FeatureCollection, Point, Polygon } from 'geojson'
import { PredProperties } from '../interfaces/Prediction'
import { RegionProperties } from '../interfaces/Region'

// todo remove mock objects, organise interfaces into separate folder
var baseUrl = process.env.REACT_APP_API_URL
if (baseUrl === undefined) {
    baseUrl = 'http://localhost:8000/'
}

export async function fetchRegions(): Promise<FeatureCollection<Point, RegionProperties>> {
    try {
        const response = await fetch(`${baseUrl}aoi-centers?bbox=-180,-90,180,90`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const regionsString: string = await response.json() // todo why is result a string?
        const regions: FeatureCollection<Point, RegionProperties> = JSON.parse(regionsString)

        return regions
    } catch (error) {
        console.error('Error loading regions:', error)
        throw error
    }
    // todo use tanstack query?
}

export interface ImageData {
    image_id: number
    timestamp: number
    geometry: Polygon
}

export interface APIRegionDatetimes {
    [timestamp: string]: ImageData[]
}

export interface RegionDatetime {
    timestamp: number
    imageData: ImageData[]
}

function transformRegionDatetimes(request: APIRegionDatetimes): RegionDatetime[] {
    return Object.entries(request).map(([timestamp, imageData]) => ({
        timestamp: parseInt(timestamp, 10),
        imageData: imageData,
    }))
}

export async function fetchRegionDatetimes(regionId: number): Promise<RegionDatetime[]> {
    try {
        const response = await fetch(`${baseUrl}images-by-day?aoiId=${regionId}`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const apiRegionDatetimes: APIRegionDatetimes = await response.json()
        const regionDatetimes: RegionDatetime[] = transformRegionDatetimes(apiRegionDatetimes)

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
    accuracyLimit: number = 0,
): Promise<FeatureCollection<Point, PredProperties>> {
    try {
        const response = await fetch(`${baseUrl}predictions-by-day-and-aoi?day=${datetime}&aoi_id=${regionId}&accuracy_limit=${accuracyLimit}`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const predictions: FeatureCollection<Point, PredProperties> = await response.json()

        return predictions
    } catch (error) {
        console.error('Error loading job predictions:', error)
        throw error
    }
}
