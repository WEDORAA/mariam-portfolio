import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";
import { cloudinaryConfig } from "./cloudinary-config.js";


/* =========================================
   FIREBASE
========================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const $ = (id) =>
  document.getElementById(id);


/* =========================================
   DEFAULT SECTIONS
========================================= */

const DEFAULT_CATEGORIES = [

  "Reels",

  "Social Media",

  "PR",

  "Campaigns",

  "Events",

  "Behind The Scenes",

  "Other"

];


/* =========================================
   DEFAULT CLIENTS
========================================= */

const DEFAULT_CLIENTS = [

  "One Clinics",

  "Orange Egypt",

  "Personal",

  "Other"

];


let currentUser = null;

let items = [];

let deleteId = null;


/* =========================================
   ADMIN AUTH
========================================= */

onAuthStateChanged(

  auth,

  async (user) => {

    if (!user) {

      location.href =
        "index.html";

      return;

    }


    try {

      const adminDoc =
        await getDoc(

          doc(
            db,
            "admins",
            user.uid
          )

        );


      if (

        !adminDoc.exists() ||

        adminDoc.data()?.active !== true

      ) {

        await signOut(auth);

        location.href =
          "index.html";

        return;

      }


      currentUser =
        user;


      if ($("adminEmail")) {

        $("adminEmail").textContent =
          user.email || "Admin";

      }


      await Promise.all([

        loadTaxonomy(),

        loadItems(),

        loadProfile()

      ]);

    }

    catch (error) {

      console.error(
        "ADMIN AUTH ERROR:",
        error
      );


      await signOut(auth);

      location.href =
        "index.html";

    }

  }

);


/* =========================================
   LOGOUT
========================================= */

if ($("logout")) {

  $("logout").addEventListener(

    "click",

    async () => {

      await signOut(auth);

      location.href =
        "index.html";

    }

  );

}


/* =========================================
   LOAD SECTIONS + CLIENTS
========================================= */

async function loadTaxonomy() {

  try {

    const [

      categorySnapshot,

      clientSnapshot

    ] = await Promise.all([

      getDocs(

        query(

          collection(
            db,
            "categories"
          ),

          orderBy(
            "name",
            "asc"
          )

        )

      ),

      getDocs(

        query(

          collection(
            db,
            "clients"
          ),

          orderBy(
            "name",
            "asc"
          )

        )

      )

    ]);


    const storedCategories =

      categorySnapshot.docs

        .map(
          (d) =>
            d.data().name
        )

        .filter(Boolean);


    const storedClients =

      clientSnapshot.docs

        .map(
          (d) =>
            d.data().name
        )

        .filter(Boolean);


    populateSelect(

      $("category"),

      mergeUnique(
        DEFAULT_CATEGORIES,
        storedCategories
      ),

      "Choose a section"

    );


    populateSelect(

      $("client"),

      mergeUnique(
        DEFAULT_CLIENTS,
        storedClients
      ),

      "Choose a client / brand"

    );

  }

  catch (error) {

    console.error(
      "TAXONOMY LOAD ERROR:",
      error
    );


    populateSelect(

      $("category"),

      DEFAULT_CATEGORIES,

      "Choose a section"

    );


    populateSelect(

      $("client"),

      DEFAULT_CLIENTS,

      "Choose a client / brand"

    );

  }

}


/* =========================================
   MERGE OPTIONS
========================================= */

function mergeUnique(
  first,
  second
) {

  return [

    ...new Set(

      [

        ...first,

        ...second

      ]

      .map(
        (value) =>
          String(value)
            .trim()
      )

      .filter(Boolean)

    )

  ]

  .sort(

    (a, b) =>
      a.localeCompare(b)

  );

}


/* =========================================
   POPULATE SELECT
========================================= */

function populateSelect(
  select,
  values,
  placeholder
) {

  if (!select)
    return;


  select.innerHTML = "";


  const first =
    document.createElement(
      "option"
    );


  first.value = "";

  first.textContent =
    placeholder;

  select.appendChild(
    first
  );


  values.forEach(

    (value) => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        value;

      option.textContent =
        value;


      select.appendChild(
        option
      );

    }

  );

}


/* =========================================
   ADD NEW SECTION OR CLIENT
========================================= */

