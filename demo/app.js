const STORAGE_KEY = "apc-web-state-v3";
const ADMIN_PASSWORD = "apc2024";
const DEFAULT_PHOTO = "./assets/default-pet.png";

const STATUS_CLASS = {
  "可领养": "available",
  "已预定": "reserved",
  "已领养": "adopted",
  "待审核": "pending",
  "已通过": "approved",
  "已拒绝": "rejected"
};

const PET_STATUSES = ["可领养", "已预定", "已领养"];

const FILTERS = [
  { id: "all", label: "全部" },
  { id: "可领养", label: "可领养" },
  { id: "猫", label: "猫" },
  { id: "狗", label: "狗" },
  { id: "其他", label: "其他" }
];

const DEFAULT_PETS = [
  {
    id: "pet-cream",
    name: "奶油",
    species: "猫",
    breed: "英短混血",
    age: "1 岁",
    gender: "母",
    status: "可领养",
    photo: "./assets/pet-cream.jpg",
    description: "已完成疫苗、驱虫和基础体检，性格稳定亲人不怕生，喜欢趴窗边晒太阳。适合首次养宠的家庭，建议室内饲养。"
  },
  {
    id: "pet-sesame",
    name: "芝麻",
    species: "猫",
    breed: "中华田园猫",
    age: "8 个月",
    gender: "公",
    status: "可领养",
    photo: "./assets/pet-sesame.jpg",
    description: "救助后恢复良好，活泼好奇互动感很强，喜欢逗猫棒和高处观察。适合愿意陪玩、有耐心度过适应期的家庭。"
  },
  {
    id: "pet-ginger",
    name: "橘座",
    species: "猫",
    breed: "橘猫",
    age: "1 岁半",
    gender: "公",
    status: "已预定",
    photo: "./assets/pet-ginger.webp",
    description: "性格温和，熟悉环境后非常粘人，喜欢在人边上躺着发呆。目前已被预定，适合安静的居家环境。"
  },
  {
    id: "pet-smoky",
    name: "煤球",
    species: "猫",
    breed: "英短蓝猫",
    age: "2 岁",
    gender: "公",
    status: "可领养",
    photo: "./assets/pet-smoky.webp",
    description: "体型结实，熟悉后会主动撒娇打滚，存在感很强。建议控制体重并增加互动玩具，每周固定梳毛。"
  }
];

const DEFAULT_APPLICATIONS = [
  {
    id: "app-seed-1",
    petId: "pet-ginger",
    petName: "橘座",
    applicantName: "周女士",
    phone: "13900008888",
    address: "上海市长宁区天山路 100 号",
    experience: "有多年养猫经验。",
    reason: "家里有独立活动空间，希望领养一只稳定亲人的猫陪伴。",
    status: "待审核",
    createdAt: "2026-06-20 10:12"
  }
];

const ui = {
  filter: "all",
  keyword: "",
  phoneFilter: "",
  adminUnlocked: false,
  applyingPetId: null,
  editingPetId: null,
  manageTab: "overview"
};

const appState = loadState();

const el = {
  // header / nav
  navToggle: document.querySelector("#nav-toggle"),
  siteNav: document.querySelector("#site-nav"),
  navLinks: document.querySelectorAll("[data-nav]"),
  manageLink: document.querySelector("[data-manage-link]"),
  staffEntry: document.querySelector("#staff-entry-button"),
  // hero
  heroStats: document.querySelector("#hero-stats"),
  heroAvailable: document.querySelector("#hero-available-count"),
  // pets
  filterRow: document.querySelector("#filter-row"),
  searchInput: document.querySelector("#search-input"),
  petList: document.querySelector("#pet-list"),
  // applications
  phoneFilterInput: document.querySelector("#phone-filter-input"),
  applicationsGrid: document.querySelector("#applications-grid"),
  // manage
  manageSection: document.querySelector("#manage"),
  manageTabs: document.querySelector("#manage-tabs"),
  managePanels: document.querySelectorAll(".manage-panel"),
  overviewStats: document.querySelector("#overview-stats"),
  overviewTable: document.querySelector("#overview-table"),
  petForm: document.querySelector("#pet-form"),
  petFormSubmit: document.querySelector("#pet-form-submit"),
  petFormReset: document.querySelector("#pet-form-reset"),
  managePets: document.querySelector("#manage-pets"),
  manageReview: document.querySelector("#manage-review"),
  reviewBadge: document.querySelector("#review-badge"),
  logoutButton: document.querySelector("#logout-button"),
  // modals
  detailModal: document.querySelector("#detail-modal"),
  detailCard: document.querySelector("#detail-card"),
  applyModal: document.querySelector("#apply-modal"),
  applyForm: document.querySelector("#apply-form"),
  applyTitle: document.querySelector("#apply-title"),
  staffModal: document.querySelector("#staff-modal"),
  staffForm: document.querySelector("#staff-form"),
  // toast
  toast: document.querySelector("#toast")
};

