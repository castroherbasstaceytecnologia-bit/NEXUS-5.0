const screens = [...document.querySelectorAll(".screen")];
const modal = document.getElementById("resource-modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
let previousScreen = "library";

function goTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  screens.forEach(screen => screen.classList.toggle("active", screen === target));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => goTo(button.dataset.go));
});

const assets = {
  tools: { name: "Herramientas del proyecto", file: "assets/herramientas.docx", type: "WORD", description: "Documento Word con las herramientas utilizadas." },
  materials: { name: "Materiales del proyecto", file: "assets/materiales.docx", type: "WORD", description: "Documento Word con los materiales y componentes." },
  ppt: { name: "Presentación de robótica", file: "assets/presentacion.pptx", type: "PPTX", description: "Diapositivas para la exposición del proyecto." },
  pdf: { name: "Informe del proyecto", file: "assets/proyecto.pdf", type: "PDF", description: "Documento PDF del proyecto." },
  image: { name: "Imagen del robot", file: "assets/robot.jpg", type: "IMG", description: "Imagen o fotografía del prototipo." },
  video: { name: "Demostración del robot", file: "assets/demostracion.mp4", type: "MP4", description: "Video de tu robot en funcionamiento." }
};

function fileExists(url) {
  // GitHub Pages is static hosting. A request is made only when the user opens a module.
  return fetch(url, { method: "HEAD", cache: "no-store" })
    .then(response => response.ok)
    .catch(() => false);
}
function fileRow(item, key) {
  return `<div class="file-row"><span class="file-badge">${item.type}</span><div class="file-info"><b>${item.name}</b><small>${item.description}</small></div><button class="file-action" data-open-file="${key}">ABRIR ↗</button></div>`;
}
function missingMessage(item) {
  return `<div class="empty-state"><b>Este archivo todavía no está publicado.</b><br>Coloca tu archivo en la carpeta <code>assets</code> del repositorio y usa exactamente este nombre:<br><code>${item.file}</code><br><br>Después guarda los cambios en GitHub y vuelve a abrir este módulo.</div>`;
}
function openModal(key) {
  previousScreen = document.querySelector(".screen.active")?.id || "library";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const all = {
    word: { title: "DOCUMENTOS WORD", html: `<div class="file-list">${fileRow(assets.tools, "tools")}${fileRow(assets.materials, "materials")}</div><p class="modal-hint">Los archivos se publican en la carpeta <code>assets/</code> del repositorio para que el profesor pueda abrirlos desde cualquier dispositivo.</p>` },
    ppt: { title: "PRESENTACIÓN POWERPOINT", html: `<div class="file-list">${fileRow(assets.ppt, "ppt")}</div><p class="modal-hint">La presentación se abre o descarga según el dispositivo y las aplicaciones instaladas.</p>` },
    pdf: { title: "DOCUMENTO PDF", html: `<div id="single-preview">${fileRow(assets.pdf, "pdf")}</div>` },
    image: { title: "GALERÍA VISUAL", html: `<div id="single-preview">${fileRow(assets.image, "image")}</div>` },
    video: { title: "VIDEO DEMOSTRATIVO", html: `<div id="single-preview">${fileRow(assets.video, "video")}</div>` }
  };
  const selected = all[key];
  if (!selected) return;
  modalTitle.textContent = selected.title;
  modalContent.innerHTML = selected.html;
  modalContent.querySelectorAll("[data-open-file]").forEach(btn => btn.addEventListener("click", () => openFile(btn.dataset.openFile)));
}
async function openFile(key) {
  const item = assets[key];
  if (!item) return;
  const exists = await fileExists(item.file);
  if (!exists) {
    modalContent.innerHTML = missingMessage(item);
    return;
  }
  if (key === "pdf") {
    modalContent.innerHTML = `<iframe class="viewer-frame" src="${item.file}" title="${item.name}"></iframe><p class="modal-hint">Si no se visualiza en tu navegador, <a class="download-link" href="${item.file}" target="_blank" rel="noopener">ABRIR PDF EN OTRA PESTAÑA ↗</a></p>`;
  } else if (key === "image") {
    modalContent.innerHTML = `<img class="preview-image" src="${item.file}" alt="${item.name}"><p class="modal-hint">Imagen del proyecto.</p>`;
  } else if (key === "video") {
    modalContent.innerHTML = `<video class="preview-video" controls playsinline preload="metadata"><source src="${item.file}" type="video/mp4">Tu navegador no puede reproducir este video.</video><p class="modal-hint">Pulsa reproducir para ver la demostración.</p>`;
  } else {
    modalContent.innerHTML = `<div class="empty-state"><b>${item.name}</b><br>El archivo está publicado y listo para abrirse o descargarse.<br><br><a class="download-link" href="${item.file}" target="_blank" rel="noopener">ABRIR / DESCARGAR ARCHIVO ↗</a><p class="modal-hint">Word y PowerPoint se abren con una aplicación compatible instalada en el dispositivo. Para una vista previa en línea, puedes guardar una copia en un servicio compatible de documentos.</p></div>`;
  }
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
document.querySelectorAll("[data-resource]").forEach(button => button.addEventListener("click", () => openModal(button.dataset.resource)));
document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("modal-back").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

let deferredInstallPrompt;
const installButton = document.getElementById("install-btn");
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    alert("En tu navegador, abre el menú ⋮ y elige «Instalar aplicación» o «Añadir a pantalla de inicio».");
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});
window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
