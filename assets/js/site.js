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
      // 场景恒为 3 张卡 + 2 个间距高：项目不足 3 个时居中卡完整、相邻卡仍可见，
      // 项目多时不喧宾夺主，保证“一次只显示三个”
      const visible = 3;
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
      // “镜头对准中间”：先找出离场景中心最近的卡，强制它为完整态，
      // 其余卡仍按距离做曲面渐隐。项目只有 1 张时也始终满显示。
      let focusIndex = 0;
      let focusDist = Infinity;
      projectCards.forEach((card, index) => {
        const center = (cardBases[index] || 0) - projectDeck.scrollTop;
        const dist = Math.abs(center - mid);
        if (dist < focusDist) {
          focusDist = dist;
          focusIndex = index;
        }
      });
      projectCards.forEach((card, index) => {
        const center = (cardBases[index] || 0) - projectDeck.scrollTop;
        let t = Math.max(-1.15, Math.min(1.15, (center - mid) / mid));
        // 焦点卡附近做平滑回正：|t| < 0.35 时按比例收拢到完整态，避免硬切换跳变
        if (index === focusIndex) {
          const damp = Math.min(1, Math.abs(t) / 0.35);
          t *= damp;
        }
        const at = Math.abs(t);
        const scale = 1 - 0.1 * at;
        const tx = at * at * txMax;
        const rx = -t * 24;
        // 两端卡只做轻微渐隐（下限 0.55），保证始终可读，渐变遮罩负责边缘过渡
        const opacity = Math.max(0.55, 1 - 0.35 * at * at);
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

      // 等封面合拢(720+120ms)与书本滑回(780+100ms)走完再淡出场景，
      // 否则书还没关上就先消失了
      closeActiveTimer = window.setTimeout(() => {
        notebookModal.classList.remove("is-active");
      }, 880);

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
      }, reduceMotion.matches ? 20 : 1160);
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

  // ===== 关于页：滚动渐入 + 交互 =====
  const aboutPage = document.querySelector(".about-page");
  if (aboutPage) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // 1) 滚动渐入：给各区域加 .about-fade，进入视口时加 .is-visible
    const fadeTargets = aboutPage.querySelectorAll(
      ".about-hero, .about-section, .about-comments"
    );
    fadeTargets.forEach((el) => el.classList.add("about-fade"));

    if ("IntersectionObserver" in window) {
      const fadeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              fadeObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      fadeTargets.forEach((el) => fadeObserver.observe(el));
    } else {
      fadeTargets.forEach((el) => el.classList.add("is-visible"));
    }

    // 2) 区域标题下划线动画
    const sectionTitles = aboutPage.querySelectorAll(".about-section-title");
    if ("IntersectionObserver" in window) {
      const titleObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              titleObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      sectionTitles.forEach((el) => titleObserver.observe(el));
    } else {
      sectionTitles.forEach((el) => el.classList.add("is-visible"));
    }

    // 3) 标签行逐字打字效果（仅首屏，延迟后触发）
    const tagline = aboutPage.querySelector(".about-tagline");
    if (tagline && !reduceMotion.matches) {
      const text = tagline.textContent;
      tagline.textContent = "";
      tagline.style.opacity = "1";
      const chars = Array.from(text);
      chars.forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch;
        span.style.animationDelay = `${0.6 + i * 0.028}s`;
        tagline.appendChild(span);
      });
    }

    // 4) 联系按钮磁吸
    const contactBtns = aboutPage.querySelectorAll(".about-contact-btn");
    contactBtns.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        if (reduceMotion.matches) return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });

    // 5) 技能行标签依次浮现（滚动到技能区时）
    const skillSection = aboutPage.querySelector("#about-skills");
    if (skillSection && "IntersectionObserver" in window) {
      const rows = aboutPage.querySelectorAll(".skill-row");
      rows.forEach((row) => {
        row.style.opacity = "0";
        row.style.transform = "translateX(-16px)";
        row.style.transition = "opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)";
      });
      const rowObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              rows.forEach((row, i) => {
                setTimeout(() => {
                  row.style.opacity = "1";
                  row.style.transform = "translateX(0)";
                }, i * 120);
              });
              rowObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      rowObserver.observe(skillSection);
    }
  }

  // ===== 关于页卡通形象：眼球跟随鼠标 + 自然眨眼 =====
  const figure = document.querySelector('[data-figure]');
  if (figure) {
    const eyesEl = figure.querySelector('[data-figure-eyes]');
    const figureReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!figureReduce.matches && eyesEl) {
      const MAX_X = 4.2;
      const MAX_Y = 2.4;
      let mouseX = null;
      let mouseY = null;
      let lastMove = 0;
      let curX = 0;
      let curY = 0;
      let nextBlink = performance.now() + 1800 + Math.random() * 2400;
      let blinkStart = -1;

      window.addEventListener(
        'mousemove',
        (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          lastMove = performance.now();
        },
        { passive: true }
      );

      const tick = (now) => {
        let tgtX = 0;
        let tgtY = 0;
        if (mouseX !== null && now - lastMove < 4000) {
          const rect = figure.getBoundingClientRect();
          const eyeX = rect.left + rect.width * 0.5;
          const eyeY = rect.top + rect.height * 0.34;
          const dx = mouseX - eyeX;
          const dy = mouseY - eyeY;
          const dist = Math.hypot(dx, dy);
          if (dist > 1) {
            const pull = Math.min(1, dist / 240);
            tgtX = (dx / dist) * MAX_X * pull;
            tgtY = (dy / dist) * MAX_Y * pull;
          }
        }
        curX += (tgtX - curX) * 0.14;
        curY += (tgtY - curY) * 0.14;

        let scaleY = 1;
        if (blinkStart < 0 && now >= nextBlink) blinkStart = now;
        if (blinkStart >= 0) {
          const bt = (now - blinkStart) / 150;
          if (bt >= 1) {
            blinkStart = -1;
            nextBlink = now + 2200 + Math.random() * 3600;
          } else {
            scaleY = 1 - Math.sin(Math.PI * bt) * 0.9;
          }
        }

        eyesEl.style.transform =
          'translate(' + curX.toFixed(2) + 'px, ' + curY.toFixed(2) + 'px) scaleY(' + scaleY.toFixed(3) + ')';
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // ===== 留言板：GitHub Issues 公开 API（免配置，标题前缀【留言】过滤） =====
  const guestbook = document.querySelector("[data-guestbook]");
  if (guestbook) {
    const gbForm = guestbook.querySelector("[data-guestbook-form]");
    const gbInput = guestbook.querySelector("[data-guestbook-input]");
    const gbNote = guestbook.querySelector("[data-guestbook-note]");
    const gbList = guestbook.querySelector("[data-guestbook-list]");
    const GB_REPO = "zhousizhao/zhousizhao.github.io";
    const GB_PREFIX = "【留言】";
    const GB_CACHE_KEY = "guestbook-cache-v1";
    const GB_CACHE_TTL = 5 * 60 * 1000;

    const escapeHtml = (str) =>
      str.replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch]));

    const formatTime = (iso) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${mm}-${dd}`;
    };

    const renderStatus = (html) => {
      gbList.innerHTML = `<p class="guestbook-status">${html}</p>`;
    };

    const renderMessages = (items) => {
      if (!items.length) {
        renderStatus("还没有留言，来抢个沙发。");
        return;
      }
      gbList.innerHTML = "";
      items.forEach((item) => {
        const el = document.createElement("div");
        el.className = "guestbook-item";

        const avatar = document.createElement("div");
        avatar.className = "guestbook-avatar";
        const login = item.user || "访客";
        if (item.avatar && /^https:\/\//.test(item.avatar)) {
          const img = document.createElement("img");
          img.src = item.avatar;
          img.alt = "";
          img.loading = "lazy";
          img.addEventListener("error", () => {
            img.remove();
            avatar.textContent = login.trim().charAt(0).toUpperCase();
          });
          avatar.appendChild(img);
        } else {
          avatar.textContent = login.trim().charAt(0).toUpperCase();
        }

        const body = document.createElement("div");
        const meta = document.createElement("div");
        meta.className = "guestbook-meta";
        const nameEl = document.createElement("span");
        nameEl.className = "guestbook-name";
        nameEl.textContent = login;
        const timeEl = document.createElement("time");
        timeEl.className = "guestbook-time";
        timeEl.textContent = formatTime(item.created_at);
        meta.appendChild(nameEl);
        meta.appendChild(timeEl);
        const text = document.createElement("p");
        text.className = "guestbook-text";
        text.innerHTML = escapeHtml(item.body || "")
          .replace(/\n{2,}/g, "<br><br>")
          .replace(/\n/g, "<br>");
        body.appendChild(meta);
        body.appendChild(text);

        el.appendChild(avatar);
        el.appendChild(body);
        gbList.appendChild(el);
      });
    };

    const readCache = () => {
      try {
        const raw = sessionStorage.getItem(GB_CACHE_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (Date.now() - cached.t > GB_CACHE_TTL) return null;
        return cached.items;
      } catch (e) {
        return null;
      }
    };

    const writeCache = (items) => {
      try {
        sessionStorage.setItem(GB_CACHE_KEY, JSON.stringify({ t: Date.now(), items }));
      } catch (e) {
        /* 缓存不可用则跳过 */
      }
    };

    const loadMessages = async () => {
      const cached = readCache();
      if (cached) {
        renderMessages(cached);
        return;
      }
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GB_REPO}/issues?state=open&per_page=100`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = data
          .filter(
            (it) =>
              !it.pull_request &&
              typeof it.title === "string" &&
              it.title.startsWith(GB_PREFIX)
          )
          .map((it) => ({
            user: it.user && it.user.login ? it.user.login : "访客",
            avatar: it.user && it.user.avatar_url ? it.user.avatar_url : "",
            created_at: it.created_at,
            body: it.body || "",
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        writeCache(items);
        renderMessages(items);
      } catch (e) {
        renderStatus(
          `留言加载失败，也可以直接到 <a href="https://github.com/${GB_REPO}/issues" target="_blank" rel="noopener">GitHub Issues</a> 查看。`
        );
      }
    };

    loadMessages();

    if (gbForm && gbInput) {
      gbForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = gbInput.value.trim();
        if (!text) return;
        const url =
          `https://github.com/${GB_REPO}/issues/new` +
          `?title=${encodeURIComponent(GB_PREFIX)}` +
          `&body=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener");
        gbInput.value = "";
        if (gbNote) gbNote.hidden = false;
        try {
          sessionStorage.removeItem(GB_CACHE_KEY);
        } catch (err) {
          /* ignore */
        }
      });
    }
  }
})();
