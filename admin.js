import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
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


/* =========================================================
   FIREBASE
========================================================= */

const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getFirestore(app);

const $ =
  (id) =>
    document.getElementById(id);


/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_CATEGORIES = [

  "Reels",
  "Social Media",
  "PR",
  "Campaigns",
  "Events",
  "Behind The Scenes",
  "Other"

];


const DEFAULT_CLIENTS = [

  "One Clinics",
  "Orange Egypt",
  "Personal",
  "Other"

];


const DEFAULT_EXPERIENCES = [

  {
    company:
      "One Clinics",

    role:
      "Public Relations & Content Creator",

    startDate:
      "Aug 2024",

    endDate:
      "Present",

    description:
      "Built and maintained professional client relationships, handled inquiries and follow-ups, and created social media content for doctors, medical services, treatment sessions and clinic activities.",

    tags: [
      "Public Relations",
      "Content Creation",
      "Reels",
      "Social Media"
    ]

  },

  {
    company:
      "One Clinics",

    role:
      "Receptionist",

    startDate:
      "Jul 2023",

    endDate:
      "Jul 2024",

    description:
      "Welcomed clients and visitors, managed appointments and incoming calls, handled customer inquiries, and coordinated with departments.",

    tags: [
      "Customer Service",
      "Appointments",
      "Coordination"
    ]

  },

  {
    company:
      "One Clinics",

    role:
      "Call Center Representative",

    startDate:
      "Dec 2021",

    endDate:
      "Jun 2023",

    description:
      "Handled customer calls, inquiries, appointment requests and follow-ups, provided accurate information, and supported positive customer relationships.",

    tags: [
      "Communication",
      "Follow-up",
      "Complaint Handling"
    ]

  },

  {
    company:
      "Orange Egypt",

    role:
      "Telesales Representative",

    startDate:
      "Jun 2021",

    endDate:
      "Nov 2021",

    description:
      "Contacted customers, presented products and services, identified needs, handled objections, and worked toward sales targets and customer acquisition.",

    tags: [
      "Sales",
      "Customer Needs",
      "Communication"
    ]

  }

];


const DEFAULT_EDUCATION = [

  {
    institution:
      "Helwan University",

    degree:
      "Radio & Television Broadcasting Section",

    section:
      "FACULTY OF ARTS — MEDIA DEPARTMENT",

    date:
      "May 2024",

    description:
      "Media Department / Radio & Television Broadcasting Section"

  },

  {
    institution:
      "Adham Hossam",

    degree:
      "Marketing & Soft Skills Diploma",

    section:
      "MARKETING & SOFT SKILLS",

    date:
      "2025",

    description:
      "Professional development in marketing and soft skills"

  },

  {
    institution:
      "Languages",

    degree:
      "Arabic — Native / English — Upper-Intermediate",

    section:
      "LANGUAGES",

    date:
      "",

    description:
      ""

  }

];


const DEFAULT_SKILLS = [

  "Public Relations",
  "Content Creation",
  "Social Media Content",
  "Client Communication",
  "Client Relations",
  "Customer Relations",
  "Customer Service",
  "Reels Filming",
  "Short-Form Video Editing",
  "Visual Content Creation",
  "Customer Follow-up",
  "Appointment Management",
  "Complaint Handling",
  "Team Coordination",
  "Marketing Fundamentals",
  "Communication Skills",
  "Teamwork & Collaboration",
  "Problem Solving",
  "Organization & Coordination"

].map(
  (name) => ({

    name,

    level:
      ""

  })
);


const DEFAULT_CONTENT = {

  heroEyebrow:
    "Public Relations & Content Creator",

  heroTitle:
    "Mariam Mohamed",

  heroLead:
    "Building meaningful connections, creating engaging content, and turning ideas into visual stories.",

  aboutHeading:
    "Creative communication with a human touch.",

  aboutIntro:
    "I'm a media graduate with hands-on experience in Public Relations and Content Creation, alongside Customer Relations and Front Office Operations.",

  aboutBody:
    "My work combines client communication, content planning, filming, short-form video editing, social media support, and team coordination.",

  aboutQuote:
    "Creating content is not only about what people see — it is about how the story makes them feel.",

  contactHeading:
    "Have an idea? Let's create something memorable.",

  contactEmail:
    "Mariam.badawy07@gmail.com",

  contactPhone1:
    "+20 110 204 8078",

  contactPhone2:
    "+20 106 762 3833",

  contactLocation:
    "El Shorouk City, Cairo, Egypt"

};


/* =========================================================
   STATE
========================================================= */

let user = null;

let items = [];

let experiences = [];

let education = [];

let skills = [];

let deleteTarget = null;


/* =========================================================
   AUTH GUARD
========================================================= */

