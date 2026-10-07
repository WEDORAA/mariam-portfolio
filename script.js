import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
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
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getFirestore(app);

const $ =
  (id) =>
    document.getElementById(id);


/* =========================================================
   YEAR
========================================================= */

if ($("year")) {
  $("year").textContent =
    new Date().getFullYear();
}


/* =========================================================
   MOBILE MENU
========================================================= */

const menuToggle =
  $("menuToggle");

const navLinks =
  $("navLinks");


if (menuToggle && navLinks) {

  menuToggle.addEventListener(
    "click",
    () => {

      navLinks.classList.toggle(
        "open"
      );

      menuToggle.classList.toggle(
        "active"
      );

      menuToggle.setAttribute(
        "aria-expanded",
        String(
          navLinks.classList.contains(
            "open"
          )
        )
      );

    }
  );

}


/* =========================================================
   CLOSE MOBILE MENU
========================================================= */

document
  .querySelectorAll(
    ".nav-links a"
  )
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        () => {

          navLinks?.classList.remove(
            "open"
          );

          menuToggle?.classList.remove(
            "active"
          );

        }
      );

    }
  );


/* =========================================================
   REVEAL ANIMATION
========================================================= */

if (
  "IntersectionObserver"
  in window
) {

  const revealObserver =
    new IntersectionObserver(

      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              entry.isIntersecting
            ) {

              entry.target
                .classList
                .add("visible");

              revealObserver.unobserve(
                entry.target
              );

            }

          }
        );

      },

      {
        threshold: 0.12
      }

    );


  document
    .querySelectorAll(
      ".reveal"
    )
    .forEach(
      (element) => {

        revealObserver.observe(
          element
        );

      }
    );

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

const authModal =
  $("authModal");


if ($("adminEntry")) {

  $("adminEntry").addEventListener(
    "click",
    () => {

      authModal?.classList.add(
        "active"
      );

      authModal?.setAttribute(
        "aria-hidden",
        "false"
      );

      $("loginEmail")?.focus();

    }
  );

}


/* =========================================================
   CLOSE ADMIN LOGIN
========================================================= */

function closeAuth() {

  authModal?.classList.remove(
    "active"
  );

  authModal?.setAttribute(
    "aria-hidden",
    "true"
  );

}


$("authClose")
  ?.addEventListener(
    "click",
    closeAuth
  );


authModal?.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      authModal
    ) {

      closeAuth();

    }

  }
);


/* =========================================================
   ADMIN LOGIN SUBMIT
========================================================= */

$("loginForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const email =
      $("loginEmail")
        ?.value
        .trim();

    const password =
      $("loginPassword")
        ?.value;


    if ($("loginMessage")) {

      $("loginMessage")
        .textContent =
        "Signing in...";

    }


    try {

      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


      const adminDoc =
        await getDoc(

          doc(
            db,
            "admins",
            credential.user.uid
          )

        );


      if (
        !adminDoc.exists() ||
        adminDoc.data()?.active !== true
      ) {

        await auth.signOut();

        throw new Error(
          "Unauthorized admin."
        );

      }


      window.location.href =
        "admin.html";

    }

    catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      if ($("loginMessage")) {

        $("loginMessage")
          .textContent =
          "Login failed. Check the email/password.";

      }

    }

  }
);


/* =========================================================
   PORTFOLIO VARIABLES
========================================================= */

let allItems = [];

let selectedClient =
  "all";


/* =========================================================
   LOAD PROFILE
========================================================= */

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
      !snapshot.exists()
    ) {
      return;
    }


    const profileData =
      snapshot.data();


    if (
      !profileData?.url
    ) {
      return;
    }


    const placeholder =
      $("profilePlaceholder");


    if (!placeholder) {
      return;
    }


    const image =
      document.createElement(
        "img"
      );


    image.src =
      profileData.url;


    image.alt =
      "Mariam Mohamed";


    image.className =
      "portrait-photo";


    placeholder.replaceWith(
      image
    );

  }

  catch (error) {

    console.error(
      "PROFILE LOAD ERROR:",
      error
    );

  }

}


