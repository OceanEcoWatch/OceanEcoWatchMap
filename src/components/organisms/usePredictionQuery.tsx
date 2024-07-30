import { useQuery } from '@tanstack/react-query'
import { fetchPredictions } from '../../services/mapService'
import { Model } from './MapBoxMap/types'

export const usePredictionQuery = (timestampToFetch: number | undefined, currentAoiId: number | undefined, model: Model | undefined) => {
    return useQuery({
        queryKey: ['prediction', timestampToFetch, currentAoiId, model],
        queryFn: async () => await fetchPredictions(timestampToFetch!, currentAoiId!, model!),
        staleTime: Infinity, // Data never becomes stale
        refetchOnWindowFocus: false, // Do not refetch on window focus
        enabled: Boolean(timestampToFetch && currentAoiId && model),
    })
}