onAuthStateChanged(
  auth,
  async (currentUser) => {

    if (!currentUser) {

      location.href =
        "index.html";

      return;

    }


    try {

      const adminSnap =
        await getDoc(

          doc(
            db,
            "admins",
            currentUser.uid
          )

        );


      if (
        !adminSnap.exists() ||
        adminSnap.data()?.active !== true
      ) {

        await signOut(auth);

        location.href =
          "index.html";

        return;

      }


      user =
        currentUser;


      $("adminEmail").textContent =
        currentUser.email ||
        "Admin";


      /*
        Seed first.
        Then load.
        This avoids a race condition.
      */

      await seedDefaultsIfEmpty();

      await loadTaxonomy();

      await loadEverything();

      await loadProfile();

      await loadContent();


    } catch (error) {

      console.error(
        "ADMIN INIT ERROR:",
        error
      );


      alert(
        error.message ||
        "Could not load dashboard."
      );

    }

  }
);


/* =========================================================
   LOGOUT
========================================================= */

$("logout").addEventListener(
  "click",
  async () => {

    await signOut(auth);

    location.href =
      "index.html";

  }
);


/* =========================================================
   SEED DEFAULT DATA
========================================================= */

async function seedDefaultsIfEmpty() {

  await seedCollection(
    "experiences",
    DEFAULT_EXPERIENCES
  );


  await seedCollection(
    "education",
    DEFAULT_EDUCATION
  );


  await seedCollection(
    "skills",
    DEFAULT_SKILLS
  );


  const contentSnap =
    await getDoc(

      doc(
        db,
        "siteSettings",
        "content"
      )

    );


  if (!contentSnap.exists()) {

    await setDoc(

      doc(
        db,
        "siteSettings",
        "content"
      ),

      {

        ...DEFAULT_CONTENT,

        createdAt:
          Date.now(),

        updatedBy:
          user.uid

      }

    );

  }

}


async function seedCollection(
  collectionName,
  data
) {

  const snap =
    await getDocs(
      collection(
        db,
        collectionName
      )
    );


  if (!snap.empty)
    return;


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    await addDoc(

      collection(
        db,
        collectionName
      ),

      {

        ...data[i],

        order:
          i + 1,

        createdAt:
          Date.now(),

        createdBy:
          user.uid

      }

    );

  }

}


/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadEverything() {

  await Promise.all([

    loadItems(),

    loadExperience(),

    loadEducation(),

    loadSkills()

  ]);


  updateStats();

}


function updateStats() {

  $("total").textContent =
    items.length;


  $("pub").textContent =
    items.filter(
      (item) =>
        item.published === true
    ).length;


  $("feat").textContent =
    items.filter(
      (item) =>
        item.featured === true
    ).length;


  $("vid").textContent =
    items.filter(
      (item) =>
        item.type === "video"
    ).length;


  $("expCount").textContent =
    experiences.length;


  $("eduCount").textContent =
    education.length;

}


/* =========================================================
   WORK
========================================================= */

async function loadItems() {

  const snap =
    await getDocs(

      collection(
        db,
        "portfolioItems"
      )

    );


  items = snap.docs

    .map(
      (d) => ({

        id:
          d.id,

        ...d.data()

      })
    )

    .sort(

      (a, b) =>

        (Number(a.order) || 0) -
        (Number(b.order) || 0)

    );


  renderItems();

}


function renderItems() {

  const table =
    $("table");


  table.innerHTML =
    "";


  if (!items.length) {

    table.innerHTML = `

      <div class="row">

        <div>
          No work yet.
        </div>

      </div>

    `;

    return;

  }


  items.forEach(
    (item) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "row";


      const media =

        item.type === "video"

          ? document.createElement(
              "video"
            )

          : document.createElement(
              "img"
            );


      media.src =
        item.url;


      media.alt =
        item.title ||
        "Portfolio work";


      media.muted =
        true;


      media.playsInline =
        true;


      media.preload =
        "metadata";


      const info =
        document.createElement(
          "div"
        );


      info.innerHTML = `

        <strong>

          ${escapeHTML(
            item.title ||
            "Untitled"
          )}

        </strong>


        <small>

          ${escapeHTML(

            [
              item.client,
              item.category

            ]

              .filter(Boolean)

              .join(" • ")

          )}

        </small>


        <span class="status ${
          item.published === true
            ? "status-good"
            : "status-bad"
        }">

          ${
            item.published === true
              ? "Published"
              : "Hidden"
          }

        </span>

      `;


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
          editItem(item.id)
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
          askDelete(
            "work",
            item.id
          )
      );


      row.append(

        media,

        info,

        edit,

        remove

      );


      table.appendChild(
        row
      );

    }
  );

}


/* =========================================================
   CLIENTS + CATEGORIES
========================================================= */

async function loadTaxonomy() {

  const categorySnap =
    await getDocs(
      collection(
        db,
        "categories"
      )
    );


  const clientSnap =
    await getDocs(
      collection(
        db,
        "clients"
      )
    );


  const categories =
    categorySnap.docs

      .map(
        (d) =>
          d.data()?.name
      )

      .filter(Boolean);


  const clients =
    clientSnap.docs

      .map(
        (d) =>
          d.data()?.name
      )

      .filter(Boolean);


  populateSelect(

    $("category"),

    mergeUnique(
      DEFAULT_CATEGORIES,
      categories
    ),

    "Choose a section"

  );


  populateSelect(

    $("client"),

    mergeUnique(
      DEFAULT_CLIENTS,
      clients
    ),

    "Choose a client / brand"

  );

}


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
          (x) =>
            String(x).trim()
        )

        .filter(Boolean)

    )

  ].sort(
    (a, b) =>
      a.localeCompare(b)
  );

}