/* =========================================================
   LOAD PORTFOLIO
========================================================= */

async function loadPortfolio() {

  const grid =
    $("mediaGrid");


  if (!grid) {
    return;
  }


  try {

    const portfolioQuery =
      query(

        collection(
          db,
          "portfolioItems"
        ),

        where(
          "published",
          "==",
          true
        ),

        orderBy(
          "order",
          "asc"
        )

      );


    const snapshot =
      await getDocs(
        portfolioQuery
      );


    allItems =
      snapshot.docs.map(
        (document) => ({

          id:
            document.id,

          ...document.data()

        })
      );


    buildClientFilters();

    renderPortfolio();

    renderFeatured();

  }

  catch (error) {

    console.error(
      "PORTFOLIO LOAD ERROR:",
      error
    );


    grid.innerHTML = `

      <div class="empty-gallery">

        Unable to load portfolio.

      </div>

    `;

  }

}


/* =========================================================
   GET CLIENT NAME
========================================================= */

function getClientName(
  item
) {

  const client =
    String(
      item.client || ""
    ).trim();


  if (!client) {

    return "Other / Unassigned";

  }


  return client;

}


/* =========================================================
   GET SECTION NAME
========================================================= */

function getSectionName(
  item
) {

  const category =
    String(
      item.category || ""
    ).trim();


  if (!category) {

    return "Other";

  }


  return category;

}


/* =========================================================
   BUILD CLIENT FILTER
========================================================= */

