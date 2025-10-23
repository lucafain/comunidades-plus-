const STORAGE_KEY = 'comunidadesPlusNews';
const ADMIN_USER = 'Luca';
const ADMIN_PASSWORD = 'Luca3122';
const MAX_MEDIA_FILES = 2;

function normalizeCredential(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized =
    typeof value.normalize === 'function'
      ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : value;

  return normalized.toLowerCase();
}

const ADMIN_USER_MATCH = normalizeCredential(ADMIN_USER);

const newsSection = document.getElementById('news-section');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const adminAccessButton = document.getElementById('admin-access');
const loginModal = document.getElementById('login-modal');
const closeModalButton = document.getElementById('close-modal');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const adminPanel = document.getElementById('admin-panel');
const logoutButton = document.getElementById('logout-button');
const adminHomeButton = document.getElementById('admin-home-button');
const newsForm = document.getElementById('news-form');
const formTitle = document.getElementById('form-title');
const cancelEditButton = document.getElementById('cancel-edit');
const newsTemplate = document.getElementById('news-template');

const titleInput = document.getElementById('news-title');
const dateInput = document.getElementById('news-date');
const contentInput = document.getElementById('news-content');
const mediaInput = document.getElementById('news-media');
const mediaPreviewWrapper = document.getElementById('media-preview-wrapper');
const mediaPreviewList = document.getElementById('media-preview-list');

const newsDetailModal = document.getElementById('news-detail-modal');
const detailCloseButton = document.getElementById('detail-close');
const detailTitle = document.getElementById('detail-title');
const detailDate = document.getElementById('detail-date');
const detailContent = document.getElementById('detail-content');
const detailMedia = document.getElementById('detail-media');
const detailBody = document.getElementById('detail-body');