function populateSelect(
  select,
  values,
  placeholder
) {

  select.innerHTML =
    "";


  const empty =
    document.createElement(
      "option"
    );


  empty.value =
    "";


  empty.textContent =
    placeholder;


  select.appendChild(
    empty
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


/* =========================================================
   ADD CLIENT / SECTION
========================================================= */

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

    const snap =
      await getDocs(
        collection(
          db,
          type
        )
      );


    const exists =
      snap.docs.some(
        (d) =>

          String(
            d.data()?.name || ""
          )

            .trim()
            .toLowerCase() ===
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
            user.uid

        }

      );

    }


    await loadTaxonomy();


    if (isCategory) {

      $("category").value =
        clean;

    } else {

      $("client").value =
        clean;

    }


  } catch (error) {

    alert(
      error.message ||
      `Could not add ${label}.`
    );

  }

}


$("addCategoryBtn").addEventListener(
  "click",
  () =>
    addTaxonomy(
      "categories"
    )
);


$("addClientBtn").addEventListener(
  "click",
  () =>
    addTaxonomy(
      "clients"
    )
);


/* =========================================================
   FILE PICKER
========================================================= */

function chooseFile(
  type
) {

  return new Promise(
    (resolve) => {

      const input =
        document.createElement(
          "input"
        );


      input.type =
        "file";


      input.accept =

        type === "video"

          ? "video/mp4,video/quicktime,video/webm,video/x-m4v"

          : "image/jpeg,image/png,image/webp";


      input.style.display =
        "none";


      document.body.appendChild(
        input
      );


      input.addEventListener(
        "change",
        () => {

          const file =
            input.files?.[0] ||
            null;


          input.remove();


          resolve(file);

        },
        {
          once:
            true
        }
      );


      input.click();

    }
  );

}


/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */

