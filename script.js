import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  firebaseConfig
} from "./firebase-config.js";


/* =========================================================
   FIREBASE
========================================================= */

const app =
  initializeApp(
    firebaseConfig
  );


const auth =
  getAuth(
    app
  );


const db =
  getFirestore(
    app
  );


const $ =
  (id) =>
    document.getElementById(
      id
    );


/* =========================================================
   DEFAULT CONTENT
========================================================= */

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

let allItems = [];

let clientFilter =
  "all";

let categoryFilter =
  "all";


/* =========================================================
   YEAR
========================================================= */

$("year").textContent =
  new Date()
    .getFullYear();


/* =========================================================
   MOBILE MENU
========================================================= */

$("menuToggle").addEventListener(
  "click",
  () => {

    $("navLinks")
      .classList
      .toggle(
        "open"
      );

  }
);


document
  .querySelectorAll(
    "#navLinks a"
  )
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        () => {

          $("navLinks")
            .classList
            .remove(
              "open"
            );

        }
      );

    }
  );


/* =========================================================
   ADMIN MODAL
========================================================= */

$("adminEntry").addEventListener(
  "click",
  () => {

    $("authModal")
      .classList
      .add(
        "active"
      );

  }
);


$("authClose").addEventListener(
  "click",
  () => {

    $("authModal")
      .classList
      .remove(
        "active"
      );

  }
);


$("authModal").addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      $("authModal")
    ) {

      $("authModal")
        .classList
        .remove(
          "active"
        );

    }

  }
);


/* =========================================================
   ADMIN LOGIN
========================================================= */

$("loginForm").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    $("loginMessage").textContent =
      "Signing in...";


    try {

      const result =
        await signInWithEmailAndPassword(

          auth,

          $("loginEmail")
            .value
            .trim(),

          $("loginPassword")
            .value

        );


      const adminSnap =
        await getDoc(

          doc(
            db,
            "admins",
            result.user.uid
          )

        );


      if (
        !adminSnap.exists() ||
        adminSnap.data()?.active !== true
      ) {

        await signOut(
          auth
        );


        throw new Error(
          "Unauthorized"
        );

      }


      location.href =
        "admin.html";


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      $("loginMessage")
        .textContent =
        "Login failed. Check your email and password.";

    }

  }
);


/* =========================================================
   STYLED HEADING
========================================================= */

function setStyledText(
  element,
  value
) {

  if (!element)
    return;


  const text =
    String(
      value || ""
    ).trim();


  if (!text) {

    element.textContent =
      "";

    return;

  }


  const words =
    text.split(
      /\s+/
    );


  if (
    words.length < 2
  ) {

    element.textContent =
      text;

    return;

  }


  const last =
    words.pop();


  element.innerHTML =

    `${escapeHTML(
      words.join(" ")
    )}

    <em>

      ${escapeHTML(
        last
      )}

    </em>`;

}


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
    )
      return;


    const data =
      snap.data();


    if (
      !data?.url
    )
      return;


    const image =
      document.createElement(
        "img"
      );


    image.src =
      data.url;


    image.alt =
      "Mariam Mohamed";


    image.className =
      "portrait-photo";


    $("profileBox")
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


    const content =

      snap.exists()

        ? {
            ...DEFAULT_CONTENT,
            ...snap.data()
          }

        : DEFAULT_CONTENT;


    $("heroEyebrow")
      .textContent =
      content.heroEyebrow;


    setStyledText(
      $("heroTitle"),
      content.heroTitle
    );


    $("heroLead")
      .textContent =
      content.heroLead;


    setStyledText(
      $("aboutHeading"),
      content.aboutHeading
    );


    $("aboutIntro")
      .textContent =
      content.aboutIntro;


    $("aboutBody")
      .textContent =
      content.aboutBody;


    $("aboutQuote")
      .textContent =
      content.aboutQuote;


    setStyledText(
      $("contactHeading"),
      content.contactHeading
    );


    /* =====================================================
       EMAIL
    ===================================================== */

    const email =
      content.contactEmail ||
      DEFAULT_CONTENT.contactEmail;


    $("contactEmail")
      .textContent =
      `${email} ↗`;


    $("contactEmail")
      .href =
      `mailto:${email}`;


    /* =====================================================
       PHONE 1
    ===================================================== */

    const phone1 =
      content.contactPhone1 ||
      DEFAULT_CONTENT.contactPhone1;


    $("contactPhone1")
      .textContent =
      phone1;


    $("contactPhone1")
      .href =
      `tel:${phone1.replace(
        /[^\d+]/g,
        ""
      )}`;


    /* =====================================================
       PHONE 2
    ===================================================== */

    const phone2 =
      content.contactPhone2 ||
      DEFAULT_CONTENT.contactPhone2;


    $("contactPhone2")
      .textContent =
      phone2;


    $("contactPhone2")
      .href =
      `tel:${phone2.replace(
        /[^\d+]/g,
        ""
      )}`;


    /* =====================================================
       LOCATION
    ===================================================== */

    $("contactLocation")
      .textContent =
      content.contactLocation ||
      DEFAULT_CONTENT.contactLocation;


  } catch (error) {

    console.error(
      "CONTENT ERROR:",
      error
    );

  }

}