init();

function init() {
  bindEvents();
  renderFilters();
  renderAll();
}

function bindEvents() {
  // mobile nav
  el.navToggle.addEventListener("click", () => {
    const open = el.siteNav.classList.toggle("open");
    el.navToggle.setAttribute("aria-expanded", String(open));
  });
  el.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      el.siteNav.classList.remove("open");
      el.navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // scroll spy
  window.addEventListener("scroll", throttle(updateActiveNav, 150));

  // pets
  el.searchInput.addEventListener("input", (e) => {
    ui.keyword = e.target.value.trim().toLowerCase();
    renderPetList();
  });

  // applications phone lookup
  el.phoneFilterInput.addEventListener("input", (e) => {
    ui.phoneFilter = e.target.value.trim();
    renderApplications();
  });

  // apply form
  el.applyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.submitter && e.submitter.value !== "submit") {
      el.applyModal.close();
      return;
    }
    submitApplication(new FormData(el.applyForm));
  });

  // staff login
  el.staffEntry.addEventListener("click", openStaffModal);
  el.staffForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.submitter && e.submitter.value !== "submit") {
      el.staffModal.close();
      return;
    }
    handleStaffLogin(new FormData(el.staffForm));
  });
  el.logoutButton.addEventListener("click", logoutAdmin);

  // manage tabs
  el.manageTabs.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab]");
    if (!tab) return;
    ui.manageTab = tab.dataset.tab;
    renderManageTabs();
  });

  // pet form (add / edit)
  el.petForm.addEventListener("submit", (e) => {
    e.preventDefault();
    savePet(new FormData(el.petForm));
  });
  el.petFormReset.addEventListener("click", resetPetForm);

  // close modals on backdrop click
  [el.detailModal, el.applyModal, el.staffModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.close();
    });
  });
}

/* ---------------- state ---------------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pets: clone(DEFAULT_PETS), applications: clone(DEFAULT_APPLICATIONS) };
    const parsed = JSON.parse(raw);
    return {
      pets: Array.isArray(parsed.pets) ? parsed.pets : clone(DEFAULT_PETS),
      applications: Array.isArray(parsed.applications) ? parsed.applications : clone(DEFAULT_APPLICATIONS)
    };
  } catch {
    return { pets: clone(DEFAULT_PETS), applications: clone(DEFAULT_APPLICATIONS) };
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

/* ---------------- render ---------------- */
function renderAll() {
  renderHeroStats();
  renderPetList();
  renderApplications();
  renderManage();
}

function renderHeroStats() {
  const total = appState.pets.length;
  const available = appState.pets.filter((p) => p.status === "可领养").length;
  const adopted = appState.pets.filter((p) => p.status === "已领养").length;
  el.heroStats.innerHTML = [
    heroStat(total, "在养宠物"),
    heroStat(available, "可领养"),
    heroStat(adopted, "已找到家")
  ].join("");
  el.heroAvailable.textContent = available;
}

function renderFilters() {
  el.filterRow.innerHTML = FILTERS.map((f) =>
    `<button class="filter-chip ${ui.filter === f.id ? "active" : ""}" data-filter="${f.id}">${f.label}</button>`
  ).join("");
  el.filterRow.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.filter = btn.dataset.filter;
      renderFilters();
      renderPetList();
    });
  });
}

function getFilteredPets() {
  return appState.pets.filter((pet) => {
    const matchFilter =
      ui.filter === "all" || pet.status === ui.filter || pet.species === ui.filter;
    const haystack = [pet.name, pet.breed, pet.description].join(" ").toLowerCase();
    const matchKeyword = !ui.keyword || haystack.includes(ui.keyword);
    return matchFilter && matchKeyword;
  });
}