async function uploadDirect(

  file,

  type,

  onProgress

) {

  if (!file) {

    throw new Error(
      "Please choose a file first."
    );

  }


  const preset =

    type === "video"

      ? cloudinaryConfig.videoUploadPreset

      : cloudinaryConfig.imageUploadPreset;


  if (

    !cloudinaryConfig.cloudName ||

    !preset

  ) {

    throw new Error(
      "Cloudinary configuration is incomplete."
    );

  }


  const allowedImageTypes = [

    "image/jpeg",

    "image/png",

    "image/webp"

  ];


  const allowedVideoTypes = [

    "video/mp4",

    "video/quicktime",

    "video/webm",

    "video/x-m4v"

  ];


  if (

    type === "image" &&

    !allowedImageTypes.includes(
      file.type
    )

  ) {

    throw new Error(
      "Only JPG, PNG and WebP images are allowed."
    );

  }


  if (

    type === "video" &&

    !allowedVideoTypes.includes(
      file.type
    )

  ) {

    throw new Error(
      "Only MP4, MOV, WebM and M4V videos are allowed."
    );

  }


  if (

    type === "image" &&

    file.size >
      20 * 1024 * 1024

  ) {

    throw new Error(
      "Image must be 20 MB or smaller."
    );

  }


  if (

    type === "video" &&

    file.size >
      95 * 1024 * 1024

  ) {

    throw new Error(
      "Video must be 95 MB or smaller."
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


  formData.append(
    "tags",
    "mariam-portfolio"
  );


  const endpoint =

    `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      cloudinaryConfig.cloudName
    )}/${type}/upload`;


  const result =
    await new Promise(

      (resolve, reject) => {

        const xhr =
          new XMLHttpRequest();


        xhr.open(
          "POST",
          endpoint
        );


        xhr.responseType =
          "json";


        xhr.upload.addEventListener(
          "progress",
          (event) => {

            if (
              event.lengthComputable &&
              onProgress
            ) {

              onProgress(

                Math.round(

                  event.loaded /
                  event.total *
                  100

                )

              );

            }

          }
        );


        xhr.onload =
          () => {

            if (

              xhr.status >= 200 &&

              xhr.status < 300

            ) {

              resolve(
                xhr.response
              );

            } else {

              reject(

                new Error(

                  xhr.response
                    ?.error
                    ?.message ||

                  `Upload failed (${xhr.status}).`

                )

              );

            }

          };


        xhr.onerror =
          () => {

            reject(

              new Error(
                "Network error while uploading."
              )

            );

          };


        xhr.ontimeout =
          () => {

            reject(

              new Error(
                "Upload timed out."
              )

            );

          };


        xhr.timeout =
          10 * 60 * 1000;


        xhr.send(
          formData
        );

      }

    );


  if (
    !result?.secure_url
  ) {

    throw new Error(
      "Cloudinary returned no secure URL."
    );

  }


  return result;

}


/* =========================================================
   PREVIEW
========================================================= */

function showPreview(
  info
) {

  $("preview")
    .replaceChildren();


  $("preview")
    .classList
    .remove("hidden");


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


    video.muted =
      true;


    video.playsInline =
      true;


    video.style.width =
      "100%";


    $("preview")
      .appendChild(video);

  } else {

    const image =
      document.createElement(
        "img"
      );


    image.src =
      info.secure_url;


    image.alt =
      "Preview";


    $("preview")
      .appendChild(image);

  }

}


function setUpload(
  info
) {

  $("url").value =
    info.secure_url || "";


  $("publicId").value =
    info.public_id || "";


  $("type").value =
    info.resource_type ||
    "image";


  $("deleteToken").value =
    info.delete_token ||
    "";


  showPreview(
    info
  );


  $("msg").textContent =
    "Upload completed successfully. Add the details and save.";

}


/* =========================================================
   UPLOAD BUTTONS
========================================================= */

$("imageBtn").addEventListener(
  "click",
  () =>
    handleUpload(
      "image"
    )
);


$("videoBtn").addEventListener(
  "click",
  () =>
    handleUpload(
      "video"
    )
);


async function handleUpload(
  type
) {

  try {

    const file =
      await chooseFile(type);


    if (!file)
      return;


    $("msg").textContent =
      "Uploading 0%...";


    const info =
      await uploadDirect(

        file,

        type,

        (percent) => {

          $("msg").textContent =
            `Uploading ${percent}%...`;

        }

      );


    setUpload(
      info
    );


  } catch (error) {

    console.error(
      "UPLOAD ERROR:",
      error
    );


    $("msg").textContent =
      error.message ||
      "Upload failed.";

  }

}


/* =========================================================
   WORK SAVE
========================================================= */

$("workForm").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const editingId =
      $("editingId")
        .value
        .trim();


    const url =
      $("url")
        .value
        .trim();


    if (
      !editingId &&
      !url
    ) {

      $("msg").textContent =
        "Upload an image or video first.";

      return;

    }


    const payload = {

      title:
        $("title")
          .value
          .trim(),

      category:
        $("category")
          .value
          .trim(),

      client:
        $("client")
          .value
          .trim(),

      description:
        $("description")
          .value
          .trim(),

      featured:
        $("featured")
          .checked,

      published:
        $("published")
          .checked,

      updatedAt:
        Date.now()

    };


    if (

      !payload.title ||

      !payload.category ||

      !payload.client

    ) {

      $("msg").textContent =
        "Title, section and client are required.";

      return;

    }


    try {

      $("save").disabled =
        true;


      $("msg").textContent =
        "Saving...";


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

            ...payload,

            url,

            publicId:
              $("publicId")
                .value
                .trim(),

            type:
              $("type")
                .value ||
              "image",

            deleteToken:
              $("deleteToken")
                .value
                .trim(),

            order:
              nextOrder,

            createdAt:
              Date.now(),

            createdBy:
              user.uid

          }

        );

      } else {

        const updateData = {
          ...payload
        };


        if (url) {

          updateData.url =
            url;

          updateData.publicId =
            $("publicId")
              .value
              .trim();

          updateData.type =
            $("type")
              .value ||
            "image";

          updateData.deleteToken =
            $("deleteToken")
              .value
              .trim();

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


      resetWorkForm();


      await loadEverything();


      $("msg").textContent =
        "Saved successfully.";


    } catch (error) {

      console.error(
        "WORK SAVE ERROR:",
        error
      );


      $("msg").textContent =
        error.message ||
        "Could not save work.";

    } finally {

      $("save").disabled =
        false;

    }

  }
);


/* =========================================================
   RESET WORK FORM
========================================================= */

function resetWorkForm() {

  $("workForm").reset();


  $("published").checked =
    true;


  [
    "url",
    "publicId",
    "type",
    "deleteToken",
    "editingId"
  ].forEach(
    (id) => {

      $(id).value =
        "";

    }
  );


  $("preview")
    .classList
    .add("hidden");


  $("preview")
    .replaceChildren();


  $("save").textContent =
    "Save & Publish";


  $("cancel")
    .classList
    .add("hidden");


  loadTaxonomy();

}


$("cancel").addEventListener(
  "click",
  resetWorkForm
);


/* =========================================================
   EDIT WORK
========================================================= */

function editItem(
  id
) {

  const item =
    items.find(
      (entry) =>
        entry.id === id
    );


  if (!item)
    return;


  $("editingId").value =
    id;


  $("url").value =
    "";


  $("publicId").value =
    "";


  $("type").value =
    "";


  $("deleteToken").value =
    "";


  $("title").value =
    item.title || "";


  ensureSelectValue(
    $("category"),
    item.category
  );


  ensureSelectValue(
    $("client"),
    item.client
  );


  $("description").value =
    item.description || "";


  $("featured").checked =
    item.featured === true;


  $("published").checked =
    item.published === true;


  $("preview")
    .classList
    .remove("hidden");


  $("preview")
    .replaceChildren();


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


    video.controls =
      true;


    video.style.width =
      "100%";


    $("preview")
      .appendChild(video);

  } else {

    const image =
      document.createElement(
        "img"
      );


    image.src =
      item.url;


    image.alt =
      "Preview";


    $("preview")
      .appendChild(image);

  }


  $("save").textContent =
    "Save Changes";


  $("cancel")
    .classList
    .remove("hidden");


  location.hash =
    "upload";

}