async function addTaxonomy(
  type
) {

  const isCategory =
    type === "categories";


  const label =
    isCategory
      ? "section"
      : "client / brand";


  const value =
    prompt(
      `Add new ${label}:`
    );


  if (!value)
    return;


  const clean =
    value.trim();


  if (!clean)
    return;


  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          type
        )

      );


    const exists =
      snapshot.docs.some(

        (d) =>

          String(
            d.data().name || ""
          )

          .trim()

          .toLowerCase()

          ===

          clean.toLowerCase()

      );


    if (!exists) {

      await addDoc(

        collection(
          db,
          type
        ),

        {

          name:
            clean,

          createdAt:
            Date.now(),

          createdBy:
            currentUser.uid

        }

      );

    }


    await loadTaxonomy();


    if (isCategory) {

      $("category").value =
        clean;

    }

    else {

      $("client").value =
        clean;

    }

  }

  catch (error) {

    console.error(
      "ADD TAXONOMY ERROR:",
      error
    );


    alert(
      error.message ||
      `Could not add ${label}.`
    );

  }

}


if ($("addCategoryBtn")) {

  $("addCategoryBtn").addEventListener(

    "click",

    () =>
      addTaxonomy(
        "categories"
      )

  );

}


if ($("addClientBtn")) {

  $("addClientBtn").addEventListener(

    "click",

    () =>
      addTaxonomy(
        "clients"
      )

  );

}


/* =========================================
   CLOUDINARY DIRECT UPLOAD
========================================= */

function selectAndUpload(
  type
) {

  const input =
    document.createElement(
      "input"
    );


  input.type =
    "file";


  input.style.display =
    "none";


  if (type === "image") {

    input.accept =
      "image/jpeg,image/jpg,image/png,image/webp";

  }

  else {

    input.accept =
      "video/mp4,video/quicktime,video/webm,video/x-m4v";

  }


  document.body.appendChild(
    input
  );


  input.addEventListener(

    "change",

    async () => {

      const file =
        input.files?.[0];


      if (!file) {

        input.remove();

        return;

      }


      try {

        await uploadToCloudinary(
          file,
          type
        );

      }

      catch (error) {

        console.error(
          "CLOUDINARY ERROR:",
          error
        );


        showMessage(

          error.message ||
          "Cloudinary upload failed."

        );

      }

      finally {

        input.remove();

      }

    }

  );


  input.click();

}


/* =========================================
   CLOUDINARY UPLOAD
========================================= */

async function uploadToCloudinary(
  file,
  type
) {

  const preset =

    type === "image"

      ? cloudinaryConfig.imageUploadPreset

      : cloudinaryConfig.videoUploadPreset;


  if (!cloudinaryConfig.cloudName) {

    throw new Error(
      "Cloudinary cloud name is missing."
    );

  }


  if (
    !preset ||
    preset.startsWith("REPLACE_")
  ) {

    throw new Error(
      "Cloudinary upload preset is missing."
    );

  }


  if (
    type === "image" &&
    file.size >
      20 * 1024 * 1024
  ) {

    throw new Error(
      "Image is too large. Maximum is 20 MB."
    );

  }


  if (
    type === "video" &&
    file.size >
      100 * 1024 * 1024
  ) {

    throw new Error(
      "Video is too large. Maximum is 100 MB."
    );

  }


  if (
    type === "image" &&
    !file.type.startsWith(
      "image/"
    )
  ) {

    throw new Error(
      "Please choose an image."
    );

  }


  if (
    type === "video" &&
    !file.type.startsWith(
      "video/"
    )
  ) {

    throw new Error(
      "Please choose a video."
    );

  }


  showMessage(
    "Uploading to Cloudinary..."
  );


  const formData =
    new FormData();


  formData.append(
    "file",
    file
  );


  formData.append(
    "upload_preset",
    preset
  );


  const resourceType =
    type === "video"
      ? "video"
      : "image";


  const endpoint =

    `https://api.cloudinary.com/v1_1/${

      cloudinaryConfig.cloudName

    }/${resourceType}/upload`;


  const response =
    await fetch(

      endpoint,

      {

        method:
          "POST",

        body:
          formData

      }

    );


  let result;


  try {

    result =
      await response.json();

  }

  catch {

    throw new Error(
      "Cloudinary returned an invalid response."
    );

  }


  if (!response.ok) {

    console.error(
      "Cloudinary response:",
      result
    );


    throw new Error(

      result?.error?.message ||

      `Upload failed (${response.status}).`

    );

  }


  if (!result.secure_url) {

    throw new Error(
      "Cloudinary did not return a media URL."
    );

  }


  setUpload(
    result
  );


  showMessage(
    "Upload completed successfully. Add the details and save."
  );

}


/* =========================================
   IMAGE BUTTON
========================================= */

