import React from "react";
import Activities from "./Activities";

// Drafts are the same screen with the status filter flipped, exactly as Places does it.
function ActivityDrafts() {
    return <Activities status="draft" />
}

export default ActivityDrafts;
