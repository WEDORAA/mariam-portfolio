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
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getFirestore(app);

const $ =
  (id) =>
    document.getElementById(id);


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

let clientFilter = "all";

let categoryFilter = "all";

let modalItem = null;

let modalIndex = 0;


/* =========================================================
   VIDEO STATE
========================================================= */

/*
  Becomes true after the visitor has interacted
  with the website.

  Clicking Work sets this to true.
*/
let userHasInteracted = false;


/*
  Videos currently managed by the observer.
*/
const autoplayVideos =
  new Set();


let videoObserver = null;


/* =========================================================
   REMEMBER USER INTERACTION
========================================================= */

function registerUserInteraction() {

  userHasInteracted = true;

}


/* =========================================================
   WORK NAV CLICK
   The Work button is a deliberate user interaction.
========================================================= */

document
  .querySelectorAll(
    'a[href="#work"]'
  )
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        () => {

          /*
            IMPORTANT:
            This happens directly inside the user's click.
          */

          registerUserInteraction();


          /*
            Give visible videos another chance
            after Work becomes active.
          */

          setTimeout(
            () => {

              tryPlayVisibleVideosWithSound();

            },
            350
          );

        }
      );

    }
  );


/* =========================================================
   CREATE VIDEO OBSERVER
========================================================= */

function createVideoObserver() {

  if (
    !("IntersectionObserver" in window)
  ) {

    return null;

  }


  return new IntersectionObserver(

    (entries) => {

      entries.forEach(
        (entry) => {

          const video =
            entry.target;


          /*
            VIDEO IS VISIBLE
          */

          if (

            entry.isIntersecting &&

            entry.intersectionRatio >=
              0.55

          ) {

            /*
              Don't restart a video that already ended.
            */

            if (
              video.ended
            ) {

              return;

            }


            /*
              Pause other videos.
            */

            autoplayVideos.forEach(
              (otherVideo) => {

                if (

                  otherVideo !== video &&

                  !otherVideo.paused

                ) {

                  otherVideo.pause();

                }

              }
            );


            autoplayVideos.add(
              video
            );


            /*
              If the user already interacted
              with the website, try audible playback.
            */

            if (
              userHasInteracted
            ) {

              playVideoWithSound(
                video
              );

            } else {

              /*
                Before interaction, fallback to muted.
              */

              playVideoMuted(
                video
              );

            }

          } else {

            /*
              VIDEO IS OUTSIDE VIEWPORT
            */

            if (
              !video.paused
            ) {

              video.pause();

            }

          }

        }
      );

    },

    {
      threshold: [
        0,
        0.25,
        0.55,
        0.75,
        1
      ]
    }

  );

}


videoObserver =
  createVideoObserver();


/* =========================================================
   OBSERVE VIDEO
========================================================= */

function observeVideo(
  video
) {

  if (!video)
    return;


  video.playsInline =
    true;


  video.loop =
    false;


  video.autoplay =
    false;


  video.preload =
    "metadata";


  video.controls =
    false;


  video.setAttribute(
    "playsinline",
    ""
  );


  /*
    Direct click on the video is also considered
    an interaction.
  */

  video.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();


      registerUserInteraction();


      playVideoWithSound(
        video
      );

    }
  );


  /*
    Touch interaction on mobile.
  */

  video.addEventListener(
    "touchend",
    () => {

      registerUserInteraction();


      playVideoWithSound(
        video
      );

    },
    {
      passive: true
    }
  );


  if (
    videoObserver
  ) {

    videoObserver.observe(
      video
    );

  }

}


/* =========================================================
   PLAY WITH SOUND
========================================================= */

function playVideoWithSound(
  video
) {

  if (!video)
    return;


  if (
    video.ended
  )
    return;


  /*
    Stop the other feed videos.
  */

  autoplayVideos.forEach(
    (otherVideo) => {

      if (

        otherVideo !== video &&

        !otherVideo.paused

      ) {

        otherVideo.pause();

      }

    }
  );


  /*
    Remove muted state.
  */

  video.muted =
    false;

  video.defaultMuted =
    false;


  video.removeAttribute(
    "muted"
  );


  /*
    Play with audio.
  */

  const promise =
    video.play();


  if (
    promise &&
    typeof promise.catch ===
      "function"
  ) {

    promise.catch(
      () => {

        /*
          Browser still blocked sound.

          Safe fallback:
          play muted.
        */

        playVideoMuted(
          video
        );

      }
    );

  }

}


