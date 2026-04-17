import {initializeApp} from "firebase-admin/app";

initializeApp();

export {createLink} from "./links/create-link.js";
export {deleteLink} from "./links/delete-link.js";
export {redirect} from "./links/redirect-link.js";
export {cleanupExpiredLinks} from "./links/cleanup-expired.js";
export {ensureProfile} from "./auth/ensure-profile.js";
