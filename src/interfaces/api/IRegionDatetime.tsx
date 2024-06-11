import { Polygon } from 'geojson'

export interface IImageData {
    image_id: number
    timestamp: number
    geometry: Polygon
}

export interface IAPIRegionDatetimes {
    [timestamp: string]: IImageData[]
}

export interface IRegionDatetime {
    timestamp: number
    imageData: IImageData[]
}