/* =========================================================
   PLAY MUTED
========================================================= */

function playVideoMuted(
  video
) {

  if (!video)
    return;


  if (
    video.ended
  )
    return;


  video.muted =
    true;


  video.defaultMuted =
    true;


  video.setAttribute(
    "muted",
    ""
  );


  const promise =
    video.play();


  if (
    promise &&
    typeof promise.catch ===
      "function"
  ) {

    promise.catch(
      () => {}
    );

  }

}


/* =========================================================
   TRY VISIBLE VIDEOS WITH SOUND
========================================================= */

function tryPlayVisibleVideosWithSound() {

  const videos =
    document.querySelectorAll(
      ".media-card video"
    );


  videos.forEach(
    (video) => {

      const rect =
        video.getBoundingClientRect();


      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {

        return;

      }


      const visibleTop =
        Math.max(
          rect.top,
          0
        );


      const visibleBottom =
        Math.min(
          rect.bottom,
          window.innerHeight
        );


      const visibleLeft =
        Math.max(
          rect.left,
          0
        );


      const visibleRight =
        Math.min(
          rect.right,
          window.innerWidth
        );


      const visibleWidth =
        Math.max(
          0,
          visibleRight -
          visibleLeft
        );


      const visibleHeight =
        Math.max(
          0,
          visibleBottom -
          visibleTop
        );


      const visibleArea =
        visibleWidth *
        visibleHeight;


      const totalArea =
        rect.width *
        rect.height;


      if (
        totalArea <= 0
      ) {

        return;

      }


      const ratio =
        visibleArea /
        totalArea;


      if (
        ratio >= 0.55 &&
        !video.ended
      ) {

        playVideoWithSound(
          video
        );

      }

    }
  );

}


/* =========================================================
   GENERAL PAGE INTERACTION
========================================================= */

document.addEventListener(
  "pointerdown",
  () => {

    registerUserInteraction();

  },
  {
    passive: true
  }
);


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

    registerUserInteraction();


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

          registerUserInteraction();


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
   ADMIN LOGIN MODAL
========================================================= */

