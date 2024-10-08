import { combineReducers } from "@reduxjs/toolkit";

import userSlice from "./userSlice";
import themeSlice from "./theme";

const rootReducer = combineReducers({
    user: userSlice,
    theme: themeSlice,
});

export { rootReducer };
