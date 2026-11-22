"use strict";
(() => {
  const avatar = document.getElementById("user-avatar");
  const dialog = document.getElementById("avatar-flag-dialog");
  if (!avatar || !dialog) return;
  const email = document.getElementById("user-email-display")?.textContent?.trim() || "guest";
  const key = "studyplan:avatar-flag:v1:" + email;
  const clubKey = "studyplan:avatar-club:v1:" + email;
  const leagueSelect = document.getElementById("avatar-club-league");
  const clubControls = document.getElementById("avatar-club-controls");
  const clubStatus = document.getElementById("avatar-club-status");
  const flagsTab = document.getElementById("avatar-show-flags");
  const clubsTab = document.getElementById("avatar-show-clubs");
  const searchLabel = document.getElementById("avatar-search-label");
  const clubLists = new Map();
  let mode = "flags";
  let loadSequence = 0;
  const initial = avatar.textContent.trim();
  const search = document.getElementById("avatar-flag-search");
  const list = document.getElementById("avatar-flag-list");
  const countryCodes = ["AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"];
  const display = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["es"], { type: "region" }) : null;
  const flag = code => [...code].map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join("");
  const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const countries = countryCodes.map(code => ({ code, name: display ? display.of(code) : code })).sort((a,b) => a.name.localeCompare(b.name, "es"));
  function makeFlagImage(code, size = 40) {
    const img = document.createElement("img");
    img.className = "avatar-flag-image";
    img.src = "https://flagcdn.com/w" + size + "/" + code.toLowerCase() + ".png";
    img.alt = "Bandera de " + (countries.find(c => c.code === code)?.name || code);
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.replaceWith(document.createTextNode(flag(code)));
    }, { once: true });
    return img;
  }
  function setClubAvatar(club) {
    if (!club || !/^https:\/\//.test(club.escudo) || !club.nombre) return;
    avatar.replaceChildren();
    const img = document.createElement("img");
    img.className = "avatar-flag-image avatar-club-image";
    img.src = club.escudo;
    img.alt = "Escudo de " + club.nombre;
    img.addEventListener("error", () => { img.replaceWith(document.createTextNode(initial)); }, { once: true });
    avatar.append(img);
    avatar.classList.add("has-flag");
    avatar.title = "Escudo: " + club.nombre + ". Cambiar avatar";
    avatar.setAttribute("aria-label", avatar.title);
  }
  function setAvatar(code) {
    const valid = countryCodes.includes(code);
    avatar.replaceChildren();
    if (valid) avatar.append(makeFlagImage(code, 80));
    else avatar.textContent = initial;
    avatar.classList.toggle("has-flag", valid);
    avatar.title = valid ? "Bandera: " + countries.find(c => c.code === code).name + ". Cambiar bandera" : "Elegir bandera de perfil";
    avatar.setAttribute("aria-label", avatar.title);
  }
  function render(query = "") {
    list.replaceChildren();
    if (mode === "clubs") { renderClubs(query); return; }
    const term = normalize(query.trim());
    const filtered = countries.filter(c => normalize(c.name).includes(term) || c.code.toLowerCase().includes(term));
    for (const country of filtered) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "avatar-flag-option";
      button.append(makeFlagImage(country.code), document.createTextNode(" " + country.name));
      button.dataset.code = country.code;
      button.addEventListener("click", () => {
        setAvatar(country.code);
        try { localStorage.setItem(key, country.code); localStorage.removeItem(clubKey); } catch (_) {}
        dialog.close();
      });
      list.append(button);
    }
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.textContent = "No se han encontrado países.";
      list.append(empty);
    }
  }
  try {
    const savedClub = JSON.parse(localStorage.getItem(clubKey) || "null");
    if (savedClub && savedClub.nombre && savedClub.escudo) setClubAvatar(savedClub);
    else setAvatar(localStorage.getItem(key));
  } catch (_) { setAvatar(null); }

  function renderClubs(query = "") {
    list.replaceChildren();
    const clubs = clubLists.get(leagueSelect.value) || [];
    const term = normalize(query.trim());
    for (const club of clubs.filter(c => normalize(c.nombre).includes(term))) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "avatar-flag-option";
      const img = document.createElement("img");
      img.className = "avatar-flag-image avatar-club-image";
      img.src = club.escudo;
      img.alt = "";
      img.loading = "lazy";
      button.append(img, document.createTextNode(club.nombre));
      button.addEventListener("click", () => {
        setClubAvatar(club);
        try { localStorage.setItem(clubKey, JSON.stringify(club)); localStorage.removeItem(key); } catch (_) {}
        dialog.close();
      });
      list.append(button);
    }
    if (!list.childElementCount && clubs.length) {
      const empty = document.createElement("p");
      empty.textContent = "No se han encontrado equipos.";
      list.append(empty);
    }
  }
  async function loadClubs() {
    const league = leagueSelect.value;
    const sequence = ++loadSequence;
    clubStatus.textContent = "Cargando escudos…";
    list.replaceChildren();
    if (!clubLists.has(league)) {
      try {
        const response = await fetch("/api/perfil/escudos?liga=" + encodeURIComponent(league), { credentials: "same-origin" });
        if (!response.ok) throw new Error("No se han podido cargar los equipos. Comprueba tu conexión.");
        const data = await response.json();
        if (!Array.isArray(data.equipos)) throw new Error("Respuesta de equipos no válida.");
        clubLists.set(league, data.equipos.filter(c => c && c.nombre && /^https:\/\//.test(c.escudo)));
      } catch (error) {
        if (sequence === loadSequence && mode === "clubs") clubStatus.textContent = error.message;
        return;
      }
    }
    if (sequence !== loadSequence || mode !== "clubs") return;
    clubStatus.textContent = clubLists.get(league).length + " equipos disponibles";
    renderClubs(search.value);
  }
  function setMode(next) {
    mode = next;
    search.value = "";
    clubControls.hidden = next !== "clubs";
    flagsTab.setAttribute("aria-pressed", String(next === "flags"));
    clubsTab.setAttribute("aria-pressed", String(next === "clubs"));
    searchLabel.textContent = next === "clubs" ? "Buscar equipo" : "Buscar país";
    search.placeholder = next === "clubs" ? "Real Madrid, Arsenal, Bayern…" : "España, Alemania, Japón…";
    if (next === "clubs") loadClubs();
    else { ++loadSequence; clubStatus.textContent = ""; render(); }
  }
  flagsTab.addEventListener("click", () => setMode("flags"));
  clubsTab.addEventListener("click", () => setMode("clubs"));
  leagueSelect.addEventListener("change", () => { search.value = ""; loadClubs(); });
  avatar.addEventListener("click", () => {
    search.value = "";
    if (mode === "clubs") loadClubs(); else render();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    search.focus();
  });
  document.getElementById("avatar-flag-close").addEventListener("click", () => dialog.close());
  document.getElementById("avatar-flag-reset").addEventListener("click", () => {
    setAvatar(null);
    try { localStorage.removeItem(key); localStorage.removeItem(clubKey); } catch (_) {}
    dialog.close();
  });
  search.addEventListener("input", () => render(search.value));
})();
