import { Polygon } from 'geojson'

export type AoiId = number | null

export interface IRegionData {
    id: number
    timestamps: number[]
    name: string
    areaSize: number
    polygon: Polygon
}