function renderPetList() {
  const pets = getFilteredPets();
  if (pets.length === 0) {
    el.petList.innerHTML = `<div class="empty-state">没有匹配的宠物，换个关键词或筛选条件试试。</div>`;
    return;
  }
  el.petList.innerHTML = pets.map((pet) => `
    <article class="pet-card" data-pet-id="${pet.id}">
      <div class="pet-thumb">
        <img src="${pet.photo || DEFAULT_PHOTO}" alt="${escapeHtml(pet.name)}" loading="lazy">
        ${statusPill(pet.status)}
      </div>
      <div class="pet-body">
        <div class="pet-body-head">
          <h3>${escapeHtml(pet.name)}</h3>
          <span class="pet-species">${escapeHtml(pet.species)}</span>
        </div>
        <div class="pet-meta">
          ${pet.breed ? `<span>${escapeHtml(pet.breed)}</span>` : ""}
          ${pet.age ? `<span>${escapeHtml(pet.age)}</span>` : ""}
          ${pet.gender ? `<span>${escapeHtml(pet.gender)}</span>` : ""}
        </div>
        <p class="pet-desc">${escapeHtml(pet.description || "")}</p>
      </div>
    </article>
  `).join("");

  el.petList.querySelectorAll("[data-pet-id]").forEach((card) => {
    card.addEventListener("click", () => openDetail(card.dataset.petId));
  });
}

function openDetail(petId) {
  const pet = appState.pets.find((p) => p.id === petId);
  if (!pet) return;
  const adoptable = pet.status === "可领养";
  el.detailCard.innerHTML = `
    <div class="detail-hero">
      <img src="${pet.photo || DEFAULT_PHOTO}" alt="${escapeHtml(pet.name)}">
      ${statusPill(pet.status)}
      <button class="icon-close" data-close aria-label="关闭">×</button>
    </div>
    <div class="detail-body">
      <div class="detail-body-head">
        <h3>${escapeHtml(pet.name)}</h3>
        <span class="pet-species">${escapeHtml(pet.species)}</span>
      </div>
      <div class="detail-facts">
        ${detailFact(pet.breed || "—", "品种")}
        ${detailFact(pet.age || "—", "年龄")}
        ${detailFact(pet.gender || "未知", "性别")}
        ${detailFact(pet.status, "状态")}
      </div>
      <p class="detail-desc">${escapeHtml(pet.description || "暂无更多描述。")}</p>
      <div class="detail-actions">
        <button class="primary-btn" id="detail-apply" ${adoptable ? "" : "disabled"}>
          ${adoptable ? "申请领养" : pet.status + "，暂不可申请"}
        </button>
      </div>
    </div>
  `;
  el.detailCard.querySelector("[data-close]").addEventListener("click", () => el.detailModal.close());
  if (adoptable) {
    el.detailCard.querySelector("#detail-apply").addEventListener("click", () => {
      el.detailModal.close();
      openApplyModal(pet);
    });
  }
  el.detailModal.showModal();
}

function renderApplications() {
  const list = appState.applications.filter((a) => !ui.phoneFilter || a.phone.includes(ui.phoneFilter));
  if (list.length === 0) {
    el.applicationsGrid.innerHTML = `<div class="empty-state">${ui.phoneFilter ? "没有找到该手机号的申请记录。" : "还没有申请记录，去看看待领养的宠物吧。"}</div>`;
    return;
  }
  const petsById = new Map(appState.pets.map((p) => [p.id, p]));
  el.applicationsGrid.innerHTML = list
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((app) => {
      const pet = petsById.get(app.petId);
      return `
        <article class="application-card">
          <div class="application-head">
            <h4>${escapeHtml(app.petName)}</h4>
            ${statusPill(app.status)}
          </div>
          <div class="application-pet">
            <img src="${(pet && pet.photo) || DEFAULT_PHOTO}" alt="${escapeHtml(app.petName)}">
            <div class="application-meta">
              <span>申请人：${escapeHtml(app.applicantName)}</span>
              <span>手机号：${escapeHtml(app.phone)}</span>
              <span>提交时间：${escapeHtml(app.createdAt)}</span>
            </div>
          </div>
          <p class="app-reason">${escapeHtml(app.reason)}</p>
        </article>
      `;
    }).join("");
}

