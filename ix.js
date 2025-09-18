//Navigation Bar
document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector('[data-nav-element="menu"]');

  menuButton.addEventListener("click", () => {
    const navbar = document.querySelector('[data-nav-element="navbar"]');
    const currentState = navbar.getAttribute("data-nav-state");
    navbar.setAttribute(
      "data-nav-state",
      currentState === "open" ? "closed" : "open",
    );

    const staticNav = document.querySelector('[data-nav-element="static"]');
    if (staticNav) {
      staticNav.classList.toggle("active");
    }
  });
});

//Navigation Overlays
document.addEventListener("DOMContentLoaded", function () {
  if (window.innerWidth > 991) {
    return;
  }

  const toggles = document.querySelectorAll('[data-nav-dd="toggle"]');
  const openButtons = document.querySelectorAll("[data-dd-open]");
  const menu = document.querySelector('[data-nav-element="menu"]');
  const backButtons = document.querySelectorAll("[data-dd-back]");
  let activeToggle = null;

  function hideAllDropdowns() {
    toggles.forEach((toggle) => {
      const drawer = toggle.nextElementSibling;
      if (drawer && drawer.getAttribute("data-nav-dd") === "drawer") {
        toggle.setAttribute("data-dd-state", "hide");
      }
    });
    activeToggle = null;
  }

  function showDropdown(toggle, drawer) {
    if (activeToggle && activeToggle !== toggle) {
      hideAllDropdowns();
    }

    activeToggle = toggle;
    toggle.setAttribute("data-dd-state", "show");
  }

  function hideDropdown(toggle, drawer) {
    toggle.setAttribute("data-dd-state", "hide");
    if (activeToggle === toggle) {
      activeToggle = null;
    }
  }

  // Open button click handlers
  openButtons.forEach((openButton) => {
    // Find the associated toggle element
    const toggle =
      openButton.closest('[data-nav-dd="toggle"]') ||
      openButton.parentElement.querySelector('[data-nav-dd="toggle"]');
    if (toggle) {
      const drawer = toggle.nextElementSibling;
      if (drawer && drawer.getAttribute("data-nav-dd") === "drawer") {
        openButton.addEventListener("click", () => {
          const currentState = toggle.getAttribute("data-dd-state");
          if (currentState === "show") {
            hideDropdown(toggle, drawer);
          } else {
            showDropdown(toggle, drawer);
          }
        });
      }
    }
  });

  // Back button handlers
  backButtons.forEach((backButton) => {
    backButton.addEventListener("click", () => {
      // Traverse up to find parent toggle
      let parentToggle = backButton.closest('[data-nav-dd="drawer"]');
      if (parentToggle) {
        parentToggle = parentToggle.previousElementSibling;
        if (
          parentToggle &&
          parentToggle.getAttribute("data-nav-dd") === "toggle"
        ) {
          const drawer = parentToggle.nextElementSibling;
          hideDropdown(parentToggle, drawer);
        }
      }
    });
  });

  // Menu click handler
  if (menu) {
    menu.addEventListener("click", () => {
      if (activeToggle) {
        const currentState = activeToggle.getAttribute("data-dd-state");
        if (currentState === "show") {
          const drawer = activeToggle.nextElementSibling;
          hideDropdown(activeToggle, drawer);
        }
      }
    });
  }
});