/* =========================================================
   PUBLIC COLLECTION LOADER
========================================================= */

async function getPublicCollection(
  collectionName
) {

  const snap =
    await getDocs(

      collection(
        db,
        collectionName
      )

    );


  return snap.docs

    .map(
      (documentSnapshot) => ({

        id:
          documentSnapshot.id,

        ...documentSnapshot.data()

      })

    )

    .sort(

      (a, b) =>

        (Number(
          a.order
        ) || 0)

        -

        (Number(
          b.order
        ) || 0)

    );

}


/* =========================================================
   EXPERIENCE
========================================================= */

async function loadExperience() {

  const box =
    $("experienceTimeline");


  box.innerHTML =
    "";


  try {

    const data =
      await getPublicCollection(
        "experiences"
      );


    if (
      !data.length
    ) {

      box.innerHTML = `

        <div class="empty dark-empty">

          No experience has been added yet.

        </div>

      `;

      return;

    }


    data.forEach(
      (experience) => {

        const article =
          document.createElement(
            "article"
          );


        article.innerHTML = `

          <b>

            ${escapeHTML(
              formatPeriod(
                experience.startDate,
                experience.endDate
              )
            )}

          </b>


          <div>

            <h3>

              ${escapeHTML(
                experience.company ||
                ""
              )}

            </h3>


            <p>

              ${escapeHTML(
                experience.role ||
                ""
              )}

            </p>


            ${
              experience.description

                ? `

                  <div class="desc">

                    ${escapeHTML(
                      experience.description
                    )}

                  </div>

                `

                : ""
            }


            ${
              Array.isArray(
                experience.tags
              )

              &&

              experience.tags.length

                ? `

                  <span class="tag-list">

                    ${escapeHTML(
                      experience.tags.join(
                        " • "
                      )
                    )}

                  </span>

                `

                : ""
            }

          </div>

        `;


        box.appendChild(
          article
        );

      }
    );


  } catch (error) {

    console.error(
      "EXPERIENCE ERROR:",
      error
    );


    box.innerHTML = `

      <div class="empty dark-empty">

        Could not load experience.

      </div>

    `;

  }

}


/* =========================================================
   EDUCATION
========================================================= */

