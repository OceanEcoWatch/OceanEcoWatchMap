import { useQuery } from '@tanstack/react-query'
import { fetchPredictions } from '../../services/mapService'

export const usePredictionQuery = (timestampToFetch: number | undefined, currentAoiId: number | undefined) => {
    return useQuery({
        queryKey: ['prediction', timestampToFetch, currentAoiId],
        queryFn: async () => await fetchPredictions(timestampToFetch!, currentAoiId!), //is das ok hier zu forcen?
        staleTime: Infinity, // Data never becomes stale
        refetchOnWindowFocus: false, // Do not refetch on window focus
        enabled: Boolean(timestampToFetch && currentAoiId),
    })
}