/* ---------------- apply ---------------- */
function openApplyModal(pet) {
  ui.applyingPetId = pet.id;
  el.applyTitle.textContent = `领养申请 · ${pet.name}`;
  el.applyForm.reset();
  el.applyModal.showModal();
}

function submitApplication(formData) {
  const pet = appState.pets.find((p) => p.id === ui.applyingPetId);
  if (!pet) { showToast("未找到对应宠物"); return; }

  const applicantName = String(formData.get("applicantName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const experience = String(formData.get("experience") || "").trim();
  const reason = String(formData.get("reason") || "").trim();

  if (pet.status !== "可领养") { showToast("该宠物暂不可领养"); return; }
  if (phone.length !== 11) { showToast("请输入 11 位手机号"); return; }

  const duplicated = appState.applications.some((a) =>
    a.petId === pet.id && a.phone === phone && ["待审核", "已通过"].includes(a.status));
  if (duplicated) { showToast("该手机号已提交过此宠物的申请"); return; }

  appState.applications.push({
    id: `app-${Date.now()}`,
    petId: pet.id,
    petName: pet.name,
    applicantName, phone, address, experience, reason,
    status: "待审核",
    createdAt: formatNow()
  });
  persist();
  el.applyModal.close();

  ui.phoneFilter = phone;
  el.phoneFilterInput.value = phone;
  renderApplications();
  renderManage();
  document.querySelector("#applications").scrollIntoView({ behavior: "smooth" });
  showToast(`已提交 ${pet.name} 的领养申请`);
}

/* ---------------- admin auth ---------------- */
function openStaffModal() {
  if (ui.adminUnlocked) {
    el.manageSection.scrollIntoView({ behavior: "smooth" });
    return;
  }
  el.staffForm.reset();
  el.staffModal.showModal();
}

function handleStaffLogin(formData) {
  const password = String(formData.get("password") || "").trim();
  if (password !== ADMIN_PASSWORD) { showToast("管理员密码不正确"); return; }
  ui.adminUnlocked = true;
  el.staffModal.close();
  el.manageSection.hidden = false;
  el.manageLink.hidden = false;
  el.staffEntry.textContent = "管理后台";
  renderManage();
  el.manageSection.scrollIntoView({ behavior: "smooth" });
  showToast("已进入管理后台");
}

function logoutAdmin() {
  ui.adminUnlocked = false;
  el.manageSection.hidden = true;
  el.manageLink.hidden = true;
  el.staffEntry.textContent = "管理登录";
  resetPetForm();
  document.querySelector("#home").scrollIntoView({ behavior: "smooth" });
  showToast("已退出登录");
}

/* ---------------- manage ---------------- */
function renderManage() {
  renderManageTabs();
  renderOverview();
  renderManagePets();
  renderManageReview();
}

function renderOverview() {
  const pets = appState.pets;
  const apps = appState.applications;
  const countBy = (arr, key, val) => arr.filter((x) => x[key] === val).length;

  el.overviewStats.innerHTML = [
    overviewStat(pets.length, "宠物总数"),
    overviewStat(countBy(pets, "status", "可领养"), "可领养", "green"),
    overviewStat(countBy(pets, "status", "已预定"), "已预定", "amber"),
    overviewStat(countBy(pets, "status", "已领养"), "已领养"),
    overviewStat(apps.length, "申请总数"),
    overviewStat(countBy(apps, "status", "待审核"), "待审核", "accent")
  ].join("");

  const head = `
    <thead><tr>
      <th>宠物</th><th>品类</th><th>品种</th><th>状态</th><th>申请数</th><th>待审核</th>
    </tr></thead>`;

  if (pets.length === 0) {
    el.overviewTable.innerHTML = head + `<tbody><tr class="overview-empty"><td colspan="6">还没有登记任何宠物。</td></tr></tbody>`;
    return;
  }

  const rows = pets.map((pet) => {
    const petApps = apps.filter((a) => a.petId === pet.id);
    const pending = petApps.filter((a) => a.status === "待审核").length;
    return `
      <tr>
        <td class="cell-name"><img src="${pet.photo || DEFAULT_PHOTO}" alt="">${escapeHtml(pet.name)}</td>
        <td>${escapeHtml(pet.species)}</td>
        <td>${escapeHtml(pet.breed || "—")}</td>
        <td>${statusPill(pet.status)}</td>
        <td>${petApps.length}</td>
        <td class="${pending ? "count-pending" : ""}">${pending}</td>
      </tr>`;
  }).join("");

  el.overviewTable.innerHTML = head + `<tbody>${rows}</tbody>`;
}

function renderManageTabs() {
  el.manageTabs.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === ui.manageTab);
  });
  el.managePanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === ui.manageTab);
  });
  const pending = appState.applications.filter((a) => a.status === "待审核").length;
  el.reviewBadge.hidden = pending === 0;
  el.reviewBadge.textContent = pending;
}