if ($("imageBtn")) {

  $("imageBtn").addEventListener(

    "click",

    () =>
      selectAndUpload(
        "image"
      )

  );

}


/* =========================================
   VIDEO BUTTON
========================================= */

if ($("videoBtn")) {

  $("videoBtn").addEventListener(

    "click",

    () =>
      selectAndUpload(
        "video"
      )

  );

}


/* =========================================
   SET UPLOAD DATA
========================================= */

function setUpload(
  info
) {

  if ($("url")) {

    $("url").value =
      info.secure_url ||
      "";

  }


  if ($("publicId")) {

    $("publicId").value =
      info.public_id ||
      "";

  }


  if ($("type")) {

    $("type").value =
      info.resource_type ||
      "image";

  }


  if ($("deleteToken")) {

    $("deleteToken").value =
      info.delete_token ||
      "";

  }


  if ($("preview")) {

    $("preview").innerHTML =
      "";


    if (
      info.resource_type ===
      "video"
    ) {

      const video =
        document.createElement(
          "video"
        );


      video.src =
        info.secure_url;


      video.controls =
        true;


      video.playsInline =
        true;


      video.muted =
        true;


      $("preview").appendChild(
        video
      );

    }

    else {

      const image =
        document.createElement(
          "img"
        );


      image.src =
        info.secure_url;


      image.alt =
        "Uploaded preview";


      $("preview").appendChild(
        image
      );

    }


    $("preview").classList.remove(
      "hidden"
    );

  }

}


/* =========================================
   SAVE FORM
========================================= */

if ($("form")) {

  $("form").addEventListener(

    "submit",

    async (event) => {

      event.preventDefault();


      const editingId =
        $("editingId")?.value.trim() ||
        "";


      const uploadedUrl =
        $("url")?.value.trim() ||
        "";


      const category =
        $("category")?.value.trim() ||
        "";


      const client =
        $("client")?.value.trim() ||
        "";


      if (
        !editingId &&
        !uploadedUrl
      ) {

        showMessage(
          "Please upload an image or video first."
        );

        return;

      }


      if (!category) {

        showMessage(
          "Please choose a section."
        );

        return;

      }


      if (!client) {

        showMessage(
          "Please choose a client / brand."
        );

        return;

      }


      const data = {

        title:
          $("title")?.value.trim() ||
          "",

        category:
          category,

        client:
          client,

        description:
          $("description")?.value.trim() ||
          "",

        featured:
          $("featured")?.checked === true,

        published:
          $("published")?.checked === true,

        updatedAt:
          Date.now()

      };


      try {

        if ($("save")) {

          $("save").disabled =
            true;

        }


        showMessage(
          "Saving..."
        );


        /* ======================
           NEW ITEM
        ====================== */

        if (!editingId) {

          const nextOrder =

            items.length

              ? Math.max(

                  ...items.map(

                    (item) =>
                      Number(
                        item.order
                      ) || 0

                  )

                ) + 1

              : 1;


          await addDoc(

            collection(
              db,
              "portfolioItems"
            ),

            {

              ...data,

              url:
                uploadedUrl,

              publicId:
                $("publicId")?.value ||
                "",

              type:
                $("type")?.value ||
                "image",

              deleteToken:
                $("deleteToken")?.value ||
                "",

              order:
                nextOrder,

              createdAt:
                Date.now(),

              createdBy:
                currentUser.uid

            }

          );

        }


        /* ======================
           UPDATE ITEM
        ====================== */

        else {

          const updateData = {
            ...data
          };


          if (uploadedUrl) {

            updateData.url =
              uploadedUrl;

            updateData.publicId =
              $("publicId")?.value ||
              "";

            updateData.type =
              $("type")?.value ||
              "image";

            updateData.deleteToken =
              $("deleteToken")?.value ||
              "";

          }


          await updateDoc(

            doc(
              db,
              "portfolioItems",
              editingId
            ),

            updateData

          );

        }


        resetForm();

        await loadItems();


        showMessage(
          "Saved successfully."
        );

      }

      catch (error) {

        console.error(
          "FIRESTORE ERROR:",
          error
        );


        showMessage(
          error.message ||
          "Could not save this item."
        );

      }

      finally {

        if ($("save")) {

          $("save").disabled =
            false;

        }

      }

    }

  );

}


/* =========================================
   RESET
========================================= */