function buildClientFilters() {

  const bar =
    $("categoryBar");


  if (!bar) {
    return;
  }


  const clients =

    [

      ...new Set(

        allItems.map(
          (item) =>
            getClientName(item)
        )

      )

    ]

    .sort(
      (a, b) =>
        a.localeCompare(b)
    );


  bar.innerHTML =
    "";


  /* ALL */

  const allButton =
    document.createElement(
      "button"
    );


  allButton.className =
    "category-btn";


  if (
    selectedClient ===
    "all"
  ) {

    allButton.classList.add(
      "active"
    );

  }


  allButton.textContent =
    "All Clients";


  allButton.addEventListener(
    "click",
    () => {

      selectedClient =
        "all";

      buildClientFilters();

      renderPortfolio();

    }
  );


  bar.appendChild(
    allButton
  );


  /* CLIENT BUTTONS */

  clients.forEach(
    (client) => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "category-btn";


      if (
        selectedClient ===
        client
      ) {

        button.classList.add(
          "active"
        );

      }


      button.textContent =
        client;


      button.addEventListener(
        "click",
        () => {

          selectedClient =
            client;

          buildClientFilters();

          renderPortfolio();

        }
      );


      bar.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   CREATE MEDIA CARD
========================================================= */

function createMediaCard(
  item,
  index
) {

  const card =
    document.createElement(
      "button"
    );


  card.type =
    "button";


  card.className =
    "media-card";


  /* =======================================================
     MEDIA
  ======================================================= */

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


    /*
       PUBLIC GALLERY:

       No autoplay
       No loop
    */

    video.autoplay =
      false;

    video.loop =
      false;

    video.muted =
      true;

    video.controls =
      false;

    video.playsInline =
      true;

    video.preload =
      "metadata";


    video.className =
      "media-visual";


    card.appendChild(
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
      "Portfolio work";


    image.loading =
      "lazy";


    image.className =
      "media-visual";


    card.appendChild(
      image
    );

  }


  /* =======================================================
     OVERLAY
  ======================================================= */

  const overlay =
    document.createElement(
      "div"
    );


  overlay.className =
    "media-overlay";


  const title =
    item.title ||
    "Selected Work";


  const section =
    getSectionName(
      item
    );


  const client =
    getClientName(
      item
    );


  overlay.innerHTML = `

    <span class="card-number">

      ${String(
        index + 1
      ).padStart(
        2,
        "0"
      )}

    </span>


    <strong>

      ${escapeHTML(
        title
      )}

    </strong>


    <i>
      ↗
    </i>


    <small>

      ${escapeHTML(
        client
      )}
      •
      ${escapeHTML(
        section
      )}

    </small>

  `;


  card.appendChild(
    overlay
  );


  card.addEventListener(
    "click",
    () => {

      openMedia(
        item
      );

    }
  );


  return card;

}


/* =========================================================
   GROUP ITEMS BY CLIENT
========================================================= */

function groupByClient(
  items
) {

  const clients = {};


  items.forEach(
    (item) => {

      const client =
        getClientName(
          item
        );


      if (!clients[client]) {

        clients[client] =
          [];

      }


      clients[client].push(
        item
      );

    }
  );


  return clients;

}


/* =========================================================
   GROUP ITEMS BY SECTION
========================================================= */

function groupBySection(
  items
) {

  const sections = {};


  items.forEach(
    (item) => {

      const section =
        getSectionName(
          item
        );


      if (!sections[section]) {

        sections[section] =
          [];

      }


      sections[section].push(
        item
      );

    }
  );


  return sections;

}


/* =========================================================
   CREATE COMPANY BLOCK
========================================================= */

function createClientBlock(
  client,
  clientItems
) {

  const clientBlock =
    document.createElement(
      "section"
    );


  clientBlock.className =
    "client-group";


  /* =======================================================
     COMPANY HEADER
  ======================================================= */

  const clientHeader =
    document.createElement(
      "div"
    );


  clientHeader.className =
    "client-header";


  const title =
    document.createElement(
      "h3"
    );


  title.textContent =
    client;


  const count =
    document.createElement(
      "span"
    );


  count.textContent =

    `${clientItems.length} ${
      clientItems.length === 1
        ? "project"
        : "projects"
    }`;


  clientHeader.append(
    title,
    count
  );


  clientBlock.appendChild(
    clientHeader
  );


  /* =======================================================
     SECTIONS INSIDE COMPANY
  ======================================================= */

  const sections =
    groupBySection(
      clientItems
    );


  const orderedSections =

    Object.entries(
      sections
    )


    .sort(
      ([a], [b]) =>
        a.localeCompare(b)
    );


  orderedSections.forEach(
    ([sectionName, sectionItems]) => {


      const sectionBlock =
        document.createElement(
          "div"
        );


      sectionBlock.className =
        "work-section";


      /* SECTION TITLE */

      const sectionHeading =
        document.createElement(
          "div"
        );


      sectionHeading.className =
        "work-section-heading";


      const sectionTitle =
        document.createElement(
          "h4"
        );


      sectionTitle.textContent =
        sectionName;


      const sectionCount =
        document.createElement(
          "span"
        );


      sectionCount.textContent =
        `${sectionItems.length} ${
          sectionItems.length === 1
            ? "item"
            : "items"
        }`;


      sectionHeading.append(
        sectionTitle,
        sectionCount
      );


      sectionBlock.appendChild(
        sectionHeading
      );


      /* SECTION GRID */

      const sectionGrid =
        document.createElement(
          "div"
        );


      sectionGrid.className =
        "section-media-grid";


      sectionItems.forEach(
        (item, index) => {

          sectionGrid.appendChild(

            createMediaCard(
              item,
              index
            )

          );

        }
      );


      sectionBlock.appendChild(
        sectionGrid
      );


      clientBlock.appendChild(
        sectionBlock
      );

    }
  );


  return clientBlock;

}


/* =========================================================
   RENDER PORTFOLIO
========================================================= */

function renderPortfolio() {

  const grid =
    $("mediaGrid");


  if (!grid) {
    return;
  }


  grid.innerHTML =
    "";


  let filteredItems;


  if (
    selectedClient ===
    "all"
  ) {

    filteredItems =
      allItems;

  }

  else {

    filteredItems =

      allItems.filter(
        (item) =>
          getClientName(item) ===
          selectedClient
      );

  }


  if (!filteredItems.length) {

    grid.innerHTML = `

      <div class="empty-gallery">

        No published work in this selection yet.

      </div>

    `;

    return;

  }


  const grouped =
    groupByClient(
      filteredItems
    );


  const orderedClients =

    Object.entries(
      grouped
    )


    .sort(
      ([a], [b]) =>
        a.localeCompare(b)
    );


  orderedClients.forEach(
    ([client, clientItems]) => {

      grid.appendChild(

        createClientBlock(
          client,
          clientItems
        )

      );

    }
  );

}


/* =========================================================
   FEATURED WORK
========================================================= */

function renderFeatured() {

  const section =
    $("featuredSection");


  const grid =
    $("featuredGrid");


  if (
    !section ||
    !grid
  ) {
    return;
  }


  const featuredItems =

    allItems

      .filter(
        (item) =>
          item.featured === true
      )

      .slice(
        0,
        6
      );


  if (!featuredItems.length) {

    section.classList.add(
      "hidden"
    );

    return;

  }


  section.classList.remove(
    "hidden"
  );


  grid.innerHTML =
    "";


  featuredItems.forEach(
    (item, index) => {

      grid.appendChild(

        createMediaCard(
          item,
          index
        )

      );

    }
  );

}


/* =========================================================
   OPEN MEDIA
========================================================= */

function openMedia(
  item
) {

  const modal =
    $("mediaModal");


  const content =
    $("modalContent");


  const caption =
    $("modalCaption");


  if (
    !modal ||
    !content
  ) {
    return;
  }


  content.innerHTML =
    "";


  /* =======================================================
     VIDEO
  ======================================================= */

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


    /*
       Plays once.
       NEVER loops.
    */

    video.autoplay =
      true;

    video.loop =
      false;

    video.playsInline =
      true;

    video.preload =
      "metadata";


    video.addEventListener(
      "ended",
      () => {

        video.pause();

      }
    );


    content.appendChild(
      video
    );

  }

  /* =======================================================
     IMAGE
  ======================================================= */

  else {

    const image =
      document.createElement(
        "img"
      );


    image.src =
      item.url;


    image.alt =
      item.title ||
      "Portfolio work";


    content.appendChild(
      image
    );

  }


  /* =======================================================
     CAPTION
  ======================================================= */

  if (caption) {

    const title =
      item.title ||
      "Selected Work";


    const client =
      getClientName(
        item
      );


    const section =
      getSectionName(
        item
      );


    caption.innerHTML = `

      <strong>

        ${escapeHTML(
          title
        )}

      </strong>


      <span>

        ${escapeHTML(
          client
        )}

        • 

        ${escapeHTML(
          section
        )}

      </span>

    `;

  }


  modal.classList.add(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   CLOSE MEDIA
========================================================= */

function closeMedia() {

  const modal =
    $("mediaModal");


  const content =
    $("modalContent");


  if (!modal) {
    return;
  }


  const video =
    content?.querySelector(
      "video"
    );


  if (video) {

    video.pause();

    video.currentTime =
      0;

  }


  modal.classList.remove(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  if (content) {

    content.innerHTML =
      "";

  }


  document.body.style.overflow =
    "";

}


$("modalClose")
  ?.addEventListener(
    "click",
    closeMedia
  );


$("mediaModal")
  ?.addEventListener(
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


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Escape"
    ) {

      closeAuth();

      closeMedia();

    }

  }
);


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value
  )

  .replace(
    /[&<>"']/g,
    (character) => ({

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

    }[character])
  );

}


/* =========================================================
   START
========================================================= */

loadProfile();

loadPortfolio();