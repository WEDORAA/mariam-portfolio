1) DO NOT enable Blaze if you do not want billing. Close the Billing page.
2) Firebase Authentication: Email/Password enabled; create/use the two admin users.
3) Firestore (default): admins documents with active=true already created.
4) Cloudinary: Settings → Upload Presets → Create two presets. Both must be Unsigned.
   Image preset: jpg/jpeg/png/webp, max 20MB, folder mariam-portfolio/images.
   Video preset: mp4/mov/webm/m4v, max 100MB, folder mariam-portfolio/videos.
5) Put their exact names into cloudinary-config.js.
6) In project root run: firebase deploy --only firestore
7) Live test: open index.html with Live Server. Click small Admin Login.
8) Admin dashboard uploads directly to Cloudinary, then saves metadata to Firestore.
9) Public visitors only read published items.

Security tradeoff: unsigned Cloudinary upload presets are client-visible and therefore less secure than signed uploads. Use strict preset format/size/folder restrictions. Removing an item removes it from Firestore/public view; this free version does not securely delete the Cloudinary asset because server-side deletion would require a backend secret.