function resetForm() {

  if ($("form")) {

    $("form").reset();

  }


  [

    "url",

    "publicId",

    "type",

    "deleteToken",

    "editingId"

  ].forEach(

    (id) => {

      if ($(id)) {

        $(id).value =
          "";

      }

    }

  );


  if ($("published")) {

    $("published").checked =
      true;

  }


  if ($("preview")) {

    $("preview").innerHTML =
      "";

    $("preview").classList.add(
      "hidden"
    );

  }


  if ($("save")) {

    $("save").textContent =
      "Save & Publish";

  }


  if ($("cancel")) {

    $("cancel").classList.add(
      "hidden"
    );

  }

}


/* =========================================
   CANCEL EDIT
========================================= */

if ($("cancel")) {

  $("cancel").addEventListener(

    "click",

    () => {

      resetForm();

      showMessage("");

    }

  );

}


/* =========================================
   LOAD ITEMS
========================================= */

async function loadItems() {

  try {

    const snapshot =
      await getDocs(

        query(

          collection(
            db,
            "portfolioItems"
          ),

          orderBy(
            "order",
            "asc"
          )

        )

      );


    items =

      snapshot.docs.map(

        (document) => ({

          id:
            document.id,

          ...document.data()

        })

      );


    updateStats();

    loadCategories();

    renderItems();

  }

  catch (error) {

    console.error(
      "LOAD ITEMS ERROR:",
      error
    );


    if ($("table")) {

      $("table").innerHTML =

        `<div class="row">
          Could not load portfolio items.
        </div>`;

    }

  }

}


/* =========================================
   STATS
========================================= */

function updateStats() {

  if ($("total")) {

    $("total").textContent =
      items.length;

  }


  if ($("pub")) {

    $("pub").textContent =

      items.filter(

        (item) =>
          item.published === true

      ).length;

  }


  if ($("feat")) {

    $("feat").textContent =

      items.filter(

        (item) =>
          item.featured === true

      ).length;

  }


  if ($("vid")) {

    $("vid").textContent =

      items.filter(

        (item) =>
          item.type === "video"

      ).length;

  }

}


/* =========================================
   CATEGORY OPTIONS
========================================= */

function loadCategories() {

  const categories =

    [

      ...new Set(

        items

          .map(
            (item) =>
              item.category
          )

          .filter(Boolean)

      )

    ];


  /*
     This is only for future typing/autocomplete
     if the field is changed later.
  */

}


/* =========================================
   RENDER MANAGE WORK
========================================= */

function renderItems() {

  if (!$("table"))
    return;


  if (!items.length) {

    $("table").innerHTML =

      `<div class="row">
        No items yet.
      </div>`;

    return;

  }


  $("table").innerHTML =
    "";


  items.forEach(

    (item) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "row";


      const thumb =
        document.createElement(
          "div"
        );


      thumb.className =
        "thumb";


      if (
        item.type ===
        "video"
      ) {

        const video =
          document.createElement(
            "video"
          );


        video.src =
          item.url;


        video.muted =
          true;


        video.playsInline =
          true;


        video.preload =
          "metadata";


        thumb.appendChild(
          video
        );

      }

      else {

        const image =
          document.createElement(
            "img"
          );


        image.src =
          item.url;


        image.alt =
          item.title ||
          "Portfolio";


        thumb.appendChild(
          image
        );

      }


      const info =
        document.createElement(
          "div"
        );


      const title =
        document.createElement(
          "strong"
        );


      title.textContent =
        item.title ||
        "Untitled";


      const category =
        document.createElement(
          "small"
        );


      category.textContent =

        [

          item.category,

          item.client

        ]

        .filter(Boolean)

        .join(
          " • "
        );


      info.append(
        title,
        category
      );


      const edit =
        document.createElement(
          "button"
        );


      edit.type =
        "button";


      edit.textContent =
        "Edit";


      edit.addEventListener(

        "click",

        () =>
          startEdit(
            item
          )

      );


      const remove =
        document.createElement(
          "button"
        );


      remove.type =
        "button";


      remove.textContent =
        "×";


      remove.addEventListener(

        "click",

        () =>
          openDelete(
            item.id
          )

      );


      row.append(

        thumb,

        info,

        edit,

        remove

      );


      $("table").appendChild(
        row
      );

    }

  );

}


/* =========================================
   EDIT ITEM
========================================= */