$("adminEntry").addEventListener(
  "click",
  () => {

    registerUserInteraction();


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
   LOGIN
========================================================= */

$("loginForm").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    registerUserInteraction();


    $("loginMessage")
      .textContent =
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
   HEADING STYLE
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


    const email =
      content.contactEmail ||
      DEFAULT_CONTENT.contactEmail;


    $("contactEmail")
      .textContent =
      `${email} ↗`;


    $("contactEmail")
      .href =
      `mailto:${email}`;


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
   PUBLIC COLLECTION
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

        (
          Number(
            a.order
          ) || 0
        )

        -

        (
          Number(
            b.order
          ) || 0
        )

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
   NORMALIZE MEDIA
========================================================= */

function normalizeMedia(
  item
) {

  if (

    Array.isArray(
      item.media
    )

    &&

    item.media.length

  ) {

    return item.media

      .filter(
        (media) =>
          media &&
          media.url
      )

      .map(
        (media) => ({

          url:
            media.url,

          type:
            media.type ===
            "video"

              ? "video"

              : "image",

          publicId:
            media.publicId ||
            ""

        })
      );

  }


  if (
    item.url
  ) {

    return [

      {

        url:
          item.url,

        type:
          item.type ===
          "video"

            ? "video"

            : "image",

        publicId:
          item.publicId ||
          ""

      }

    ];

  }


  return [];

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

            (
              Number(
                a.order
              ) || 0
            )

            -

            (
              Number(
                b.order
              ) || 0
            )

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

    ]

      .sort(
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

    ]

      .sort(
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

      registerUserInteraction();


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

      registerUserInteraction();


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
   POST CARD
========================================================= */

function createMediaCard(
  item
) {

  const media =
    normalizeMedia(
      item
    );


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "media-card";


  if (
    !media.length
  ) {

    return button;

  }


  const collage =
    document.createElement(
      "div"
    );


  collage.className =

    media.length === 1

      ? "post-collage single-media"

      : "post-collage multiple-media";


  const visibleMedia =
    media.slice(
      0,
      Math.min(
        media.length,
        4
      )
    );


  visibleMedia.forEach(
    (mediaItem) => {

      const wrapper =
        document.createElement(
          "div"
        );


      wrapper.className =
        "post-media-item";


      const visual =

        mediaItem.type ===
        "video"

          ? document.createElement(
              "video"
            )

          : document.createElement(
              "img"
            );


      visual.src =
        mediaItem.url;


      visual.className =
        "media-visual";


      if (
        mediaItem.type ===
        "video"
      ) {

        visual.muted =
          true;

        visual.defaultMuted =
          true;

        visual.autoplay =
          false;

        visual.loop =
          false;

        visual.playsInline =
          true;

        visual.controls =
          false;

        visual.preload =
          "metadata";


        visual.setAttribute(
          "muted",
          ""
        );


        visual.setAttribute(
          "playsinline",
          ""
        );


        const soundHint =
          document.createElement(
            "span"
          );


        soundHint.className =
          "video-sound-hint";


        soundHint.textContent =
          "🔊 Tap for sound";


        wrapper.appendChild(
          soundHint
        );


        observeVideo(
          visual
        );


        wrapper.addEventListener(
          "click",
          (event) => {

            event.stopPropagation();


            registerUserInteraction();


            playVideoWithSound(
              visual
            );

          }
        );

      } else {

        visual.alt =
          item.title ||
          "Portfolio work";


        visual.loading =
          "lazy";

      }


      wrapper.insertBefore(
        visual,
        wrapper.firstChild
      );


      collage.appendChild(
        wrapper
      );

    }
  );


  if (
    media.length > 4
  ) {

    const more =
      document.createElement(
        "div"
      );


    more.className =
      "more-media";


    more.textContent =
      `+${media.length - 4}`;


    collage.appendChild(
      more
    );

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


    ${
      media.length > 1

        ? `

          <span class="media-count">

            ${media.length} media

          </span>

        `

        : ""

    }

  `;


  button.append(
    collage,
    overlay
  );


  button.addEventListener(
    "click",
    (event) => {

      registerUserInteraction();


      const clickedVideo =
        event.target.closest(
          "video"
        );


      if (
        clickedVideo
      ) {

        playVideoWithSound(
          clickedVideo
        );


        return;

      }


      openMedia(
        item
      );

    }
  );


  return button;

}


/* =========================================================
   GROUP BY CLIENT
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


  if (
    !list.length
  ) {

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


  if (
    !list.length
  ) {

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
   OPEN GALLERY
========================================================= */

function openMedia(
  item
) {

  const media =
    normalizeMedia(
      item
    );


  if (
    !media.length
  )
    return;


  registerUserInteraction();


  modalItem =
    item;


  modalIndex =
    0;


  $("mediaModal")
    .classList
    .add(
      "active"
    );


  renderModalMedia();

}


/* =========================================================
   RENDER GALLERY MEDIA
========================================================= */

function renderModalMedia() {

  if (!modalItem)
    return;


  const media =
    normalizeMedia(
      modalItem
    );


  if (
    !media.length
  )
    return;


  if (
    modalIndex < 0
  ) {

    modalIndex =
      media.length -
      1;

  }


  if (
    modalIndex >=
    media.length
  ) {

    modalIndex =
      0;

  }


  const current =
    media[
      modalIndex
    ];


  $("mediaContent")
    .replaceChildren();


  const element =

    current.type ===
    "video"

      ? document.createElement(
          "video"
        )

      : document.createElement(
          "img"
        );


  element.src =
    current.url;


  if (
    current.type ===
    "video"
  ) {

    element.controls =
      true;

    element.autoplay =
      true;

    element.loop =
      false;

    element.playsInline =
      true;

    element.preload =
      "auto";


    /*
      Because the visitor clicked
      before opening the gallery,
      request sound immediately.
    */

    element.muted =
      false;

    element.defaultMuted =
      false;


    element.removeAttribute(
      "muted"
    );


    element.setAttribute(
      "playsinline",
      ""
    );


    $("mediaContent")
      .appendChild(
        element
      );


    const promise =
      element.play();


    if (
      promise &&
      typeof promise.catch ===
        "function"
    ) {

      promise.catch(
        () => {

          element.muted =
            true;


          element.defaultMuted =
            true;


          element.setAttribute(
            "muted",
            ""
          );


          element.play()
            .catch(
              () => {}
            );

        }
      );

    }


    element.addEventListener(
      "ended",
      () => {

        element.pause();

      }
    );

  } else {

    element.alt =
      modalItem.title ||
      "Portfolio media";


    $("mediaContent")
      .appendChild(
        element
      );

  }


  $("mediaCounter")
    .textContent =

    `${modalIndex + 1} / ${media.length}`;


  $("mediaCaption")
    .textContent =

      [

        modalItem.title,

        modalItem.client,

        modalItem.category,

        modalItem.description

      ]

        .filter(Boolean)

        .join(
          " • "
        );


  const multiple =
    media.length > 1;


  $("mediaPrev")
    .classList
    .toggle(
      "hidden",
      !multiple
    );


  $("mediaNext")
    .classList
    .toggle(
      "hidden",
      !multiple
    );

}


/* =========================================================
   NEXT MEDIA
========================================================= */

function nextMedia() {

  if (!modalItem)
    return;


  const media =
    normalizeMedia(
      modalItem
    );


  if (
    media.length <= 1
  )
    return;


  modalIndex++;


  if (
    modalIndex >=
    media.length
  ) {

    modalIndex =
      0;

  }


  renderModalMedia();

}


/* =========================================================
   PREVIOUS MEDIA
========================================================= */

function previousMedia() {

  if (!modalItem)
    return;


  const media =
    normalizeMedia(
      modalItem
    );


  if (
    media.length <= 1
  )
    return;


  modalIndex--;


  if (
    modalIndex < 0
  ) {

    modalIndex =
      media.length -
      1;

  }


  renderModalMedia();

}


/* =========================================================
   GALLERY BUTTONS
========================================================= */

$("mediaPrev").addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

    registerUserInteraction();

    previousMedia();

  }
);


$("mediaNext").addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

    registerUserInteraction();

    nextMedia();

  }
);


/* =========================================================
   CLOSE GALLERY
========================================================= */

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


  modalItem =
    null;


  modalIndex =
    0;


  $("mediaModal")
    .classList
    .remove(
      "active"
    );


  $("mediaContent")
    .replaceChildren();

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      !$("mediaModal")
        .classList
        .contains(
          "active"
        )
    )
      return;


    if (
      event.key ===
      "ArrowRight"
    ) {

      nextMedia();

    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      previousMedia();

    }


    if (
      event.key ===
      "Escape"
    ) {

      closeMedia();

    }

  }
);


/* =========================================================
   MOBILE SWIPE
========================================================= */

let touchStartX =
  0;

let touchStartY =
  0;


$("mediaModal").addEventListener(
  "touchstart",
  (event) => {

    if (
      !event.changedTouches.length
    )
      return;


    touchStartX =
      event.changedTouches[0]
        .clientX;


    touchStartY =
      event.changedTouches[0]
        .clientY;

  },
  {
    passive:
      true
  }
);


$("mediaModal").addEventListener(
  "touchend",
  (event) => {

    if (
      !event.changedTouches.length
    )
      return;


    const touchEndX =
      event.changedTouches[0]
        .clientX;


    const touchEndY =
      event.changedTouches[0]
        .clientY;


    const deltaX =
      touchEndX -
      touchStartX;


    const deltaY =
      touchEndY -
      touchStartY;


    if (
      Math.abs(deltaX) < 50
    )
      return;


    if (
      Math.abs(deltaX) <=
      Math.abs(deltaY)
    )
      return;


    registerUserInteraction();


    if (
      deltaX < 0
    ) {

      nextMedia();

    } else {

      previousMedia();

    }

  },
  {
    passive:
      true
  }
);


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
