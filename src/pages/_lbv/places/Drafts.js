import React from "react"
import Places from "./Places"

// Drafts live as a tab inside Places. This route stays so existing links (and
// the redirect after "Save as Draft") open the list with that tab selected.
function Drafts () {
    return <Places initialStatus="draft" />
}

export default Drafts
