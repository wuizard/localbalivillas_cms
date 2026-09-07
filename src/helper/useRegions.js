import { useCallback, useEffect, useState } from "react";
import { loadLocation, loadRegion } from "services/regionService";

// ==============================|| REGIONS & LOCATIONS - SHARED LOADER ||============================== //

/**
 * Regions, and the locations inside the one named by `regionName`. Same source as the
 * Places filter and the Region/Location settings, so an activity is filed against the
 * same taxonomy as everything else rather than a typed-in place name.
 *
 * Takes the region's name because that is what a form holds. The locations endpoint
 * wants the region's own `regionId` string (ID00001), which is resolved here.
 */
export default function useRegions(regionName) {
    const [regions, setRegions] = useState([])
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)

    const loadRegions = useCallback(async () => {
        setLoading(true)
        let { data } = await loadRegion()
        setLoading(false)
        if (data) { setRegions(data) }
    }, [])

    useEffect(() => {
        loadRegions()
    }, [loadRegions])

    const selected = regions.find((region) => region.regionName === regionName)
    const selectedRegionId = selected ? selected.regionId : null

    useEffect(() => {
        let cancelled = false

        const run = async () => {
            if (!selectedRegionId) { setLocations([]); return }
            let { data } = await loadLocation(selectedRegionId)
            if (!cancelled && data) { setLocations(data) }
        }

        run()
        return () => { cancelled = true }
    }, [selectedRegionId])

    return {
        regions,
        locations,
        loading,
        regionOptions: regions.map((region) => ({
            label: region.regionName,
            value: region.regionName,
            data: region
        })),
        locationOptions: locations.map((location) => ({
            label: location.locationName,
            value: location.locationName,
            data: location
        }))
    }
}
