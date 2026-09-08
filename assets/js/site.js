(() => {
  const documentElement = document.documentElement;
  documentElement.classList.add("js");

  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  const closeMobileNav = () => {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开导航菜单");
    mobileNav.hidden = true;
  };

  navToggle?.addEventListener("click", () => {
    if (!mobileNav) return;
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "打开导航菜单" : "关闭导航菜单");
    mobileNav.hidden = isOpen;
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMobileNav();
  }, { passive: true });

  const filterButtons = document.querySelectorAll("[data-filter]");
  const postItems = document.querySelectorAll(".post-item[data-category]");
  const emptyState = document.querySelector("[data-empty-state]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      postItems.forEach((post) => {
        const shouldShow = category === "all" || post.dataset.category === category;
        post.hidden = !shouldShow;
        if (shouldShow) visibleCount += 1;
      });

      if (emptyState) emptyState.hidden = visibleCount !== 0;
    });
  });

  const tiltTarget = document.querySelector("[data-tilt]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  if (tiltTarget && !reduceMotion.matches && finePointer.matches) {
    const hero = tiltTarget.closest(".home-hero");
    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const applyTilt = () => {
      frame = 0;
      tiltTarget.style.setProperty("--rx", `${8 - nextY * 7}deg`);
      tiltTarget.style.setProperty("--ry", `${-13 + nextX * 10}deg`);
    };

    hero?.addEventListener("pointermove", (event) => {
      if (window.innerWidth <= 760) return;
      const rect = hero.getBoundingClientRect();
      nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!frame) frame = window.requestAnimationFrame(applyTilt);
    });

    hero?.addEventListener("pointerleave", () => {
      tiltTarget.style.setProperty("--rx", "8deg");
      tiltTarget.style.setProperty("--ry", "-13deg");
    });
  }

  const shelfScene = document.querySelector("[data-shelf-scene]");
  const shelfTilt = document.querySelector("[data-bookshelf-tilt]");

  if (shelfScene && shelfTilt && !reduceMotion.matches && finePointer.matches) {
    let shelfFrame = 0;
    let shelfX = 0;
    let shelfY = 0;

    const applyShelfTilt = () => {
      shelfFrame = 0;
      shelfTilt.style.setProperty("--shelf-rx", `${7 - shelfY * 5}deg`);
      shelfTilt.style.setProperty("--shelf-ry", `${-9 + shelfX * 8}deg`);
    };

    shelfScene.addEventListener("pointermove", (event) => {
      if (window.innerWidth <= 760) return;
      const rect = shelfScene.getBoundingClientRect();
      shelfX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      shelfY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!shelfFrame) shelfFrame = window.requestAnimationFrame(applyShelfTilt);
    });

    shelfScene.addEventListener("pointerleave", () => {
      shelfTilt.style.setProperty("--shelf-rx", "7deg");
      shelfTilt.style.setProperty("--shelf-ry", "-9deg");
    });
  }

  const projectScene = document.querySelector("[data-project-scene]");
  const projectDeck = document.querySelector("[data-project-deck]");
  const projectCards = projectDeck
    ? Array.from(projectDeck.querySelectorAll(".project-card"))
    : [];
  // 项目区使用手表式曲面滚动：一次展示 3 张，两端透明内凹，中间完整
  const projectCurved =
    projectScene && projectDeck && projectCards.length > 0 && !reduceMotion.matches;

  if (projectCurved) {
    projectScene.classList.add("is-curved");
    let curveFrame = 0;
    let cardBases = [];

    // offsetTop 的参照系不可靠（preserve-3d 会让 offsetParent 跳过 deck），
    // 手动沿 offsetParent 链累加到 deck，拿到含 padding 的真实未滚动位置
    const offsetWithinDeck = (el) => {
      let y = 0;
      let node = el;
      while (node && node !== projectDeck) {
        y += node.offsetTop;
        node = node.offsetParent;
      }
      return y;
    };

    const layoutCurve = () => {
      const cardH = projectCards[0] ? projectCards[0].offsetHeight : 0;
      if (!cardH) return;
      const gap = parseFloat(getComputedStyle(projectDeck.querySelector(".project-grid")).rowGap) || 0;
      const visible = Math.min(3, projectCards.length);
      // 场景高度精确等于 3 张卡 + 2 个间距，保证“一次只显示三个”
      projectScene.style.height = `${Math.round(cardH * visible + gap * (visible - 1))}px`;
      const viewH = projectScene.clientHeight;
      const pad = Math.max(0, viewH / 2 - cardH / 2);
      projectDeck.style.paddingTop = `${pad}px`;
      projectDeck.style.paddingBottom = `${pad}px`;
      // padding 落定后再缓存每张卡的中心位置，滚动帧里只读 scrollTop
      cardBases = projectCards.map((card) => offsetWithinDeck(card) + card.offsetHeight / 2);
    };

    const applyCurve = () => {
      curveFrame = 0;
      const viewH = projectScene.clientHeight;
      const mid = viewH / 2;
      const txMax = Math.min(64, projectScene.clientWidth * 0.07);
      projectCards.forEach((card, index) => {
        const center = (cardBases[index] || 0) - projectDeck.scrollTop;
        const t = Math.max(-1.15, Math.min(1.15, (center - mid) / mid));
        const at = Math.abs(t);
        const scale = 1 - 0.14 * at;
        const tx = at * at * txMax;
        const rx = -t * 30;
        const opacity = Math.max(0.3, 1 - 0.55 * at * at);
        card.style.transform = `translateX(${tx.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(2);
        card.style.zIndex = String(100 - Math.round(at * 50));
      });
    };

    const requestCurve = () => {
      if (!curveFrame) curveFrame = window.requestAnimationFrame(applyCurve);
    };

    layoutCurve();
    applyCurve();
    projectDeck.addEventListener("scroll", requestCurve, { passive: true });
    window.addEventListener("resize", () => {
      layoutCurve();
      requestCurve();
    });
    // 字体/图片加载后卡高可能变化，重新量一次
    window.addEventListener("load", () => {
      layoutCurve();
      requestCurve();
    });

    // 鼠标拖动滚动（触屏走原生滚动）
    let dragStartY = 0;
    let dragStartScroll = 0;
    let dragging = false;
    let dragMoved = false;

    projectDeck.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse") return;
      dragging = true;
      dragMoved = false;
      dragStartY = event.clientY;
      dragStartScroll = projectDeck.scrollTop;
      projectDeck.classList.add("is-dragging");
    });

    window.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dy = event.clientY - dragStartY;
      if (Math.abs(dy) > 4) dragMoved = true;
      projectDeck.scrollTop = dragStartScroll - dy;
    });

    window.addEventListener("pointerup", () => {
      dragging = false;
      projectDeck.classList.remove("is-dragging");
    });

    // 拖动结束后拦截误触发的卡片点击
    projectDeck.addEventListener(
      "click",
      (event) => {
        if (dragMoved) {
          event.preventDefault();
          event.stopPropagation();
          dragMoved = false;
        }
      },
      true
    );
  }

  const notebookModal = document.querySelector("[data-notebook-modal]");
  const shelfBooks = document.querySelectorAll("[data-book-category]");
  const shelfBookList = document.querySelector(".shelf-books");

  if (shelfBookList) {
    const updateShelfOverflow = () => {
      shelfBookList.classList.toggle(
        "has-overflow",
        shelfBookList.scrollWidth > shelfBookList.clientWidth + 1
      );
    };

    updateShelfOverflow();
    window.addEventListener("resize", updateShelfOverflow, { passive: true });
    window.setTimeout(updateShelfOverflow, 250);
  }

  if (notebookModal && shelfBooks.length) {
    const notebookScene = notebookModal.querySelector(".notebook-scene");
    const notebookPages = notebookModal.querySelectorAll(".notebook-page, .notebook-cover-back");
    const notebookCover = notebookModal.querySelector("[data-notebook-cover]");
    const modalCategory = notebookModal.querySelector("[data-modal-category]");
    const modalDescription = notebookModal.querySelector("[data-modal-description]");
    const modalCount = notebookModal.querySelector("[data-modal-count]");
    const modalPosts = notebookModal.querySelectorAll("[data-modal-post]");
    const modalEmpty = notebookModal.querySelector("[data-modal-empty]");
    const coverTitle = notebookModal.querySelector("[data-cover-title]");
    const closeButtons = notebookModal.querySelectorAll("[data-notebook-close]");
    const primaryClose = notebookModal.querySelector(".notebook-close");
    let activeBook = null;
    let previousFocus = null;
    let openTimer = 0;
    let focusTimer = 0;
    let closeActiveTimer = 0;
    let closeHiddenTimer = 0;

    notebookScene?.setAttribute("tabindex", "-1");

    const setPagesInert = (isInert) => {
      notebookPages.forEach((page) => {
        page.inert = isInert;
      });
    };

    setPagesInert(true);

    const clearNotebookTimers = () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(focusTimer);
      window.clearTimeout(closeActiveTimer);
      window.clearTimeout(closeHiddenTimer);
    };

    const updateNotebookContent = (book) => {
      const category = book.dataset.bookCategory || "工程笔记";
      const description = book.dataset.bookDescription || "围绕这个主题持续整理问题、验证过程和最终结论。";
      const bookStyle = window.getComputedStyle(book);
      let visibleCount = 0;

      notebookCover?.style.setProperty("--active-book-color", bookStyle.getPropertyValue("--book-color").trim());
      notebookCover?.style.setProperty("--active-book-dark", bookStyle.getPropertyValue("--book-dark").trim());

      modalPosts.forEach((post) => {
        const shouldShow = post.dataset.category === category;
        post.hidden = !shouldShow;
        if (shouldShow) visibleCount += 1;
      });

      if (modalCategory) modalCategory.textContent = category;
      if (modalDescription) modalDescription.textContent = description;
      if (modalCount) modalCount.textContent = String(visibleCount);
      if (coverTitle) coverTitle.textContent = category;
      if (modalEmpty) modalEmpty.hidden = visibleCount !== 0;
    };

    const closeNotebook = ({ returnFocus = true } = {}) => {
      if (notebookModal.hidden) return;
      clearNotebookTimers();
      setPagesInert(true);
      notebookModal.classList.remove("is-open");

      closeActiveTimer = window.setTimeout(() => {
        notebookModal.classList.remove("is-active");
      }, 260);

      closeHiddenTimer = window.setTimeout(() => {
        notebookModal.hidden = true;
        document.body.classList.remove("modal-open");
        shelfBooks.forEach((book) => {
          book.classList.remove("is-selected");
          book.setAttribute("aria-pressed", "false");
        });
        if (returnFocus && previousFocus instanceof HTMLElement) {
          previousFocus.focus({ preventScroll: true });
        }
        activeBook = null;
      }, reduceMotion.matches ? 20 : 720);
    };

    const openNotebook = (book) => {
      clearNotebookTimers();
      closeMobileNav();
      previousFocus = document.activeElement;
      activeBook = book;
      updateNotebookContent(book);
      setPagesInert(true);

      shelfBooks.forEach((item) => {
        const isActive = item === book;
        item.classList.toggle("is-selected", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      notebookModal.hidden = false;
      document.body.classList.add("modal-open");
      window.requestAnimationFrame(() => {
        notebookModal.classList.add("is-active");
        notebookScene?.focus({ preventScroll: true });
      });

      openTimer = window.setTimeout(() => {
        notebookModal.classList.add("is-open");
      }, reduceMotion.matches ? 0 : 160);

      focusTimer = window.setTimeout(() => {
        setPagesInert(false);
        primaryClose?.focus({ preventScroll: true });
      }, reduceMotion.matches ? 30 : 900);
    };

    shelfBooks.forEach((book) => {
      book.addEventListener("click", () => openNotebook(book));
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", () => closeNotebook());
    });

    document.addEventListener("keydown", (event) => {
      if (notebookModal.hidden) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeNotebook();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        notebookModal.querySelectorAll(".notebook-scene a[href], .notebook-scene button:not([disabled])")
      ).filter((element) => !element.hidden && !element.closest("[inert]") && element.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  const avatar = document.querySelector("[data-avatar]");
  const avatarShell = document.querySelector("[data-avatar-shell]");
  avatar?.addEventListener("error", () => {
    avatarShell?.classList.add("avatar-missing");
  }, { once: true });
  if (avatar?.complete && avatar.naturalWidth === 0) {
    avatarShell?.classList.add("avatar-missing");
  }

  const tiltCards = document.querySelectorAll("[data-tilt-card]");

  if (tiltCards.length && !reduceMotion.matches && finePointer.matches) {
    tiltCards.forEach((card) => {
      let cardFrame = 0;
      let cardX = 0;
      let cardY = 0;

      const applyCardTilt = () => {
        cardFrame = 0;
        card.style.setProperty("--prx", `${(-cardY * 5).toFixed(2)}deg`);
        card.style.setProperty("--pry", `${(cardX * 6).toFixed(2)}deg`);
      };

      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        cardX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        cardY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        if (!cardFrame) cardFrame = window.requestAnimationFrame(applyCardTilt);
      });

      card.addEventListener("pointerleave", () => {
        if (cardFrame) {
          window.cancelAnimationFrame(cardFrame);
          cardFrame = 0;
        }
        card.style.setProperty("--prx", "0deg");
        card.style.setProperty("--pry", "0deg");
      });
    });
  }

  const postContent = document.querySelector(".post-content");
  const tocDesktop = document.querySelector("[data-post-toc-desktop]");
  const tocMobile = document.querySelector("[data-post-toc-mobile]");

  if (postContent && (tocDesktop || tocMobile)) {
    const headings = Array.from(postContent.querySelectorAll("h2, h3"));

    if (headings.length >= 2) {
      headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `section-${index + 1}`;
      });

      const buildLinks = (nav) => {
        const fragment = document.createDocumentFragment();
        headings.forEach((heading) => {
          const link = document.createElement("a");
          link.href = `#${heading.id}`;
          link.textContent = heading.textContent.trim();
          link.dataset.tocTarget = heading.id;
          if (heading.tagName === "H3") link.classList.add("toc-h3");
          fragment.appendChild(link);
        });
        nav.appendChild(fragment);
      };

      if (tocDesktop) buildLinks(tocDesktop);
      if (tocMobile) {
        buildLinks(tocMobile);
        tocMobile.addEventListener("click", (event) => {
          if (event.target.closest("a")) {
            tocMobile.closest("details")?.removeAttribute("open");
          }
        });
      }

      document.querySelector("[data-post-toc]")?.removeAttribute("hidden");
      document.querySelector("[data-post-toc-inline]")?.removeAttribute("hidden");

      const tocLinks = Array.from(document.querySelectorAll(".post-toc-list a"));
      let activeId = "";

      const setActiveHeading = (id) => {
        if (id === activeId) return;
        activeId = id;
        tocLinks.forEach((link) => {
          link.classList.toggle("is-active", link.dataset.tocTarget === id);
        });
      };

      const updateTocOnScroll = () => {
        const fromTop = window.scrollY + 120;
        let current = headings[0].id;
        headings.forEach((heading) => {
          if (heading.offsetTop <= fromTop) current = heading.id;
        });
        setActiveHeading(current);
      };

      updateTocOnScroll();
      window.addEventListener("scroll", updateTocOnScroll, { passive: true });
      window.addEventListener("resize", updateTocOnScroll, { passive: true });
    }
  }

  const progressBar = document.querySelector(".article-progress span");
  if (progressBar) {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
  }
})();