//Navigation Dropdowns
document.addEventListener("DOMContentLoaded", function () {
  if (window.innerWidth <= 991) {
    return;
  }
  const toggles = document.querySelectorAll('[data-nav-dd="toggle"]');
  const overlay = document.querySelector("[data-nav-dd='overlay']");
  let activeToggle = null;
  let hideTimeout = null;

  function initialiser() {
    // Create overlay quickTo
    const overlayQuickTo = overlay
      ? gsap.quickTo(overlay, "opacity", { duration: 0.15, ease: "power2.out" })
      : null;

    // Store timeline references for drawers
    const drawerTimelines = new Map();

    // Define playDropdown function with timeline logic
    window.playDropdown = function (drawer, show = true) {
      let timeline = drawerTimelines.get(drawer);
      if (!timeline) {
        // Create fresh timeline for drawer animation
        gsap.set(drawer, { opacity: 0, y: 5 });
        timeline = gsap.timeline({ paused: true }).to(drawer, {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: "power2.out",
        });
        drawerTimelines.set(drawer, timeline);
      }
      show ? timeline.play() : timeline.reverse();
    };

    // Expose overlay function
    window.overlayQuickTo = overlayQuickTo;
  }

  function showOverlay() {
    const hasActiveDropdown = Array.from(toggles).some(
      (toggle) => toggle.getAttribute("data-dd-state") === "show",
    );
    if (!hasActiveDropdown && window.overlayQuickTo) {
      window.overlayQuickTo(0);
    }
  }

  function hideAllDropdowns() {
    toggles.forEach((toggle) => {
      const drawer = toggle.nextElementSibling;
      if (drawer && drawer.getAttribute("data-nav-dd") === "drawer") {
        toggle.setAttribute("data-dd-state", "hide");
        drawer.style.pointerEvents = "none";
        window.playDropdown(drawer, false);
      }
    });
    activeToggle = null;
    if (window.overlayQuickTo) {
      window.overlayQuickTo(0);
    }
  }

  function showDropdown(toggle, drawer) {
    if (activeToggle && activeToggle !== toggle) {
      hideAllDropdowns();
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    activeToggle = toggle;
    toggle.setAttribute("data-dd-state", "show");
    drawer.style.pointerEvents = "auto";
    window.playDropdown(drawer, true);

    if (window.overlayQuickTo) {
      window.overlayQuickTo(1);
    }
  }

  function hideDropdown(toggle, drawer) {
    hideTimeout = setTimeout(() => {
      toggle.setAttribute("data-dd-state", "hide");
      drawer.style.pointerEvents = "none";
      window.playDropdown(drawer, false);

      if (activeToggle === toggle) {
        activeToggle = null;
      }
      showOverlay();
    }, 150);
  }

  // Initialize animations first
  initialiser();

  toggles.forEach((toggle, index) => {
    const drawer = toggle.nextElementSibling;
    if (drawer && drawer.getAttribute("data-nav-dd") === "drawer") {
      toggle.addEventListener("mouseenter", () => {
        showDropdown(toggle, drawer);
      });
      toggle.addEventListener("mouseleave", () => {
        hideDropdown(toggle, drawer);
      });
      drawer.addEventListener("mouseenter", () => {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }

        activeToggle = toggle;
        toggle.setAttribute("data-dd-state", "show");
        drawer.style.pointerEvents = "auto";
        window.playDropdown(drawer, true);

        if (window.overlayQuickTo) {
          window.overlayQuickTo(1);
        }
      });
      drawer.addEventListener("mouseleave", () => {
        hideDropdown(toggle, drawer);
      });
    }
  });
});

//Accordions
document.addEventListener("DOMContentLoaded", function () {
  // Heights storage object
  const drawerHeights = {};

  // Make functions globally accessible
  window.initializeAccordions = function () {
    const toggles = document.querySelectorAll("[data-acc-toggle]");
    toggles.forEach((toggle, index) => {
      // Get drawer element
      const drawer = toggle.querySelector("[data-acc-drawer]");
      if (drawer) {
        // Store the drawer's content height
        const drawerContent = drawer.firstElementChild;
        const height = drawerContent.offsetHeight;
        // Store height in our object using a unique key
        const drawerId = "drawer-" + index;
        drawerHeights[drawerId] = height;
        // Set initial height to 0
        drawer.style.height = "0px";
        drawer.style.overflow = "hidden";
        drawer.style.transition = "height 0.3s ease-in-out";
        // Add data attribute to link toggle with drawer
        toggle.setAttribute("data-drawer-id", drawerId);
      }
      // Add click event listener
      toggle.addEventListener("click", handleAccordionClick);
    });
  };

  window.openFirstAccordion = function () {
    const components = document.querySelectorAll("[data-acc-component]");
    components.forEach((component) => {
      const firstToggle = component.querySelector("[data-acc-toggle]");
      if (firstToggle) {
        openAccordion(firstToggle);
      }
    });
  };

  function openAccordion(toggle) {
    const drawerId = toggle.getAttribute("data-drawer-id");
    const drawer = toggle.querySelector("[data-acc-drawer]");
    // Update toggle state
    toggle.setAttribute("data-toggle-state", "open");
    // Animate height
    drawer.style.height = drawerHeights[drawerId] + "px";
  }

  function closeAccordion(toggle) {
    const drawer = toggle.querySelector("[data-acc-drawer]");
    // Update toggle state
    toggle.setAttribute("data-toggle-state", "closed");
    // Animate height back to 0
    drawer.style.height = "0px";
  }

  function handleAccordionClick(event) {
    const toggle = event.currentTarget;
    const toggleState = toggle.getAttribute("data-toggle-state");
    if (toggleState === "closed") {
      // Close all other accordions in all components
      closeAllOtherAccordions(toggle);
      // Open this accordion
      openAccordion(toggle);
    } else {
      // Close this accordion
      closeAccordion(toggle);
    }
  }

  function closeAllOtherAccordions(currentToggle) {
    // Find the parent component of the current toggle
    const parentComponent = currentToggle.closest("[data-acc-component]");
    if (parentComponent) {
      // Find all open accordions only within this component
      const openTogglesInComponent = parentComponent.querySelectorAll(
        '[data-acc-toggle][data-toggle-state="open"]',
      );
      openTogglesInComponent.forEach((toggle) => {
        if (toggle !== currentToggle) {
          closeAccordion(toggle);
        }
      });
    }
  }

  // Add 200ms delay to ensure DOM is fully rendered
  setTimeout(function () {
    // Initialize accordions on page load
    window.initializeAccordions();
    window.openFirstAccordion();
  }, 200);

  // Add click event listener for pagination button
  document.addEventListener("click", function (event) {
    if (
      event.target.hasAttribute("data-acc-load") ||
      event.target.closest("[data-acc-load]")
    ) {
      // When pagination button is clicked, reinitialize accordions
      // after a small delay to allow for DOM updates
      setTimeout(function () {
        window.initializeAccordions();
        window.openFirstAccordion();
      }, 300);
    }
  });
});