/* =========================================================
   EXPERIENCE
========================================================= */

async function loadExperience() {

  const snap =
    await getDocs(

      collection(
        db,
        "experiences"
      )

    );


  experiences =
    snap.docs

      .map(
        (d) => ({

          id:
            d.id,

          ...d.data()

        })
      )

      .sort(

        (a, b) =>

          (Number(a.order) || 0) -
          (Number(b.order) || 0)

      );


  renderExperience();

}


function renderExperience() {

  const box =
    $("experienceList");


  box.innerHTML =
    "";


  if (!experiences.length) {

    box.innerHTML = `

      <div class="manage-card">

        <div class="manage-main">

          <p>
            No experience yet.
          </p>

        </div>

      </div>

    `;

    return;

  }


  experiences.forEach(
    (experience) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "manage-card";


      card.innerHTML = `

        <div class="manage-main">

          <h3>

            ${escapeHTML(
              experience.company ||
              ""
            )}

          </h3>


          <p>

            <strong>

              ${escapeHTML(
                experience.role ||
                ""
              )}

            </strong>

            <br>

            ${escapeHTML(
              experience.startDate ||
              ""
            )}

            —

            ${escapeHTML(
              experience.endDate ||
              "Present"
            )}

          </p>


          ${
            experience.description

              ? `

                <p>

                  ${escapeHTML(
                    experience.description
                  )}

                </p>

              `

              : ""
          }


          <div class="tag-row">

            ${
              Array.isArray(
                experience.tags
              )

                ? experience.tags
                    .map(
                      (tag) => `

                        <span class="tag">

                          ${escapeHTML(
                            tag
                          )}

                        </span>

                      `
                    )
                    .join("")

                : ""
            }

          </div>

        </div>


        <div class="manage-actions">

          <button
            type="button"
            data-edit
          >
            Edit
          </button>


          <button
            type="button"
            data-delete
          >
            Delete
          </button>

        </div>

      `;


      card
        .querySelector(
          "[data-edit]"
        )
        .addEventListener(
          "click",
          () =>
            editExperience(
              experience.id
            )
        );


      card
        .querySelector(
          "[data-delete]"
        )
        .addEventListener(
          "click",
          () =>
            askDelete(
              "experience",
              experience.id
            )
        );


      box.appendChild(
        card
      );

    }
  );

}


$("addExperience").addEventListener(
  "click",
  () =>
    openExperienceForm()
);


$("cancelExperience").addEventListener(
  "click",
  closeExperienceForm
);


function openExperienceForm(
  data = null
) {

  $("experienceForm")
    .classList
    .remove("hidden");


  $("experienceId").value =
    data?.id || "";


  $("experienceCompany").value =
    data?.company || "";


  $("experienceRole").value =
    data?.role || "";


  $("experienceStart").value =
    data?.startDate || "";


  $("experienceEnd").value =
    data?.endDate || "Present";


  $("experienceDescription").value =
    data?.description || "";


  $("experienceTags").value =
    Array.isArray(
      data?.tags
    )
      ? data.tags.join(", ")
      : "";


  window.scrollTo({

    top:
      $("experience")
        .offsetTop -

      20,

    behavior:
      "smooth"

  });

}


function closeExperienceForm() {

  $("experienceForm")
    .classList
    .add("hidden");


  $("experienceForm")
    .reset();


  $("experienceId").value =
    "";


  $("experienceEnd").value =
    "Present";

}


function editExperience(
  id
) {

  openExperienceForm(

    experiences.find(
      (entry) =>
        entry.id === id
    )

  );

}


$("experienceForm").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const id =
      $("experienceId")
        .value
        .trim();


    const payload = {

      company:
        $("experienceCompany")
          .value
          .trim(),

      role:
        $("experienceRole")
          .value
          .trim(),

      startDate:
        $("experienceStart")
          .value
          .trim(),

      endDate:
        $("experienceEnd")
          .value
          .trim() ||
        "Present",

      description:
        $("experienceDescription")
          .value
          .trim(),

      tags:
        $("experienceTags")
          .value
          .split(",")

          .map(
            (x) =>
              x.trim()
          )

          .filter(Boolean),

      updatedAt:
        Date.now()

    };


    if (

      !payload.company ||

      !payload.role ||

      !payload.startDate

    ) {

      $("experienceMsg").textContent =
        "Company, role and start date are required.";

      return;

    }


    try {

      $("saveExperience")
        .disabled =
        true;


      if (id) {

        await updateDoc(

          doc(
            db,
            "experiences",
            id
          ),

          payload

        );

      } else {

        const order =

          experiences.length

            ? Math.max(

                ...experiences.map(
                  (x) =>
                    Number(
                      x.order
                    ) || 0
                )

              ) + 1

            : 1;


        await addDoc(

          collection(
            db,
            "experiences"
          ),

          {

            ...payload,

            order,

            createdAt:
              Date.now(),

            createdBy:
              user.uid

          }

        );

      }


      closeExperienceForm();


      await loadEverything();


    } catch (error) {

      $("experienceMsg").textContent =
        error.message ||
        "Could not save experience.";

    } finally {

      $("saveExperience")
        .disabled =
        false;

    }

  }
);