let newsItems = loadNews();
let filteredNews = [...newsItems];
let isAdmin = false;
let adminPanelVisible = false;
let editingId = null;
let pendingMediaList = [];
let lastFocusedTrigger = null;

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `news-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadNews() {
  const fallback = [
    {
      id: createId(),
      title: 'Celebración de Iom Haatzmaut en la comunidad',
      date: new Date().toISOString().slice(0, 10),
      media: [],
      content:
        'Las comunidades de todo el país se reunieron para celebrar Iom Haatzmaut con actividades culturales, música y gastronomía típica. El evento central se realizó en la plaza principal y contó con la participación de jóvenes voluntarios.',
    },
    {
      id: createId(),
      title: 'Nueva iniciativa educativa en Jerusalén',
      date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
      media: [],
      content:
        'El Ministerio de Educación anunció la apertura de un programa de liderazgo para estudiantes secundarios enfocado en innovación social. La propuesta busca fortalecer los lazos entre escuelas y organizaciones comunitarias.',
    },
    {
      id: createId(),
      title: 'Encuentro interreligioso promueve el diálogo',
      date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
      media: [],
      content:
        'Representantes de distintas confesiones compartieron experiencias y perspectivas sobre el trabajo comunitario en Israel. Se realizaron mesas de debate, actividades de voluntariado y talleres abiertos al público.',
    },
  ];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
    return parsed.map((item) => ({
      id: item.id || createId(),
      title: item.title || 'Noticia sin título',
      date: item.date || new Date().toISOString().slice(0, 10),
      content: item.content || '',
      media: normalizeMedia(item),
    }));
  } catch (error) {
    console.warn('No se pudieron cargar las noticias almacenadas. Se usará el contenido por defecto.');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function saveNews() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newsItems));
  } catch (error) {
    console.warn('No se pudieron guardar las noticias en este navegador.', error);
  }
}

function formatDate(isoDate) {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return isoDate;
  }
}

function normalizeMedia(item) {
  if (!item || typeof item !== 'object') {
    return [];
  }

  const normalized = [];

  const pushEntry = (entry) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }
    const type = entry.type === 'video' ? 'video' : entry.type === 'image' ? 'image' : null;
    const data = typeof entry.data === 'string' ? entry.data : null;
    if (type && data) {
      normalized.push({ type, data });
    }
  };

  if (Array.isArray(item.media)) {
    item.media.forEach(pushEntry);
  } else if (item.media && typeof item.media === 'object') {
    pushEntry(item.media);
  }

  if (
    !normalized.length &&
    typeof item.mediaType === 'string' &&
    typeof item.mediaData === 'string' &&
    item.mediaData
  ) {
    const type = item.mediaType === 'video' ? 'video' : item.mediaType === 'image' ? 'image' : null;
    if (type) {
      normalized.push({ type, data: item.mediaData });
    }
  }

  if (!normalized.length && typeof item.image === 'string' && item.image) {
    normalized.push({ type: 'image', data: item.image });
  }

  return normalized.slice(0, MAX_MEDIA_FILES);
}

function renderMediaPreview(mediaList) {
  if (!mediaPreviewWrapper || !mediaPreviewList) {
    return;
  }

  const hasMedia = Array.isArray(mediaList) && mediaList.length > 0;

  if (!hasMedia) {
    mediaPreviewWrapper.hidden = true;
    mediaPreviewList.innerHTML = '';
    return;
  }

  mediaPreviewWrapper.hidden = false;
  mediaPreviewList.innerHTML = '';

  mediaList.forEach((media, index) => {
    if (!media || typeof media.data !== 'string') {
      return;
    }

    const item = document.createElement('li');
    item.className = 'media-preview__item';

    const figure = document.createElement('figure');
    figure.className = 'media-preview__figure';

    const label = document.createElement('figcaption');
    label.className = 'media-preview__label';
    label.textContent = media.type === 'video' ? `Video ${index + 1}` : `Imagen ${index + 1}`;

    if (media.type === 'image') {
      const img = document.createElement('img');
      img.src = media.data;
      img.alt = label.textContent;
      img.className = 'media-preview__thumb';
      figure.appendChild(img);
    } else if (media.type === 'video') {
      const video = document.createElement('video');
      video.src = media.data;
      video.preload = 'metadata';
      video.playsInline = true;
      video.className = 'media-preview__thumb media-preview__thumb--video';
      figure.appendChild(video);
    }

    figure.appendChild(label);
    item.appendChild(figure);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'secondary-button media-preview__remove';
    removeButton.dataset.index = String(index);
    removeButton.textContent = 'Quitar';
    item.appendChild(removeButton);

    mediaPreviewList.appendChild(item);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Formato de archivo no soportado.'));
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

async function handleMediaSelect(event) {
  const files = Array.from(event.target.files || []);

  if (!files.length) {
    event.target.value = '';
    return;
  }

  const availableSlots = MAX_MEDIA_FILES - pendingMediaList.length;
  if (availableSlots <= 0) {
    alert(`Solo podés adjuntar hasta ${MAX_MEDIA_FILES} archivos por noticia.`);
    event.target.value = '';
    return;
  }

  const filesToProcess = files.slice(0, availableSlots);
  if (files.length > availableSlots) {
    alert(
      availableSlots === 1
        ? 'Solo queda espacio para un archivo más, se cargará únicamente el primer archivo seleccionado.'
        : 'Solo se cargarán los dos primeros archivos seleccionados.'
    );
  }
  const invalidFiles = filesToProcess.filter(
    (file) => !file.type.startsWith('image/') && !file.type.startsWith('video/')
  );

  if (invalidFiles.length) {
    alert('Por favor selecciona únicamente archivos de imagen o video.');
    event.target.value = '';
    return;
  }

  try {
    const processed = await Promise.all(
      filesToProcess.map(async (file) => {
        const data = await readFileAsDataURL(file);
        return {
          type: file.type.startsWith('video/') ? 'video' : 'image',
          data,
        };
      })
    );

    pendingMediaList = pendingMediaList.concat(processed).slice(0, MAX_MEDIA_FILES);
    renderMediaPreview(pendingMediaList);
  } catch (error) {
    console.warn('No se pudieron cargar los archivos seleccionados.', error);
    alert('No se pudo cargar uno de los archivos seleccionados. Intenta nuevamente.');
  } finally {
    event.target.value = '';
  }
}

function removeMediaAtIndex(index) {
  if (typeof index !== 'number' || Number.isNaN(index)) {
    return;
  }

  if (index < 0 || index >= pendingMediaList.length) {
    return;
  }

  pendingMediaList = pendingMediaList.filter((_, mediaIndex) => mediaIndex !== index);
  renderMediaPreview(pendingMediaList);
}

function populateDetailMedia(mediaList, title) {
  if (!detailMedia) {
    return;
  }

  Array.from(detailMedia.querySelectorAll('video')).forEach((video) => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });

  detailMedia.innerHTML = '';

  const items = Array.isArray(mediaList)
    ? mediaList.filter((media) => media && typeof media.data === 'string')
    : [];

  if (!items.length) {
    detailMedia.hidden = true;
    return;
  }

  detailMedia.hidden = false;

  items.forEach((media, index) => {
    const figure = document.createElement('figure');
    figure.className = 'detail-media__item';

    const captionText = media.type === 'video' ? `Video ${index + 1}` : `Imagen ${index + 1}`;
    const accessibleText = title ? `${captionText} de la noticia ${title}` : captionText;

    if (media.type === 'image') {
      const img = document.createElement('img');
      img.src = media.data;
      img.alt = accessibleText;
      figure.appendChild(img);
    } else if (media.type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;
      video.src = media.data;
      video.setAttribute('title', accessibleText);
      figure.appendChild(video);
    }

    detailMedia.appendChild(figure);
  });
}

function openNewsDetail(newsItem, trigger) {
  lastFocusedTrigger = trigger || document.activeElement;
  detailTitle.textContent = newsItem.title;
  detailDate.textContent = formatDate(newsItem.date);
  detailContent.textContent = newsItem.content;
  populateDetailMedia(newsItem.media, newsItem.title);
  if (detailBody) {
    detailBody.scrollTop = 0;
  }

  newsDetailModal.hidden = false;
  document.body.style.overflow = 'hidden';
  detailCloseButton.focus();
}

function closeNewsDetail() {
  detailTitle.textContent = '';
  detailDate.textContent = '';
  detailContent.textContent = '';
  populateDetailMedia([], '');
  if (detailBody) {
    detailBody.scrollTop = 0;
  }
  newsDetailModal.hidden = true;
  if (loginModal.hidden) {
    document.body.style.overflow = '';
  }
  if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function' && document.contains(lastFocusedTrigger)) {
    lastFocusedTrigger.focus();
  }
  lastFocusedTrigger = null;
}

function renderNews(items = filteredNews) {
  newsSection.innerHTML = '';

  if (!items.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No se encontraron noticias con ese criterio.';
    newsSection.appendChild(emptyState);
    return;
  }

  items
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((newsItem) => {
      const article = newsTemplate.content.cloneNode(true);
      const titleEl = article.querySelector('.news-card__title');
      const dateEl = article.querySelector('.news-card__date');
      const contentEl = article.querySelector('.news-card__content');
      const actionsEl = article.querySelector('.news-card__actions');
      const mediaEl = article.querySelector('.news-card__media');
      const mediaCountEl = article.querySelector('.news-card__media-count');
      const imageEl = article.querySelector('.news-card__image');
      const videoEl = article.querySelector('.news-card__video');
      const editButton = article.querySelector('.edit-button');
      const deleteButton = article.querySelector('.delete-button');
      const openButton = article.querySelector('.news-card__open');

      titleEl.textContent = newsItem.title;
      dateEl.textContent = formatDate(newsItem.date);
      contentEl.textContent = newsItem.content;

      const mediaList = Array.isArray(newsItem.media) ? newsItem.media : [];
      const [primaryMedia, ...extraMedia] = mediaList;

      if (primaryMedia && typeof primaryMedia.data === 'string') {
        mediaEl.hidden = false;
        if (primaryMedia.type === 'image') {
          imageEl.hidden = false;
          imageEl.src = primaryMedia.data;
          imageEl.alt = newsItem.title
            ? `Imagen de la noticia ${newsItem.title}`
            : 'Imagen de la noticia';
          videoEl.hidden = true;
          videoEl.pause();
          videoEl.removeAttribute('src');
          videoEl.load();
        } else if (primaryMedia.type === 'video') {
          imageEl.hidden = true;
          imageEl.src = '';
          imageEl.alt = '';
          videoEl.hidden = false;
          videoEl.src = primaryMedia.data;
          videoEl.load();
        } else {
          mediaEl.hidden = true;
          if (mediaCountEl) {
            mediaCountEl.hidden = true;
            mediaCountEl.textContent = '';
          }
        }

        if (mediaCountEl) {
          if (extraMedia.length) {
            const count = extraMedia.length;
            mediaCountEl.hidden = false;
            mediaCountEl.textContent =
              count === 1 ? '+1 archivo adicional' : `+${count} archivos adicionales`;
          } else {
            mediaCountEl.hidden = true;
            mediaCountEl.textContent = '';
          }
        }
      } else {
        mediaEl.hidden = true;
        imageEl.hidden = true;
        imageEl.src = '';
        imageEl.alt = '';
        videoEl.hidden = true;
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
        if (mediaCountEl) {
          mediaCountEl.hidden = true;
          mediaCountEl.textContent = '';
        }
      }

      actionsEl.hidden = !isAdmin;
      if (isAdmin) {
        editButton.addEventListener('click', () => startEditing(newsItem.id));
        deleteButton.addEventListener('click', () => deleteNews(newsItem.id));
      }

      openButton.addEventListener('click', () => openNewsDetail(newsItem, openButton));

      newsSection.appendChild(article);
    });
}

function filterNews() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    filteredNews = [...newsItems];
  } else {
    filteredNews = newsItems.filter((item) => item.title.toLowerCase().includes(query));
  }
  renderNews();
}

function openModal() {
  if (!newsDetailModal.hidden) {
    closeNewsDetail();
  }
  loginModal.hidden = false;
  document.body.style.overflow = 'hidden';
  loginForm.reset();
  usernameInput.focus();
}

function closeModal() {
  loginModal.hidden = true;
  if (newsDetailModal.hidden) {
    document.body.style.overflow = '';
  }
  loginForm.reset();
}

function authenticate(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string') {
    return false;
  }

  return (
    normalizeCredential(username.trim()) === ADMIN_USER_MATCH &&
    password.trim() === ADMIN_PASSWORD
  );
}

function getScrollBehavior() {
  try {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return 'auto';
    }
  } catch (error) {
    // No es necesario manejar el error, se usa desplazamiento suave por defecto
  }
  return 'smooth';
}

function updateAdminAccessButton() {
  adminAccessButton.textContent = 'Acceso administrador';

  if (isAdmin) {
    adminAccessButton.setAttribute('aria-expanded', adminPanelVisible ? 'true' : 'false');
    adminAccessButton.setAttribute('aria-controls', 'admin-panel');
  } else {
    adminAccessButton.removeAttribute('aria-expanded');
    adminAccessButton.removeAttribute('aria-controls');
  }
}

function showAdminPanel({ scrollIntoView = true, resetForm = false } = {}) {
  if (!isAdmin) {
    return;
  }

  if (!adminPanelVisible) {
    adminPanel.hidden = false;
    adminPanelVisible = true;
  }

  updateAdminAccessButton();

  if (resetForm) {
    clearForm();
  }

  if (scrollIntoView && typeof adminPanel.scrollIntoView === 'function') {
    const behavior = getScrollBehavior();
    const raf =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (callback) => setTimeout(callback, 0);
    raf(() => {
      try {
        adminPanel.scrollIntoView({ behavior, block: 'start' });
      } catch (error) {
        adminPanel.scrollIntoView();
      }
    });
  }
}

function hideAdminPanel() {
  if (!adminPanelVisible) {
    updateAdminAccessButton();
    return;
  }

  adminPanel.hidden = true;
  adminPanelVisible = false;
  updateAdminAccessButton();
}

function handleAdminAccessClick() {
  if (!isAdmin) {
    openModal();
    return;
  }

  showAdminPanel();
}

function handleAdminHome() {
  if (!isAdmin) {
    return;
  }

  hideAdminPanel();
  cancelEditing();
  const behavior = getScrollBehavior();
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    try {
      window.scrollTo({ top: 0, behavior });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }
}

function handleLogin(event) {
  event.preventDefault();
  const usernameValue = usernameInput.value.trim();
  const passwordValue = passwordInput.value.trim();

  if (authenticate(usernameValue, passwordValue)) {
    isAdmin = true;
    closeModal();
    showAdminPanel({ scrollIntoView: true, resetForm: true });
    renderNews();
  } else {
    alert('Usuario o contraseña incorrectos.');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

function handleLogout() {
  isAdmin = false;
  hideAdminPanel();
  cancelEditing();
  renderNews();
}

function clearForm() {
  newsForm.reset();
  pendingMediaList = [];
  renderMediaPreview(pendingMediaList);
  mediaInput.value = '';
  if (!dateInput.value) {
    dateInput.valueAsDate = new Date();
  }
  if (adminPanelVisible) {
    titleInput.focus();
  }
}

function startEditing(id) {
  if (!isAdmin) {
    return;
  }
  const item = newsItems.find((news) => news.id === id);
  if (!item) return;

  showAdminPanel({ scrollIntoView: true });

  editingId = id;
  formTitle.textContent = 'Editar noticia';
  cancelEditButton.hidden = false;
  titleInput.value = item.title;
  dateInput.value = item.date;
  contentInput.value = item.content;
  pendingMediaList = Array.isArray(item.media)
    ? item.media.map((media) => ({ ...media }))
    : [];
  renderMediaPreview(pendingMediaList);
  mediaInput.value = '';
  titleInput.focus();
}

function cancelEditing() {
  editingId = null;
  formTitle.textContent = 'Crear noticia';
  cancelEditButton.hidden = true;
  clearForm();
}

function deleteNews(id) {
  if (!isAdmin) {
    return;
  }
  const confirmation = confirm('¿Deseas eliminar esta noticia?');
  if (!confirmation) return;

  newsItems = newsItems.filter((news) => news.id !== id);
  saveNews();
  filterNews();
}

function handleSubmit(event) {
  event.preventDefault();
  if (!isAdmin) {
    alert('Solo los administradores pueden publicar noticias.');
    return;
  }

  const newItem = {
    title: titleInput.value.trim(),
    date: dateInput.value,
    content: contentInput.value.trim(),
    media: pendingMediaList.map((media) => ({ ...media })),
  };

  if (!newItem.title || !newItem.content || !newItem.date) {
    return;
  }

  if (editingId) {
    newsItems = newsItems.map((news) =>
      news.id === editingId ? { ...news, ...newItem } : news
    );
  } else {
    newsItems.push({ id: createId(), ...newItem });
  }

  saveNews();
  filterNews();
  cancelEditing();
}

function setupEventListeners() {
  searchInput.addEventListener('input', filterNews);
  searchButton.addEventListener('click', (event) => {
    event.preventDefault();
    filterNews();
  });

  adminAccessButton.addEventListener('click', handleAdminAccessClick);
  closeModalButton.addEventListener('click', closeModal);

  loginModal.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      closeModal();
    }
  });

  newsDetailModal.addEventListener('click', (event) => {
    if (event.target === newsDetailModal) {
      closeNewsDetail();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!newsDetailModal.hidden) {
        closeNewsDetail();
      } else if (!loginModal.hidden) {
        closeModal();
      }
    }
  });

  loginForm.addEventListener('submit', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  adminHomeButton.addEventListener('click', handleAdminHome);
  detailCloseButton.addEventListener('click', closeNewsDetail);
  mediaInput.addEventListener('change', handleMediaSelect);
  if (mediaPreviewList) {
    mediaPreviewList.addEventListener('click', (event) => {
      const button = event.target.closest('.media-preview__remove');
      if (!button) {
        return;
      }
      const index = Number(button.dataset.index);
      if (!Number.isNaN(index)) {
        removeMediaAtIndex(index);
      }
    });
  }
  newsForm.addEventListener('submit', handleSubmit);
  cancelEditButton.addEventListener('click', cancelEditing);
}

function initialize() {
  if (!dateInput.value) {
    dateInput.valueAsDate = new Date();
  }
  renderNews();
  setupEventListeners();
  updateAdminAccessButton();
}

initialize();
