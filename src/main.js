$(document).ready(function () {
  // =============================
  // Application State
  // =============================
  let tasks = JSON.parse(sessionStorage.getItem("todos")) || [];
  let deletedTask = null;
  let deletedTaskIndex = null;
  let undoTimeout = null;
  let currentFilter = "همه";
  let currentSearch = "";
  let currentTheme = "dark";
  let currentTag = {
    label: "شخصی",
    icon: "bi-person-fill",
    color: "text-blue-500",
  };

  // =============================
  // Persian Quotes Data
  // =============================
  const quotes = [
    { text: "هنر برتر از گوهر آمد پدید", author: "فردوسی" },
    { text: "توانا بود هر که دانا بود", author: "فردوسی" },
    { text: "مباش در پی آزار و هر چه خواهی کن", author: "سعدی" },
    { text: "بنی آدم اعضای یکدیگرند", author: "سعدی" },
    { text: "پندار نیک، گفتار نیک، کردار نیک", author: "زرتشت" },
    { text: "کار امروز را به فردا میفکن", author: "بزرگمهر" },
    { text: "خرد، روشنایی جان است", author: "کوروش بزرگ" },
    { text: "از تو حرکت، از خدا برکت", author: "مولانا" },
    {
      text: "هیچ چیز در دنیا ارزشمندتر از دانش نیست",
      author: "ابن سینا",
    },
    { text: "شادی، کلید سلامت تن و روان است", author: "ابوعلی سینا" },
    {
      text: "آنچه را نمی‌خواهی به تو کنند، به دیگران مکن",
      author: "کوروش بزرگ",
    },
    { text: "صبر، تلخ است اما میوه شیرین دارد", author: "سعدی" },
  ];

  function getDailyQuote() {
    const today = new Date().toDateString();
    const stored = sessionStorage.getItem("dailyQuote");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed.quote;
    }
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    sessionStorage.setItem(
      "dailyQuote",
      JSON.stringify({ date: today, quote }),
    );
    return quote;
  }

  // =============================
  // Initial Setup
  // =============================
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  $("#date-display").text(new Date().toLocaleDateString("fa-IR", options));
  const dailyQuote = getDailyQuote();
  $("#dailyQuoteText").text(`«${dailyQuote.text}»`);
  $("#dailyQuoteAuthor").text(`ـ ${dailyQuote.author}`);

  // =============================
  // Theme System (Dark & Achaemenid)
  // =============================
  const themes = {
    dark: {
      name: "تاریک",
      icon: "bi-moon-fill",
      colors: {
        bg: "#1a1a2e",
        card: "#22223a",
        primary: "#d4af37",
        accent: "#c5a059",
        text: "#e0d7c6",
        muted: "#7a7a8a",
        border: "#2d2d44",
        shadow: "rgba(0,0,0,0.2)",
        "btn-text": "#1a1a2e",
      },
    },
    achaemenid: {
      name: "هخامنشی",
      icon: "bi-shield-shaded",
      colors: {
        bg: "#f4efe1",
        card: "#fffaf0",
        primary: "#1a2a44",
        accent: "#c5a059",
        text: "#3a3226",
        muted: "#8b7a62",
        border: "#d6c8a8",
        shadow: "rgba(0,0,0,0.04)",
        "btn-text": "#ffffff",
      },
    },
  };

  function applyTheme(themeName) {
    currentTheme = themeName;
    const theme = themes[themeName];
    const colors = theme.colors;
    document.documentElement.style.setProperty("--bg-color", colors.bg);
    document.documentElement.style.setProperty("--card-color", colors.card);
    document.documentElement.style.setProperty(
      "--primary-color",
      colors.primary,
    );
    document.documentElement.style.setProperty("--accent-color", colors.accent);
    document.documentElement.style.setProperty("--text-color", colors.text);
    document.documentElement.style.setProperty("--muted-color", colors.muted);
    document.documentElement.style.setProperty("--border-color", colors.border);
    document.documentElement.style.setProperty("--shadow-color", colors.shadow);
    document.documentElement.style.setProperty(
      "--btn-text",
      colors["btn-text"],
    );
    $("body").css("background-color", colors.bg);
    $("body").css("color", colors.text);
    $("#themeSelector span").text(theme.name);
    $("#themeSelector i").attr("class", `bi ${theme.icon}`);
    sessionStorage.setItem("theme", themeName);
    renderTasks();
  }

  applyTheme(sessionStorage.getItem("theme") || "dark");

  $("#themeSelector").on("click", function () {
    const next = currentTheme === "dark" ? "achaemenid" : "dark";
    applyTheme(next);
    gsap.from("body", { opacity: 0.8, duration: 0.4 });
  });

  // =============================
  // Session Storage Info
  // =============================
  function updateSessionInfo() {
    const json = sessionStorage.getItem("todos") || "";
    const bytes = new Blob([json]).size;
    const kb = (bytes / 1024).toFixed(2);
    $("#sessionSize").text(`${kb} KB`);
    $("#sessionItems").text(tasks.length.toLocaleString("fa-IR"));
  }

  // =============================
  // Custom Confirm Modal
  // =============================
  function customConfirm(message, onConfirm) {
    $("#customConfirmModal").remove();
    const modal = $(`
          <div id="customConfirmModal" class="fixed inset-0 z-[300] flex items-center justify-center p-4" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);">
            <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
              <div class="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <i class="bi bi-exclamation-triangle text-2xl text-red-500"></i>
              </div>
              <h3 class="text-lg font-black text-slate-800 mb-2">هشدار</h3>
              <p class="text-sm text-gray-500 mb-6">${message}</p>
              <div class="flex gap-3">
                <button id="confirmCancel" class="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">انصراف</button>
                <button id="confirmOk" class="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-all">تأیید</button>
              </div>
            </div>
          </div>
        `);
    $("body").append(modal);
    gsap.from("#customConfirmModal > div", {
      scale: 0.7,
      opacity: 0,
      duration: 0.25,
      ease: "back.out(1.5)",
    });

    function closeModal() {
      gsap.to("#customConfirmModal", {
        opacity: 0,
        duration: 0.15,
        onComplete: () => $("#customConfirmModal").remove(),
      });
    }
    $("#confirmCancel, #customConfirmModal").on("click", function (e) {
      if (e.target === this || $(this).is("#confirmCancel")) closeModal();
    });
    $("#confirmOk").on("click", () => {
      closeModal();
      if (onConfirm) onConfirm();
    });
  }

  // =============================
  // Clear All Tasks
  // =============================
  $("#clearSessionBtn").on("click", function () {
    if (tasks.length === 0) return;
    customConfirm(
      "آیا از پاک‌سازی کامل حافظه اطمینان دارید؟ همه وظایف برای همیشه حذف خواهند شد.",
      () => {
        tasks = [];
        deletedTask = null;
        sessionStorage.removeItem("todos");
        renderTasks();
        updateSessionInfo();
      },
    );
  });

  // =============================
  // Backup & Restore
  // =============================
  $("#backupBtn").on("click", function () {
    const backup = {
      tasks,
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    };
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toLocaleDateString("fa-IR").replace(/\//g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    gsap.from("#backupBtn", {
      scale: 1.2,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
    });
  });

  $("#restoreInput").on("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.tasks && Array.isArray(backup.tasks)) {
          customConfirm(
            `فایل پشتیبان شامل ${backup.tasks.length} وظیفه است. جایگزین وظایف فعلی شود؟`,
            () => {
              tasks = backup.tasks;
              sessionStorage.setItem("todos", JSON.stringify(tasks));
              renderTasks();
              updateSessionInfo();
            },
          );
        } else {
          alert("فایل پشتیبان نامعتبر است.");
        }
      } catch (err) {
        alert("خطا در خواندن فایل پشتیبان.");
      }
    };
    reader.readAsText(file);
    this.value = "";
  });

  // =============================
  // Filter & Search
  // =============================
  function getFilteredTasks() {
    let filtered = [...tasks];
    if (currentFilter === "انجام شده")
      filtered = filtered.filter((t) => t.completed);
    else if (currentFilter === "فعال")
      filtered = filtered.filter((t) => !t.completed);
    else if (currentFilter === "شخصی")
      filtered = filtered.filter((t) => t.tagLabel === "شخصی");
    else if (currentFilter === "کاری")
      filtered = filtered.filter((t) => t.tagLabel === "کاری");
    else if (currentFilter === "ضروری")
      filtered = filtered.filter((t) => t.tagLabel === "ضروری");

    if (currentSearch.trim() !== "") {
      const s = currentSearch.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.desc && t.desc.toLowerCase().includes(s)) ||
          t.tagLabel.toLowerCase().includes(s),
      );
    }
    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return filtered;
  }

  $("#searchInput").on("input", function () {
    currentSearch = $(this).val();
    renderTasks();
  });

  $(".filter-btn").on("click", function () {
    currentFilter = $(this).data("filter");
    $(".filter-btn").css({
      background: "var(--border-color)",
      color: "var(--muted-color)",
    });
    $(this).css({
      background: "var(--primary-color)",
      color: "#fff",
    });
    renderTasks();
  });

  // =============================
  // Tag Dropdown
  // =============================
  $("#dropdownTrigger").on("click", (e) => {
    e.stopPropagation();
    $("#customDropdown").fadeToggle(150);
  });
  $(".tag-opt").on("click", function () {
    currentTag = {
      label: $(this).data("val"),
      icon: $(this).data("icon"),
      color: $(this).data("color"),
    };
    $("#selectedLabel").text(currentTag.label);
    $("#selectedIcon").attr(
      "class",
      `bi ${currentTag.icon} ${currentTag.color}`,
    );
    $("#customDropdown").hide();
  });
  $(document).on("click", () => $("#customDropdown").hide());

  // =============================
  // Render Tasks
  // =============================
  function renderTasks() {
    const $list = $("#taskList").empty();
    const filtered = getFilteredTasks();
    $("#task-count").text(
      `${filtered.length.toLocaleString("fa-IR")} / ${tasks.length.toLocaleString("fa-IR")}`,
    );
    updateSessionInfo();

    if (filtered.length === 0) {
      $list.append(`
            <div class="text-center py-16" style="color: var(--muted-color)">
              <i class="bi bi-inbox text-5xl block mb-4"></i>
              <p class="text-sm">هیچ وظیفه‌ای یافت نشد</p>
            </div>
          `);
      return;
    }

    filtered.forEach((task) => {
      const hasDesc = task.desc && task.desc.trim() !== "";
      const hasSubtasks = task.subtasks && task.subtasks.length > 0;
      const completedSubtasks = task.subtasks
        ? task.subtasks.filter((st) => st.completed).length
        : 0;
      const tagBorderClass =
        task.tagLabel === "شخصی"
          ? "tag-personal"
          : task.tagLabel === "کاری"
            ? "tag-work"
            : "tag-urgent";

      const $item = $(`
            <div class="task-card group p-3 flex flex-col gap-2 ${tagBorderClass} ${task.pinned ? "border-[#d4af37]" : ""}" draggable="true" data-id="${task.id}">
              <div class="flex items-center gap-3">
                <div class="handle opacity-0 group-hover:opacity-100 text-gray-300 cursor-grab transition-all">
                  <i class="bi bi-grip-vertical text-xl"></i>
                </div>
                <div class="cursor-pointer flex items-center justify-center w-5 h-5 rounded border-2 ${task.completed ? "bg-[#1a2a44] border-[#1a2a44]" : "border-gray-200"}" onclick="toggleComplete('${task.id}')">
                  <i class="bi bi-check text-white text-xs ${task.completed ? "" : "hidden"}"></i>
                </div>
                <div class="flex-grow flex items-center gap-3 min-w-0">
                  ${task.pinned ? '<i class="bi bi-pin-angle-fill text-red-500 text-xs"></i>' : ""}
                  <span class="text-sm font-medium truncate ${task.completed ? "text-gray-300 line-through" : ""}" style="color: ${task.completed ? "" : "var(--text-color)"}">${task.title}</span>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded opacity-60 whitespace-nowrap" style="background: var(--border-color); color: var(--muted-color);">${task.tagLabel}</span>
                  ${hasSubtasks ? `<span class="text-[9px]" style="color: var(--muted-color);">${completedSubtasks}/${task.subtasks.length}</span>` : ""}
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onclick="pinTask('${task.id}')" class="p-1 hover:text-red-500" style="color: var(--muted-color);" title="پین"><i class="bi bi-pin${task.pinned ? "-fill text-red-500" : ""} text-xs"></i></button>
                  ${hasDesc || hasSubtasks ? `<button onclick="toggleDetails('${task.id}')" class="p-1 hover:text-[#1a2a44]" style="color: var(--muted-color);"><i class="bi bi-chevron-down text-xs"></i></button>` : ""}
                  <button onclick="deleteTask('${task.id}')" class="p-1 hover:text-red-500" style="color: var(--muted-color);"><i class="bi bi-x-lg text-xs"></i></button>
                </div>
              </div>
              <div class="details hidden pr-14 pl-4 py-2 text-xs flex flex-col gap-2 border-r-2 mt-1" style="border-color: var(--border-color); color: var(--muted-color)">
                ${task.desc ? `<p>${task.desc}</p>` : ""}
                ${
                  hasSubtasks
                    ? `
                  <div class="subtasks space-y-1">
                    ${task.subtasks
                      .map(
                        (st) => `
                      <div class="flex items-center gap-2 ${st.completed ? "opacity-50" : ""}">
                        <div class="cursor-pointer w-4 h-4 rounded border ${st.completed ? "bg-[#1a2a44] border-[#1a2a44]" : "border-gray-300"}" onclick="toggleSubtask('${task.id}','${st.id}')">
                          ${st.completed ? '<i class="bi bi-check text-white text-[8px] flex items-center justify-center"></i>' : ""}
                        </div>
                        <span class="${st.completed ? "line-through" : ""}">${st.title}</span>
                        <button onclick="deleteSubtask('${task.id}','${st.id}')" class="hover:text-red-400 mr-auto" style="color: var(--muted-color);"><i class="bi bi-x text-xs"></i></button>
                      </div>
                    `,
                      )
                      .join("")}
                    <div class="flex items-center gap-2 mt-2">
                      <input type="text" class="subtask-input text-xs border-b outline-none bg-transparent flex-grow" placeholder="زیروظیفه جدید..." style="border-color: var(--border-color); color: var(--text-color);" data-task-id="${task.id}" />
                      <button class="add-subtask-btn font-bold" style="color: var(--accent-color);" data-task-id="${task.id}">+</button>
                    </div>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          `);
      $list.append($item);
    });

    initDragAndDrop();
    initSubtaskListeners();
  }

  // =============================
  // Subtask Management
  // =============================
  function initSubtaskListeners() {
    $(".subtask-input")
      .off("keypress")
      .on("keypress", function (e) {
        if (e.which === 13) {
          const taskId = $(this).data("task-id");
          const title = $(this).val().trim();
          if (title) addSubtask(taskId, title);
          $(this).val("");
        }
      });
    $(".add-subtask-btn")
      .off("click")
      .on("click", function () {
        const taskId = $(this).data("task-id");
        const input = $(`.subtask-input[data-task-id="${taskId}"]`);
        const title = input.val().trim();
        if (title) addSubtask(taskId, title);
        input.val("");
      });
  }

  function addSubtask(taskId, title) {
    const task = tasks.find((t) => t.id == taskId);
    if (!task) return;
    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push({ id: Date.now(), title, completed: false });
    sessionStorage.setItem("todos", JSON.stringify(tasks));
    renderTasks();
  }

  window.toggleSubtask = function (taskId, subtaskId) {
    const task = tasks.find((t) => t.id == taskId);
    if (!task?.subtasks) return;
    const subtask = task.subtasks.find((st) => st.id == subtaskId);
    if (subtask) {
      subtask.completed = !subtask.completed;
      sessionStorage.setItem("todos", JSON.stringify(tasks));
      renderTasks();
    }
  };

  window.deleteSubtask = function (taskId, subtaskId) {
    const task = tasks.find((t) => t.id == taskId);
    if (!task?.subtasks) return;
    task.subtasks = task.subtasks.filter((st) => st.id != subtaskId);
    sessionStorage.setItem("todos", JSON.stringify(tasks));
    renderTasks();
  };

  // =============================
  // Undo System
  // =============================
  function showUndoBar() {
    $("#undoBar").remove();
    const bar = $(`
          <div id="undoBar" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] bg-[#1a2a44] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 text-sm font-bold">
            <span>وظیفه حذف شد</span>
            <button id="undoBtn" class="text-[#d4af37] hover:text-yellow-300 transition-colors">↩ برگشت</button>
            <button id="dismissUndo" class="text-gray-400 hover:text-white"><i class="bi bi-x"></i></button>
          </div>
        `);
    $("body").append(bar);
    gsap.from("#undoBar", {
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: "back.out(1.5)",
    });
    $("#undoBtn").on("click", () => {
      if (deletedTask !== null) {
        tasks.splice(deletedTaskIndex, 0, deletedTask);
        sessionStorage.setItem("todos", JSON.stringify(tasks));
        deletedTask = null;
        deletedTaskIndex = null;
        renderTasks();
      }
      closeUndoBar();
    });
    $("#dismissUndo").on("click", closeUndoBar);
    if (undoTimeout) clearTimeout(undoTimeout);
    undoTimeout = setTimeout(closeUndoBar, 5000);
  }

  function closeUndoBar() {
    gsap.to("#undoBar", {
      y: 50,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        $("#undoBar").remove();
        deletedTask = null;
        deletedTaskIndex = null;
      },
    });
  }

  // =============================
  // Drag & Drop
  // =============================
  function initDragAndDrop() {
    let draggedItem = null;
    $(".task-card")
      .off("dragstart")
      .on("dragstart", function () {
        draggedItem = this;
        setTimeout(() => $(this).addClass("dragging"), 0);
      });
    $(".task-card")
      .off("dragend")
      .on("dragend", function () {
        $(this).removeClass("dragging");
        const newOrder = [];
        $(".task-card").each(function () {
          newOrder.push(tasks.find((t) => t.id == $(this).data("id")));
        });
        tasks = newOrder;
        sessionStorage.setItem("todos", JSON.stringify(tasks));
        updateSessionInfo();
      });

    const list = document.getElementById("taskList");
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(list, e.clientY);
      if (afterElement == null) list.appendChild(draggedItem);
      else list.insertBefore(draggedItem, afterElement);
    });
  }

  function getDragAfterElement(container, y) {
    const elements = [
      ...container.querySelectorAll(".task-card:not(.dragging)"),
    ];
    return elements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset)
          return { offset, element: child };
        else return closest;
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  }

  // =============================
  // Core Task Operations
  // =============================
  window.addTask = () => {
    const title = $("#taskInput").val().trim();
    const desc = $("#taskDescInput").val().trim();
    if (!title) {
      gsap.to("#inputBox", {
        x: 5,
        repeat: 5,
        yoyo: true,
        duration: 0.05,
      });
      return;
    }
    $("#btnLoader").removeClass("hidden");
    setTimeout(() => {
      tasks.unshift({
        id: Date.now(),
        title,
        desc,
        tagLabel: currentTag.label,
        tagIcon: currentTag.icon,
        completed: false,
        pinned: false,
        subtasks: [],
      });
      sessionStorage.setItem("todos", JSON.stringify(tasks));
      renderTasks();
      $("#taskInput, #taskDescInput").val("");
      $("#btnLoader").addClass("hidden");
      gsap.from(".task-card:first", {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: "back.out(1.5)",
      });
    }, 200);
  };

  window.toggleComplete = (id) => {
    const task = tasks.find((t) => t.id == id);
    if (task) {
      task.completed = !task.completed;
      sessionStorage.setItem("todos", JSON.stringify(tasks));
      renderTasks();
      if (task.completed) {
        gsap.from(`.task-card[data-id="${id}"]`, {
          scale: 1.05,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
        });
      }
    }
  };

  window.pinTask = (id) => {
    const task = tasks.find((t) => t.id == id);
    if (task) {
      task.pinned = !task.pinned;
      sessionStorage.setItem("todos", JSON.stringify(tasks));
      renderTasks();
    }
  };

  window.deleteTask = (id) => {
    const index = tasks.findIndex((t) => t.id == id);
    if (index !== -1) {
      deletedTask = tasks[index];
      deletedTaskIndex = index;
      tasks.splice(index, 1);
      sessionStorage.setItem("todos", JSON.stringify(tasks));
      renderTasks();
      showUndoBar();
    }
  };

  window.toggleDetails = (id) => {
    const details = $(`.task-card[data-id="${id}"] .details`);
    details.slideToggle(200);
    if (details.is(":visible")) initSubtaskListeners();
  };

  $("#taskInput").on("keypress", (e) => {
    if (e.which === 13) window.addTask();
  });
  $("#addBtn").on("click", window.addTask);

  // =============================
  // Preloader Removal
  // =============================
  setTimeout(() => {
    gsap.to("#preloader", {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        $("#preloader").remove();
        renderTasks();
      },
    });
  }, 1000);
});