/* =========================================================
   EDUCATION
========================================================= */

async function loadEducation() {

  const snap =
    await getDocs(

      collection(
        db,
        "education"
      )

    );


  education =
    snap.docs

      .map(
        (d) => ({

          id:
            d.id,

          ...d.data()

        })
      )

      .sort(

        (a, b) =>

          (Number(a.order) || 0) -
          (Number(b.order) || 0)

      );


  renderEducation();

}


function renderEducation() {

  const box =
    $("educationList");


  box.innerHTML =
    "";


  if (!education.length) {

    box.innerHTML = `

      <div class="manage-card">

        <div class="manage-main">

          <p>
            No education yet.
          </p>

        </div>

      </div>

    `;

    return;

  }


  education.forEach(
    (entry) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "manage-card";


      card.innerHTML = `

        <div class="manage-main">

          <h3>

            ${escapeHTML(
              entry.institution ||
              ""
            )}

          </h3>


          <p>

            <strong>

              ${escapeHTML(
                entry.degree ||
                ""
              )}

            </strong>


            ${
              entry.date
                ? `

                  <br>

                  ${escapeHTML(
                    entry.date
                  )}

                `
                : ""
            }

          </p>


          ${
            entry.section

              ? `

                <small>

                  ${escapeHTML(
                    entry.section
                  )}

                </small>

              `

              : ""
          }


          ${
            entry.description

              ? `

                <p>

                  ${escapeHTML(
                    entry.description
                  )}

                </p>

              `

              : ""
          }

        </div>


        <div class="manage-actions">

          <button
            type="button"
            data-edit
          >
            Edit
          </button>


          <button
            type="button"
            data-delete
          >
            Delete
          </button>

        </div>

      `;


      card
        .querySelector(
          "[data-edit]"
        )
        .addEventListener(
          "click",
          () =>
            editEducation(
              entry.id
            )
        );


      card
        .querySelector(
          "[data-delete]"
        )
        .addEventListener(
          "click",
          () =>
            askDelete(
              "education",
              entry.id
            )
        );


      box.appendChild(
        card
      );

    }
  );

}


$("addEducation").addEventListener(
  "click",
  () =>
    openEducationForm()
);


$("cancelEducation").addEventListener(
  "click",
  closeEducationForm
);


function openEducationForm(
  data = null
) {

  $("educationForm")
    .classList
    .remove("hidden");


  $("educationId").value =
    data?.id || "";


  $("educationInstitution").value =
    data?.institution || "";


  $("educationDegree").value =
    data?.degree || "";


  $("educationSection").value =
    data?.section || "";


  $("educationDate").value =
    data?.date || "";


  $("educationDescription").value =
    data?.description || "";


  window.scrollTo({

    top:
      $("education")
        .offsetTop -

      20,

    behavior:
      "smooth"

  });

}


function closeEducationForm() {

  $("educationForm")
    .classList
    .add("hidden");


  $("educationForm")
    .reset();


  $("educationId").value =
    "";

}


function editEducation(
  id
) {

  openEducationForm(

    education.find(
      (entry) =>
        entry.id === id
    )

  );

}


$("educationForm").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const id =
      $("educationId")
        .value
        .trim();


    const payload = {

      institution:
        $("educationInstitution")
          .value
          .trim(),

      degree:
        $("educationDegree")
          .value
          .trim(),

      section:
        $("educationSection")
          .value
          .trim(),

      date:
        $("educationDate")
          .value
          .trim(),

      description:
        $("educationDescription")
          .value
          .trim(),

      updatedAt:
        Date.now()

    };


    if (

      !payload.institution ||

      !payload.degree

    ) {

      $("educationMsg").textContent =
        "Institution and degree are required.";

      return;

    }


    try {

      $("saveEducation")
        .disabled =
        true;


      if (id) {

        await updateDoc(

          doc(
            db,
            "education",
            id
          ),

          payload

        );

      } else {

        const order =

          education.length

            ? Math.max(

                ...education.map(
                  (x) =>
                    Number(
                      x.order
                    ) || 0
                )

              ) + 1

            : 1;


        await addDoc(

          collection(
            db,
            "education"
          ),

          {

            ...payload,

            order,

            createdAt:
              Date.now(),

            createdBy:
              user.uid

          }

        );

      }


      closeEducationForm();


      await loadEverything();


    } catch (error) {

      $("educationMsg").textContent =
        error.message ||
        "Could not save education.";

    } finally {

      $("saveEducation")
        .disabled =
        false;

    }

  }
);


