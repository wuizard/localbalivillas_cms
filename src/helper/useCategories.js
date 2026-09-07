import { useCallback, useEffect, useState } from "react";
import { getCategories } from "services/categoryService";

// ==============================|| ACTIVITY CATEGORIES - SHARED LOADER ||============================== //

/**
 * The category list every screen reads from, so the picker on the activity form
 * and the filter on the list can never drift apart. `activeOnly` is for places
 * that offer a choice; the management screen wants the inactive ones too.
 */
export default function useCategories({ activeOnly = true } = {}) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        let { data } = await getCategories({ activeOnly })
        setLoading(false)
        if (data) { setCategories(data) }
    }, [activeOnly])

    useEffect(() => {
        load()
    }, [load])

    // Categories are managed on their own screen, often in a second tab. Coming
    // back to this one picks up what was added there without a manual reload.
    useEffect(() => {
        window.addEventListener('focus', load)
        return () => window.removeEventListener('focus', load)
    }, [load])

    // react-select shape, used by the activity form.
    const options = categories.map((category) => ({
        label: category.name,
        value: category.slug,
        data: category
    }))

    return { categories, options, loading, reload: load }
}

/** Falls back to the stored slug so an activity in a removed category still reads sensibly. */
export const categoryLabel = (categories, slug) => {
    const found = categories.find((category) => category.slug === slug)
    return found ? found.name : (slug || '-')
}
