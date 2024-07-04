import { FeatureCollection, Point } from 'geojson'
import { IAOICenterProperties } from '../interfaces/api/IAOICenterProperties'
import { IPredProperties } from '../interfaces/api/IPredProperties'
import { IAPIRegionDatetimes, IRegionDatetime } from '../interfaces/api/IRegionDatetime'
import { AoiId } from '../components/organisms/MapBoxMap/types'
import { THRESHOLD_VALUE } from '../common/const'

var baseUrl = process.env.REACT_APP_API_URL

if (baseUrl === undefined) {
    baseUrl = 'http://localhost:8000/'
}

export async function fetchAoiCenters(): Promise<FeatureCollection<Point, IAOICenterProperties>> {
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

function transformRegionDatetimes(request: IAPIRegionDatetimes): number[] {
    return Object.keys(request).map((timestamp) => parseInt(timestamp, 10))
    // TODO: fix this (include the imageData)
    // return Object.entries(request).map(([timestamp, imageData]) => ({
    //     timestamp: parseInt(timestamp, 10),
    //     // imageData: imageData,
    // }))
}

export async function fetchRegionDatetimes(aoiId: AoiId): Promise<number[]> {
    if (!aoiId) {
        return []
    }
    try {
        const response = await fetch(`${baseUrl}images-by-day?aoiId=${aoiId}`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const apiRegionDatetimes: IAPIRegionDatetimes = await response.json()

        const regionDatetimes: number[] = transformRegionDatetimes(apiRegionDatetimes)

        return regionDatetimes
    } catch (error) {
        console.error('Error loading region datetimes:', error)
        throw error
    }
}

export async function fetchPredictions(
    datetime: number,
    aoiId: number,
    accuracyLimit: number = THRESHOLD_VALUE,
): Promise<FeatureCollection<Point, IPredProperties>> {
    try {
        const response = await fetch(`${baseUrl}predictions-by-day-and-aoi?day=${datetime}&aoi_id=${aoiId}&accuracy_limit=${accuracyLimit}`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const predictions: FeatureCollection<Point, IPredProperties> = await response.json()
        console.log('fetchPredictions', predictions)
        return predictions
    } catch (error) {
        console.error('Error loading job predictions:', error)
        throw error
    }
}