/* =========================================================
   SKILLS
========================================================= */

async function loadSkills() {

  const snap =
    await getDocs(

      collection(
        db,
        "skills"
      )

    );


  skills =
    snap.docs

      .map(
        (d) => ({

          id:
            d.id,

          ...d.data()

        })
      )

      .sort(

        (a, b) =>

          (Number(a.order) || 0) -
          (Number(b.order) || 0)

      );


  renderSkills();

}


function renderSkills() {

  const box =
    $("skillList");


  box.innerHTML =
    "";


  if (!skills.length) {

    box.innerHTML =
      "<span>No skills yet.</span>";

    return;

  }


  skills.forEach(
    (skill) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "skill-admin-item";


      const text =
        document.createElement(
          "span"
        );


      text.textContent =

        skill.level

          ? `${skill.name} — ${skill.level}`

          : skill.name || "";


      const edit =
        document.createElement(
          "button"
        );


      edit.type =
        "button";


      edit.textContent =
        "✎";


      edit.addEventListener(
        "click",
        () =>
          editSkill(
            skill.id
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
          askDelete(
            "skill",
            skill.id
          )
      );


      item.append(
        text,
        edit,
        remove
      );


      box.appendChild(
        item
      );

    }
  );

}


$("addSkill").addEventListener(
  "click",
  () =>
    openSkillForm()
);


$("cancelSkill").addEventListener(
  "click",
  closeSkillForm
);


function openSkillForm(
  data = null
) {

  $("skillForm")
    .classList
    .remove("hidden");


  $("skillId").value =
    data?.id || "";


  $("skillName").value =
    data?.name || "";


  $("skillLevel").value =
    data?.level || "";


  window.scrollTo({

    top:
      $("skills")
        .offsetTop -

      20,

    behavior:
      "smooth"

  });

}


function closeSkillForm() {

  $("skillForm")
    .classList
    .add("hidden");


  $("skillForm")
    .reset();


  $("skillId").value =
    "";

}


function editSkill(
  id
) {

  openSkillForm(

    skills.find(
      (skill) =>
        skill.id === id
    )

  );

}


$("skillForm").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const id =
      $("skillId")
        .value
        .trim();


    const payload = {

      name:
        $("skillName")
          .value
          .trim(),

      level:
        $("skillLevel")
          .value
          .trim(),

      updatedAt:
        Date.now()

    };


    if (!payload.name) {

      $("skillMsg").textContent =
        "Skill name is required.";

      return;

    }


    try {

      $("saveSkill")
        .disabled =
        true;


      if (id) {

        await updateDoc(

          doc(
            db,
            "skills",
            id
          ),

          payload

        );

      } else {

        const order =

          skills.length

            ? Math.max(

                ...skills.map(
                  (x) =>
                    Number(
                      x.order
                    ) || 0
                )

              ) + 1

            : 1;


        await addDoc(

          collection(
            db,
            "skills"
          ),

          {

            ...payload,

            order,

            createdAt:
              Date.now(),

            createdBy:
              user.uid

          }

        );

      }


      closeSkillForm();


      await loadEverything();


    } catch (error) {

      $("skillMsg").textContent =
        error.message ||
        "Could not save skill.";

    } finally {

      $("saveSkill")
        .disabled =
        false;

    }

  }
);


/* =========================================================
   PROFILE
========================================================= */

async function loadProfile() {

  try {

    const snap =
      await getDoc(

        doc(
          db,
          "siteSettings",
          "profile"
        )

      );


    if (
      !snap.exists()
    ) {

      $("currentProfile").textContent =
        "No profile photo uploaded yet.";

      return;

    }


    const data =
      snap.data();


    if (!data?.url) {

      $("currentProfile").textContent =
        "No profile photo uploaded yet.";

      return;

    }


    const image =
      document.createElement(
        "img"
      );


    image.src =
      data.url;


    image.alt =
      "Current profile photo";


    $("currentProfile")
      .replaceChildren(
        image
      );


  } catch (error) {

    console.error(
      "PROFILE ERROR:",
      error
    );

  }

}


$("profileBtn").addEventListener(
  "click",
  async () => {

    try {

      $("profileMsg").textContent =
        "Choose a profile photo...";


      const file =
        await chooseFile(
          "image"
        );


      if (!file)
        return;


      const info =
        await uploadDirect(

          file,

          "image",

          (percent) => {

            $("profileMsg").textContent =
              `Uploading profile photo ${percent}%...`;

          }

        );


      await setDoc(

        doc(
          db,
          "siteSettings",
          "profile"
        ),

        {

          url:
            info.secure_url,

          publicId:
            info.public_id ||
            "",

          updatedAt:
            Date.now(),

          updatedBy:
            user.uid

        }

      );


      await loadProfile();


      $("profileMsg").textContent =
        "Profile photo updated.";

    } catch (error) {

      console.error(
        "PROFILE UPLOAD ERROR:",
        error
      );


      $("profileMsg").textContent =
        error.message ||
        "Could not update profile photo.";

    }

  }
);