async function loadEducation() {

  const box =
    $("educationCards");


  box.innerHTML =
    "";


  try {

    const data =
      await getPublicCollection(
        "education"
      );


    if (
      !data.length
    ) {

      box.innerHTML = `

        <div class="empty">

          No education has been added yet.

        </div>

      `;

      return;

    }


    data.forEach(
      (entry) => {

        const card =
          document.createElement(
            "div"
          );


        card.innerHTML = `

          <small>

            ${escapeHTML(
              entry.section ||
              "EDUCATION"
            )}

          </small>


          <h3>

            ${escapeHTML(
              entry.institution ||
              ""
            )}

          </h3>


          <p>

            ${escapeHTML(
              entry.degree ||
              ""
            )}

          </p>


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


          ${
            entry.date

              ? `

                <b>

                  ${escapeHTML(
                    entry.date
                  )}

                </b>

              `

              : ""
          }

        `;


        box.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "EDUCATION ERROR:",
      error
    );


    box.innerHTML = `

      <div class="empty">

        Could not load education.

      </div>

    `;

  }

}


/* =========================================================
   SKILLS
========================================================= */

async function loadSkills() {

  const box =
    $("skillsList");


  box.innerHTML =
    "";


  try {

    const data =
      await getPublicCollection(
        "skills"
      );


    if (
      !data.length
    ) {

      box.innerHTML = `

        <span class="skill-pill">

          No skills added yet.

        </span>

      `;

      return;

    }


    data.forEach(
      (skill) => {

        const pill =
          document.createElement(
            "span"
          );


        pill.className =
          "skill-pill";


        pill.textContent =

          skill.level

            ? `${skill.name} — ${skill.level}`

            : skill.name ||
              "";


        box.appendChild(
          pill
        );

      }
    );


  } catch (error) {

    console.error(
      "SKILLS ERROR:",
      error
    );


    box.innerHTML = `

      <span class="skill-pill">

        Could not load skills.

      </span>

    `;

  }

}


/* =========================================================
   WORK
========================================================= */

async function loadWork() {

  try {

    const snap =
      await getDocs(

        query(

          collection(
            db,
            "portfolioItems"
          ),

          where(
            "published",
            "==",
            true
          )

        )

      );


    allItems =
      snap.docs

        .map(
          (documentSnapshot) => ({

            id:
              documentSnapshot.id,

            ...documentSnapshot.data()

          })

        )

        .sort(

          (a, b) =>

            (Number(
              a.order
            ) || 0)

            -

            (Number(
              b.order
            ) || 0)

        );


    buildFilters();

    renderWork();

    renderFeatured();


  } catch (error) {

    console.error(
      "WORK ERROR:",
      error
    );


    $("workGroups").innerHTML = `

      <div class="empty">

        Could not load published work.

      </div>

    `;

  }

}


/* =========================================================
   FILTERS
========================================================= */

function buildFilters() {

  const clients =

    [
      ...new Set(

        allItems

          .map(
            (item) =>
              item.client
          )

          .filter(Boolean)

      )

    ].sort(
      (a, b) =>
        a.localeCompare(
          b
        )
    );


  const categories =

    [
      ...new Set(

        allItems

          .map(
            (item) =>
              item.category
          )

          .filter(Boolean)

      )

    ].sort(
      (a, b) =>
        a.localeCompare(
          b
        )
    );


  renderFilterButtons(

    $("clientFilters"),

    clients,

    clientFilter,

    (value) => {

      clientFilter =
        value;


      buildFilters();

      renderWork();

      renderFeatured();

    }

  );


  renderFilterButtons(

    $("categoryFilters"),

    categories,

    categoryFilter,

    (value) => {

      categoryFilter =
        value;


      buildFilters();

      renderWork();

      renderFeatured();

    }

  );

}


function renderFilterButtons(

  target,
  values,
  selected,
  callback

) {

  target.innerHTML =
    "";


  const allButton =
    document.createElement(
      "button"
    );


  allButton.type =
    "button";


  allButton.textContent =
    "All";


  allButton.className =

    selected === "all"
      ? "active"
      : "";


  allButton.addEventListener(
    "click",
    () =>
      callback(
        "all"
      )
  );


  target.appendChild(
    allButton
  );


  values.forEach(
    (value) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.textContent =
        value;


      button.className =

        selected === value
          ? "active"
          : "";


      button.addEventListener(
        "click",
        () =>
          callback(
            value
          )
      );


      target.appendChild(
        button
      );

    }
  );

}


function getFilteredItems() {

  return allItems.filter(

    (item) =>

      (

        clientFilter ===
        "all"

        ||

        item.client ===
        clientFilter

      )

      &&

      (

        categoryFilter ===
        "all"

        ||

        item.category ===
        categoryFilter

      )

  );

}


/* =========================================================
   MEDIA CARD
========================================================= */

function createMediaCard(
  item
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "media-card";


  const media =

    item.type ===
    "video"

      ? document.createElement(
          "video"
        )

      : document.createElement(
          "img"
        );


  media.src =
    item.url;


  media.className =
    "media-visual";


  if (
    item.type ===
    "video"
  ) {

    media.muted =
      true;

    media.playsInline =
      true;

    media.preload =
      "metadata";

    media.autoplay =
      false;

    media.loop =
      false;

  } else {

    media.alt =
      item.title ||
      "Portfolio work";

    media.loading =
      "lazy";

  }


  const overlay =
    document.createElement(
      "div"
    );


  overlay.className =
    "card-overlay";


  const meta =

    [

      item.client,

      item.category

    ]

      .filter(Boolean)

      .join(
        " • "
      );


  overlay.innerHTML = `

    <strong>

      ${escapeHTML(
        item.title ||
        "Selected Work"
      )}

    </strong>


    <small>

      ${escapeHTML(
        meta
      )}

    </small>

  `;


  button.append(
    media,
    overlay
  );


  button.addEventListener(
    "click",
    () =>
      openMedia(
        item
      )
  );


  return button;

}


/* =========================================================
   GROUP BY CLIENT -> SECTION
========================================================= */

