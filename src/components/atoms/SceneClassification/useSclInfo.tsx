import { useQuery } from '@tanstack/react-query'
import { fetchSceneClassificationInfo } from '../../../services/mapService'

export const useSclQuery = (timestampToFetch: number | undefined, currentAoiId: number | undefined) => {
    return useQuery({
        queryKey: ['sceneClassification', timestampToFetch, currentAoiId],
        queryFn: async () => await fetchSceneClassificationInfo(timestampToFetch!, currentAoiId!),
        staleTime: Infinity, // Data never becomes stale
        refetchOnWindowFocus: false, // Do not refetch on window focus
        enabled: Boolean(timestampToFetch && currentAoiId),
    })
}