//Tab Switchers
document.addEventListener("DOMContentLoaded", function () {
  function rowInitialiser() {
    const tabTables = document.querySelectorAll("[data-tab-table]");

    tabTables.forEach((table) => {
      const rows = Array.from(table.querySelectorAll("[data-tab-row]"));
      rows.sort((a, b) => {
        const aValue = parseInt(a.getAttribute("data-tab-row"), 10);
        const bValue = parseInt(b.getAttribute("data-tab-row"), 10);
        return aValue - bValue;
      });
      rows.forEach((row) => {
        table.appendChild(row);
      });
    });
  }

  function indexInitialiser() {
    // Get each unique tab element
    const allTabs = document.querySelectorAll("[data-tab-type][data-tab-name]");

    allTabs.forEach((isolatedTab) => {
      const type = isolatedTab.getAttribute("data-tab-type");
      const name = isolatedTab.getAttribute("data-tab-name");

      // Get ONLY direct children of data-tab-menu and data-tab-content
      const tabMenu = isolatedTab.querySelector("[data-tab-menu]");
      const tabContent = isolatedTab.querySelector("[data-tab-content]");

      const linksArray = tabMenu
        ? Array.from(tabMenu.children).filter((child) =>
            child.hasAttribute("data-tab-link"),
          )
        : [];
      const panesArray = tabContent
        ? Array.from(tabContent.children).filter((child) =>
            child.hasAttribute("data-tab-pane"),
          )
        : [];

      // Set indices based on array position
      linksArray.forEach((link, index) => {
        const linkIndex = index + 1;
        link.setAttribute("data-tab-link", linkIndex);
      });

      panesArray.forEach((pane, index) => {
        const paneIndex = index + 1;
        pane.setAttribute("data-tab-pane", paneIndex);
      });
    });
  }

  function tabInitialiser() {
    const allTabs = document.querySelectorAll("[data-tab-type][data-tab-name]");

    allTabs.forEach((tab) => {
      const type = tab.getAttribute("data-tab-type");
      const name = tab.getAttribute("data-tab-name");

      // Get menu and content containers
      const tabMenu = tab.querySelector("[data-tab-menu]");
      const tabContent = tab.querySelector("[data-tab-content]");

      // Show first link, hide others
      if (tabMenu && tabMenu.children.length > 0) {
        Array.from(tabMenu.children).forEach((link, index) => {
          if (index === 0) {
            link.setAttribute("data-tab-state", "show");
            link.classList.add("active");
          } else {
            link.setAttribute("data-tab-state", "hide");
            link.classList.remove("active");
          }
        });
      }

      // Show first pane, hide others
      if (tabContent && tabContent.children.length > 0) {
        Array.from(tabContent.children).forEach((pane, index) => {
          if (index === 0) {
            pane.setAttribute("data-tab-state", "show");
            // ANIMATE FIRST PANE ON LOAD
            if (window.elementAnimator) {
              window.elementAnimator(pane, "top 100%");
            }
          } else {
            pane.setAttribute("data-tab-state", "hide");
          }
        });
      }
    });

    // Initialize accordions after tab setup
    if (window.initializeAccordions) {
      window.initializeAccordions();
    }
    if (window.openFirstAccordion) {
      window.openFirstAccordion();
    }
  }

  function clickInitialiser() {
    const allTabs = document.querySelectorAll("[data-tab-type][data-tab-name]");

    allTabs.forEach((isolatedTab) => {
      const type = isolatedTab.getAttribute("data-tab-type");
      const name = isolatedTab.getAttribute("data-tab-name");

      // Get links from THIS isolated tab only (direct children)
      const tabMenu = isolatedTab.querySelector("[data-tab-menu]");
      const tabLinks = tabMenu
        ? Array.from(tabMenu.children).filter((child) =>
            child.hasAttribute("data-tab-link"),
          )
        : [];

      tabLinks.forEach((clickedLink) => {
        clickedLink.addEventListener("click", () => {
          const clickedIndex = clickedLink.getAttribute("data-tab-link");

          // Get ALL links and panes from THIS SAME isolated tab ONLY (direct children)
          const tabMenuContainer = isolatedTab.querySelector("[data-tab-menu]");
          const tabContentContainer =
            isolatedTab.querySelector("[data-tab-content]");

          const sameTabLinks = tabMenuContainer
            ? Array.from(tabMenuContainer.children).filter((child) =>
                child.hasAttribute("data-tab-link"),
              )
            : [];
          const sameTabPanes = tabContentContainer
            ? Array.from(tabContentContainer.children).filter((child) =>
                child.hasAttribute("data-tab-pane"),
              )
            : [];

          // Hide all other links in SAME tab, show clicked link
          sameTabLinks.forEach((link) => {
            if (link === clickedLink) {
              link.setAttribute("data-tab-state", "show");
              link.classList.add("active");
            } else {
              link.setAttribute("data-tab-state", "hide");
              link.classList.remove("active");
            }
          });

          // Hide all panes in SAME tab
          sameTabPanes.forEach((pane) => {
            pane.setAttribute("data-tab-state", "hide");
          });

          // Show corresponding pane in SAME tab (direct children)
          const targetPane =
            tabContentContainer &&
            tabContentContainer.children[clickedIndex - 1];
          if (targetPane) {
            targetPane.setAttribute("data-tab-state", "show");

            // ANIMATE THE TAB PANE WHEN IT BECOMES ACTIVE
            if (window.elementAnimator) {
              // Reset any existing GSAP properties first
              if (window.gsap) {
                window.gsap.set(targetPane, { clearProps: "all" });
              }

              // Animate the newly active pane
              window.elementAnimator(targetPane, "top 100%");
            } else {
              console.warn(
                "elementAnimator not available - ensure animation script loads first",
              );
            }

            // Reinitialize accordions for the newly visible tab pane
            setTimeout(() => {
              if (window.initializeAccordions) {
                window.initializeAccordions();
              }
              if (window.openFirstAccordion) {
                window.openFirstAccordion();
              }
            }, 50);
          } else {
            console.warn(
              `ERROR: No pane ${clickedIndex} found in ${type}/${name}`,
            );
          }
        });
      });
    });
  }

  setTimeout(() => {
    rowInitialiser();
    indexInitialiser();
    tabInitialiser();
    clickInitialiser();
  }, 100);
});