function startEdit(
  item
) {

  $("editingId").value =
    item.id;


  $("url").value =
    "";


  $("publicId").value =
    "";


  $("deleteToken").value =
    "";


  $("type").value =
    item.type ||
    "image";


  $("title").value =
    item.title ||
    "";


  $("category").value =
    item.category ||
    "";


  $("client").value =
    item.client ||
    "";


  $("description").value =
    item.description ||
    "";


  $("featured").checked =
    item.featured === true;


  $("published").checked =
    item.published === true;


  $("preview").innerHTML =
    "";


  $("preview").classList.add(
    "hidden"
  );


  $("save").textContent =
    "Save Changes";


  $("cancel").classList.remove(
    "hidden"
  );


  showMessage(

    "Editing item. Upload a new file only if you want to replace it."

  );


  location.hash =
    "upload";

}


/* =========================================
   DELETE
========================================= */

function openDelete(
  id
) {

  deleteId =
    id;


  if ($("confirm")) {

    $("confirm").classList.add(
      "active"
    );

  }

}


if ($("cancelDelete")) {

  $("cancelDelete").addEventListener(

    "click",

    () => {

      deleteId =
        null;


      $("confirm").classList.remove(
        "active"
      );

    }

  );

}


if ($("delete")) {

  $("delete").addEventListener(

    "click",

    async () => {

      if (!deleteId)
        return;


      try {

        await deleteDoc(

          doc(
            db,
            "portfolioItems",
            deleteId
          )

        );


        deleteId =
          null;


        $("confirm").classList.remove(
          "active"
        );


        await loadItems();

      }

      catch (error) {

        console.error(
          "DELETE ERROR:",
          error
        );


        alert(
          "Could not delete the item."
        );

      }

    }

  );

}


/* =========================================
   PROFILE
========================================= */

async function loadProfile() {

  try {

    const snapshot =
      await getDoc(

        doc(
          db,
          "siteSettings",
          "profile"
        )

      );


    if (

      snapshot.exists() &&

      snapshot.data()?.url

    ) {

      $("currentProfile").innerHTML =
        "";


      const image =
        document.createElement(
          "img"
        );


      image.src =
        snapshot.data().url;


      image.alt =
        "Current profile photo";


      $("currentProfile").appendChild(
        image
      );

    }

  }

  catch (error) {

    console.error(
      "PROFILE ERROR:",
      error
    );

  }

}


/* =========================================
   PROFILE UPLOAD
========================================= */

if ($("profileBtn")) {

  $("profileBtn").addEventListener(

    "click",

    () => {

      selectAndUploadProfile();

    }

  );

}


function selectAndUploadProfile() {

  const input =
    document.createElement(
      "input"
    );


  input.type =
    "file";


  input.accept =
    "image/jpeg,image/jpg,image/png,image/webp";


  input.style.display =
    "none";


  document.body.appendChild(
    input
  );


  input.addEventListener(

    "change",

    async () => {

      const file =
        input.files?.[0];


      if (!file) {

        input.remove();

        return;

      }


      try {

        const preset =
          cloudinaryConfig.imageUploadPreset;


        if (!preset) {

          throw new Error(
            "Cloudinary image preset is missing."
          );

        }


        const formData =
          new FormData();


        formData.append(
          "file",
          file
        );


        formData.append(
          "upload_preset",
          preset
        );


        const response =
          await fetch(

            `https://api.cloudinary.com/v1_1/${
              cloudinaryConfig.cloudName
            }/image/upload`,

            {

              method:
                "POST",

              body:
                formData

            }

          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(

            result?.error?.message ||
            "Profile image upload failed."

          );

        }


        await setDoc(

          doc(
            db,
            "siteSettings",
            "profile"
          ),

          {

            url:
              result.secure_url,

            publicId:
              result.public_id ||
              "",

            updatedAt:
              Date.now(),

            updatedBy:
              currentUser.uid

          }

        );


        await loadProfile();


        if ($("profileMsg")) {

          $("profileMsg").textContent =
            "Profile photo updated successfully.";

        }

      }

      catch (error) {

        console.error(
          "PROFILE UPLOAD ERROR:",
          error
        );


        if ($("profileMsg")) {

          $("profileMsg").textContent =
            error.message ||
            "Could not upload profile photo.";

        }

      }

      finally {

        input.remove();

      }

    }

  );


  input.click();

}


/* =========================================
   REFRESH
========================================= */

if ($("refresh")) {

  $("refresh").addEventListener(

    "click",

    loadItems

  );

}


/* =========================================
   MESSAGE
========================================= */

function showMessage(
  message
) {

  if ($("msg")) {

    $("msg").textContent =
      message;

  }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
  value
) {

  return String(
    value
  )

  .replace(

    /[&<>"']/g,

    (char) => ({

      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#039;"

    }[char])

  );

}