function renderManagePets() {
  if (appState.pets.length === 0) {
    el.managePets.innerHTML = `<div class="empty-state">还没有登记任何宠物。</div>`;
    return;
  }
  el.managePets.innerHTML = appState.pets.map((pet) => `
    <div class="manage-pet-card" data-pet-id="${pet.id}">
      <img src="${pet.photo || DEFAULT_PHOTO}" alt="${escapeHtml(pet.name)}">
      <div class="manage-pet-info">
        <h4>${escapeHtml(pet.name)}</h4>
        <div class="pet-meta">
          <span>${escapeHtml(pet.species)}</span>
          ${pet.breed ? `<span>${escapeHtml(pet.breed)}</span>` : ""}
          ${pet.age ? `<span>${escapeHtml(pet.age)}</span>` : ""}
        </div>
        <div class="manage-pet-actions">
          <select data-status>
            ${PET_STATUSES.map((s) => `<option value="${s}" ${s === pet.status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
          <button class="text-btn edit" data-edit>编辑</button>
          <button class="text-btn delete" data-delete>删除</button>
        </div>
      </div>
    </div>
  `).join("");

  el.managePets.querySelectorAll(".manage-pet-card").forEach((card) => {
    const id = card.dataset.petId;
    card.querySelector("[data-status]").addEventListener("change", (e) => updatePetStatus(id, e.target.value));
    card.querySelector("[data-edit]").addEventListener("click", () => startEditPet(id));
    card.querySelector("[data-delete]").addEventListener("click", () => removePet(id));
  });
}

function renderManageReview() {
  const pending = appState.applications.filter((a) => a.status === "待审核");
  if (pending.length === 0) {
    el.manageReview.innerHTML = `<div class="empty-state">当前没有待审核的申请。</div>`;
    return;
  }
  el.manageReview.innerHTML = pending.map((app) => `
    <article class="review-card" data-app-id="${app.id}">
      <h4>${escapeHtml(app.petName)}</h4>
      <p><strong>申请人</strong>：${escapeHtml(app.applicantName)}</p>
      <p><strong>手机号</strong>：${escapeHtml(app.phone)}</p>
      <p><strong>住址</strong>：${escapeHtml(app.address)}</p>
      ${app.experience ? `<p><strong>养宠经验</strong>：${escapeHtml(app.experience)}</p>` : ""}
      <p><strong>理由</strong>：${escapeHtml(app.reason)}</p>
      <p><strong>提交</strong>：${escapeHtml(app.createdAt)}</p>
      <div class="review-actions">
        <button class="review-btn approve" data-action="approve">通过</button>
        <button class="review-btn reject" data-action="reject">拒绝</button>
      </div>
    </article>
  `).join("");

  el.manageReview.querySelectorAll(".review-card").forEach((card) => {
    const id = card.dataset.appId;
    card.querySelector("[data-action='approve']").addEventListener("click", () => reviewApplication(id, "approve"));
    card.querySelector("[data-action='reject']").addEventListener("click", () => reviewApplication(id, "reject"));
  });
}

function savePet(formData) {
  const name = String(formData.get("name") || "").trim();
  const species = String(formData.get("species") || "").trim();
  if (!name) { showToast("请填写宠物名字"); return; }

  const data = {
    name,
    species,
    breed: String(formData.get("breed") || "").trim(),
    age: String(formData.get("age") || "").trim(),
    gender: String(formData.get("gender") || "未知").trim(),
    status: String(formData.get("status") || "可领养").trim(),
    photo: String(formData.get("photo") || "").trim() || DEFAULT_PHOTO,
    description: String(formData.get("description") || "").trim()
  };

  if (ui.editingPetId) {
    const pet = appState.pets.find((p) => p.id === ui.editingPetId);
    if (pet) Object.assign(pet, data);
    showToast(`已更新 ${name}`);
  } else {
    appState.pets.unshift({ id: `pet-${Date.now()}`, ...data });
    showToast(`已登记 ${name}`);
  }
  persist();
  resetPetForm();
  renderHeroStats();
  renderPetList();
  renderManagePets();
}

function startEditPet(id) {
  const pet = appState.pets.find((p) => p.id === id);
  if (!pet) return;
  ui.editingPetId = id;
  const f = el.petForm;
  f.name.value = pet.name || "";
  f.species.value = pet.species || "猫";
  f.breed.value = pet.breed || "";
  f.age.value = pet.age || "";
  f.gender.value = pet.gender || "未知";
  f.status.value = pet.status || "可领养";
  f.photo.value = pet.photo && pet.photo !== DEFAULT_PHOTO ? pet.photo : "";
  f.description.value = pet.description || "";
  el.petFormSubmit.textContent = "保存修改";
  ui.manageTab = "add";
  renderManageTabs();
  el.manageSection.scrollIntoView({ behavior: "smooth" });
  showToast(`正在编辑 ${pet.name}`);
}

function resetPetForm() {
  ui.editingPetId = null;
  el.petForm.reset();
  el.petFormSubmit.textContent = "登记宠物";
}

function updatePetStatus(id, status) {
  const pet = appState.pets.find((p) => p.id === id);
  if (!pet) return;
  pet.status = status;
  persist();
  renderHeroStats();
  renderPetList();
  showToast(`${pet.name} 状态已更新为「${status}」`);
}

function removePet(id) {
  const pet = appState.pets.find((p) => p.id === id);
  if (!pet) return;
  if (!window.confirm(`确定要删除 ${pet.name} 吗？删除后不可恢复。`)) return;
  appState.pets = appState.pets.filter((p) => p.id !== id);
  if (ui.editingPetId === id) resetPetForm();
  persist();
  renderHeroStats();
  renderPetList();
  renderManagePets();
  showToast(`已删除 ${pet.name}`);
}

function reviewApplication(id, action) {
  const app = appState.applications.find((a) => a.id === id);
  if (!app) return;
  app.status = action === "approve" ? "已通过" : "已拒绝";
  app.reviewedAt = formatNow();
  if (action === "approve") {
    const pet = appState.pets.find((p) => p.id === app.petId);
    if (pet) pet.status = "已领养";
  }
  persist();
  renderHeroStats();
  renderPetList();
  renderApplications();
  renderManage();
  showToast(action === "approve" ? "已通过，宠物状态更新为已领养" : "已拒绝该申请");
}

/* ---------------- helpers ---------------- */
function updateActiveNav() {
  const sections = ["pets", "process", "applications"];
  const offset = window.scrollY + parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) + 40;
  let current = "";
  for (const id of sections) {
    const node = document.getElementById(id);
    if (node && node.offsetTop <= offset) current = id;
  }
  el.navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}

function heroStat(value, label) {
  return `<div class="hero-stat"><strong>${value}</strong><span>${label}</span></div>`;
}
function overviewStat(value, label, variant) {
  return `<div class="overview-stat ${variant || ""}"><strong>${value}</strong><span>${label}</span></div>`;
}
function detailFact(value, label) {
  return `<div class="detail-fact"><strong>${escapeHtml(String(value))}</strong><span>${label}</span></div>`;
}
function statusPill(status) {
  return `<span class="status-pill ${STATUS_CLASS[status] || "pending"}">${escapeHtml(status)}</span>`;
}
function formatNow() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function clone(v) { return JSON.parse(JSON.stringify(v)); }
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function throttle(fn, wait) {
  let last = 0, timer = null;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn(...args); }
    else { clearTimeout(timer); timer = setTimeout(() => { last = Date.now(); fn(...args); }, wait - (now - last)); }
  };
}

let toastTimer = null;
function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2200);
}