//Swiper
document.addEventListener("DOMContentLoaded", function () {
  var mySwiper = new Swiper("#platform-swiper", {
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 16,
    grabCursor: true,
    allowTouchMove: true,
    autoHeight: false,
    watchOverflow: true,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    centeredSlides: false,
    loop: true,
    loopedSlides: null,
    resistanceRatio: 0,
    pagination: {
      el: "#platform-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: "#platform-next",
      prevEl: "#platform-prev",
    },
    a11y: {
      enabled: true,
      prevSlideMessage: "Previous platform",
      nextSlideMessage: "Next platform",
      firstSlideMessage: "This is the first platform",
      lastSlideMessage: "This is the last platform",
      paginationBulletMessage: "Go to platform {{index}}",
      notificationClass: "swiper-notification",
      containerMessage: "Platforms carousel",
      containerRoleDescriptionMessage: "carousel",
      itemRoleDescriptionMessage: "platform slide",
      containerRole: null,
      slideRole: null,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    breakpoints: {
      0: {
        slidesPerView: 1.2,
        slidesPerGroup: 1,
        spaceBetween: 8,
      },
      480: {
        slidesPerView: 1.2,
        slidesPerGroup: 1,
        spaceBetween: 8,
      },
      767: {
        slidesPerView: 1.2,
        slidesPerGroup: 1,
        spaceBetween: 8,
      },
      992: {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 24,
      },
      1200: {
        slidesPerView: 2.2,
        slidesPerGroup: 1,
        spaceBetween: 24,
      },
      1920: {
        slidesPerView: 3.2,
        slidesPerGroup: 1,
        spaceBetween: 24,
      },
    },
  });
});
