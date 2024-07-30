import { FeatureCollection, Point, Polygon } from 'geojson'
import { IAOICenterProperties } from '../interfaces/api/IAOICenterProperties'
import { IPredProperties } from '../interfaces/api/IPredProperties'
import { IAPIRegionDatetimes } from '../interfaces/api/IRegionDatetime'
import { AoiId, CurrentAoiMetaData, Model } from '../components/organisms/MapBoxMap/types'
import { ISCLProperties } from '../interfaces/api/ISCLProperties'

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

export async function fetchCurrentAoiMetaData(aoiId: number): Promise<CurrentAoiMetaData> {
    try {
        const response = await fetch(`${baseUrl}aoi?id=${aoiId}`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const currentAoiMetaData: any = await JSON.parse(await response.json())
        const metaData: CurrentAoiMetaData = {
            timestampWithSignificantPlastic: currentAoiMetaData.features[0].properties.timestamp_with_plastic_count,
        }
        return metaData
    } catch (error) {
        throw error
    }
}

export async function fetchPredictions(
    datetime: number,
    aoiId: number,
    model: Model,
    accuracyLimit: number = 33,
): Promise<FeatureCollection<Point, IPredProperties>> {
    try {
        const response = await fetch(
            `${baseUrl}predictions-by-day-and-aoi?day=${datetime}&aoi_id=${aoiId}&accuracy_limit=${accuracyLimit}&model_id=${getModelIdByName(model)}`,
        )
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const predictions: FeatureCollection<Point, IPredProperties> = await response.json()

        return predictions
    } catch (error) {
        console.error('Error loading job predictions:', error)
        throw error
    }
}
const getModelIdByName = (model: Model): string => {
    console.log('model', model)
    const modelId = Model.MariNext ? 'oceanecowatch/plasticdetectionmodel:1.0.1' : 'oceanecowatch/marinext:2'
    console.log('modelId', modelId)
    return modelId
}

export async function fetchSceneClassificationInfo(timestamp: number, aoiId: number): Promise<FeatureCollection<Polygon, ISCLProperties>> {
    const allClassesQuery =
        'classification=1&classification=2&classification=3&classification=4&classification=5&classification=6&classification=7&classification=8&classification=9&classification=10&classification=11'
    // const allClases = encodeURIComponent('1,2,3,4,5,6,7,8,9,10,11')
    const timestampISO8601UrlEncoded = encodeURIComponent(new Date(timestamp * 1000).toISOString())
    try {
        const response = await fetch(`${baseUrl}scl?${allClassesQuery}&aoi_id=${aoiId}&timestamp=${timestampISO8601UrlEncoded}`)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.status)
        }

        const sclInfo: FeatureCollection<Polygon, ISCLProperties> = JSON.parse(await response.json())
        return sclInfo
    } catch (error) {
        console.error('Error loading SCL information:', error)
        throw error
    }
    //   todo use tanstack query
}