function groupByClient(
  list
) {

  const groups =
    new Map();


  list.forEach(
    (item) => {

      const client =
        item.client ||
        "Other";


      const category =
        item.category ||
        "Other";


      if (
        !groups.has(
          client
        )
      ) {

        groups.set(
          client,
          new Map()
        );

      }


      if (
        !groups
          .get(client)
          .has(category)
      ) {

        groups
          .get(client)
          .set(
            category,
            []
          );

      }


      groups
        .get(client)
        .get(category)
        .push(
          item
        );

    }
  );


  return groups;

}


/* =========================================================
   RENDER WORK
========================================================= */

function renderWork() {

  const root =
    $("workGroups");


  root.innerHTML =
    "";


  const list =
    getFilteredItems();


  if (!list.length) {

    root.innerHTML = `

      <div class="empty">

        No published work in the selected filters yet.

      </div>

    `;

    return;

  }


  const groups =
    groupByClient(
      list
    );


  groups.forEach(

    (
      sections,
      client
    ) => {

      const clientBlock =
        document.createElement(
          "div"
        );


      clientBlock.className =
        "client-group";


      const title =
        document.createElement(
          "h3"
        );


      title.innerHTML =

        `${escapeHTML(
          client
        )}

        <em>
          — work
        </em>`;


      clientBlock.appendChild(
        title
      );


      sections.forEach(

        (
          sectionItems,
          category
        ) => {

          const section =
            document.createElement(
              "div"
            );


          section.className =
            "work-section";


          const heading =
            document.createElement(
              "h4"
            );


          heading.textContent =
            category;


          section.appendChild(
            heading
          );


          const grid =
            document.createElement(
              "div"
            );


          grid.className =
            "media-grid compact-grid";


          sectionItems.forEach(
            (item) => {

              grid.appendChild(
                createMediaCard(
                  item
                )
              );

            }
          );


          section.appendChild(
            grid
          );


          clientBlock.appendChild(
            section
          );

        }
      );


      root.appendChild(
        clientBlock
      );

    }
  );

}


/* =========================================================
   FEATURED
========================================================= */

function renderFeatured() {

  const section =
    $("featured");


  const grid =
    $("featuredGrid");


  const list =

    getFilteredItems()

      .filter(
        (item) =>
          item.featured ===
          true
      )

      .slice(
        0,
        8
      );


  grid.innerHTML =
    "";


  if (!list.length) {

    section
      .classList
      .add(
        "hidden"
      );

    return;

  }


  section
    .classList
    .remove(
      "hidden"
    );


  list.forEach(
    (item) => {

      grid.appendChild(
        createMediaCard(
          item
        )
      );

    }
  );

}


/* =========================================================
   MEDIA MODAL
========================================================= */

function openMedia(
  item
) {

  $("mediaContent")
    .replaceChildren();


  const media =

    item.type ===
    "video"

      ? document.createElement(
          "video"
        )

      : document.createElement(
          "img"
        );


  media.src =
    item.url;


  if (
    item.type ===
    "video"
  ) {

    media.controls =
      true;

    media.autoplay =
      true;

    media.playsInline =
      true;

    media.loop =
      false;


    media.addEventListener(
      "ended",
      () => {

        media.pause();

      }
    );

  } else {

    media.alt =
      item.title ||
      "Portfolio work";

  }


  $("mediaContent")
    .appendChild(
      media
    );


  $("mediaCaption")
    .textContent =

      [

        item.title,

        item.client,

        item.category,

        item.description

      ]

        .filter(Boolean)

        .join(
          " • "
        );


  $("mediaModal")
    .classList
    .add(
      "active"
    );

}


$("mediaClose").addEventListener(
  "click",
  closeMedia
);


$("mediaModal").addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      $("mediaModal")
    ) {

      closeMedia();

    }

  }
);


function closeMedia() {

  const video =
    $("mediaContent")
      .querySelector(
        "video"
      );


  if (video) {

    video.pause();

    video.currentTime =
      0;

  }


  $("mediaModal")
    .classList
    .remove(
      "active"
    );


  $("mediaContent")
    .replaceChildren();

}


/* =========================================================
   HELPERS
========================================================= */

function formatPeriod(
  start,
  end
) {

  return [

    start,

    end ||
    "Present"

  ]

    .filter(Boolean)

    .join(
      " — "
    );

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
   INITIAL LOAD
========================================================= */

await Promise.allSettled([

  loadProfile(),

  loadContent(),

  loadExperience(),

  loadEducation(),

  loadSkills(),

  loadWork()

]);