/* =========================================================
   SITE CONTENT
========================================================= */

async function loadContent() {

  try {

    const snap =
      await getDoc(

        doc(
          db,
          "siteSettings",
          "content"
        )

      );


    const data =
      snap.exists()
        ? {
            ...DEFAULT_CONTENT,
            ...snap.data()
          }
        : DEFAULT_CONTENT;


    $("heroEyebrow").value =
      data.heroEyebrow ||
      "";


    $("heroTitle").value =
      data.heroTitle ||
      "";


    $("heroLead").value =
      data.heroLead ||
      "";


    $("aboutHeading").value =
      data.aboutHeading ||
      "";


    $("aboutIntro").value =
      data.aboutIntro ||
      "";


    $("aboutBody").value =
      data.aboutBody ||
      "";


    $("aboutQuote").value =
      data.aboutQuote ||
      "";


    $("contactHeading").value =
      data.contactHeading ||
      "";


    $("contactEmail").value =
      data.contactEmail ||
      "";


    $("contactPhone1").value =
      data.contactPhone1 ||
      "";


    $("contactPhone2").value =
      data.contactPhone2 ||
      "";


    $("contactLocation").value =
      data.contactLocation ||
      "";


  } catch (error) {

    console.error(
      "CONTENT LOAD ERROR:",
      error
    );

  }

}


$("contentForm").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const payload = {

      heroEyebrow:
        $("heroEyebrow")
          .value
          .trim(),

      heroTitle:
        $("heroTitle")
          .value
          .trim(),

      heroLead:
        $("heroLead")
          .value
          .trim(),

      aboutHeading:
        $("aboutHeading")
          .value
          .trim(),

      aboutIntro:
        $("aboutIntro")
          .value
          .trim(),

      aboutBody:
        $("aboutBody")
          .value
          .trim(),

      aboutQuote:
        $("aboutQuote")
          .value
          .trim(),

      contactHeading:
        $("contactHeading")
          .value
          .trim(),

      contactEmail:
        $("contactEmail")
          .value
          .trim(),

      contactPhone1:
        $("contactPhone1")
          .value
          .trim(),

      contactPhone2:
        $("contactPhone2")
          .value
          .trim(),

      contactLocation:
        $("contactLocation")
          .value
          .trim(),

      updatedAt:
        Date.now(),

      updatedBy:
        user.uid

    };


    try {

      $("saveContent")
        .disabled =
        true;


      await setDoc(

        doc(
          db,
          "siteSettings",
          "content"
        ),

        payload,

        {
          merge:
            true
        }

      );


      $("contentMsg").textContent =
        "Site content saved successfully.";


    } catch (error) {

      $("contentMsg").textContent =
        error.message ||
        "Could not save site content.";

    } finally {

      $("saveContent")
        .disabled =
        false;

    }

  }
);


/* =========================================================
   DELETE
========================================================= */

function askDelete(
  type,
  id
) {

  deleteTarget = {
    type,
    id
  };


  const names = {

    work:
      "this work",

    experience:
      "this experience",

    education:
      "this education",

    skill:
      "this skill"

  };


  $("confirmText").textContent =

    `Are you sure you want to remove ${names[type]}?`;


  $("confirm")
    .classList
    .add("active");

}


$("cancelDelete").addEventListener(
  "click",
  () => {

    deleteTarget =
      null;


    $("confirm")
      .classList
      .remove("active");

  }
);


$("delete").addEventListener(
  "click",
  async () => {

    if (!deleteTarget)
      return;


    try {

      $("delete").disabled =
        true;


      const collectionName = {

        work:
          "portfolioItems",

        experience:
          "experiences",

        education:
          "education",

        skill:
          "skills"

      }[
        deleteTarget.type
      ];


      await deleteDoc(

        doc(

          db,

          collectionName,

          deleteTarget.id

        )

      );


      deleteTarget =
        null;


      $("confirm")
        .classList
        .remove("active");


      await loadEverything();


    } catch (error) {

      alert(
        error.message ||
        "Could not remove item."
      );


    } finally {

      $("delete").disabled =
        false;

    }

  }
);


/* =========================================================
   REFRESH
========================================================= */

$("refresh").addEventListener(
  "click",
  async () => {

    await loadEverything();

    await loadTaxonomy();

    await loadProfile();

    await loadContent();

  }
);


/* =========================================================
   HELPERS
========================================================= */

function ensureSelectValue(
  select,
  value
) {

  if (!value)
    return;


  const found =
    [...select.options]
      .some(
        (option) =>
          option.value ===
          value
      );


  if (!found) {

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


  select.value =
    value;

}


function escapeHTML(
  value
) {

  return String(
    value ?? ""
  ).replace(

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


/* =========================================================
   CLICKABLE STATS
========================================================= */

document
  .querySelectorAll(
    "[data-jump]"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const target =
            document.querySelector(
              button.dataset.jump
            );


          if (!target)
            return;


          target.scrollIntoView({

            behavior:
              "smooth",

            block:
              "start"

          });

        }
      );

    }
  );
