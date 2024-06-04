import { Polygon } from 'geojson'

export interface IRegionProperties {
    id: number
    jobs: number[]
    name: string
    areaSize: number
}

export interface IRegionData {
    id: number
    name: string
    areaSize: number
    polygon: Polygon
}
