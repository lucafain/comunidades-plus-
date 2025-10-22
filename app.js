const STORAGE_KEY = 'comunidadesPlusNews';
const ADMIN_USER = 'Luca';
const ADMIN_PASSWORD = 'Luca3122';

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
const newsForm = document.getElementById('news-form');
const formTitle = document.getElementById('form-title');
const cancelEditButton = document.getElementById('cancel-edit');
const newsTemplate = document.getElementById('news-template');

const titleInput = document.getElementById('news-title');
const dateInput = document.getElementById('news-date');
const contentInput = document.getElementById('news-content');
const mediaInput = document.getElementById('news-media');
const mediaPreviewWrapper = document.getElementById('media-preview-wrapper');
const imagePreview = document.getElementById('image-preview');
const videoPreview = document.getElementById('video-preview');
const removeMediaButton = document.getElementById('remove-media');

const newsDetailModal = document.getElementById('news-detail-modal');
const detailCloseButton = document.getElementById('detail-close');
const detailTitle = document.getElementById('detail-title');
const detailDate = document.getElementById('detail-date');
const detailContent = document.getElementById('detail-content');
const detailMedia = document.getElementById('detail-media');
const detailImage = document.getElementById('detail-image');
const detailVideo = document.getElementById('detail-video');

let newsItems = loadNews();
let filteredNews = [...newsItems];
let isAdmin = false;
let editingId = null;
let pendingMedia = null;
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
      media: null,
      content:
        'Las comunidades de todo el país se reunieron para celebrar Iom Haatzmaut con actividades culturales, música y gastronomía típica. El evento central se realizó en la plaza principal y contó con la participación de jóvenes voluntarios.',
    },
    {
      id: createId(),
      title: 'Nueva iniciativa educativa en Jerusalén',
      date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
      media: null,
      content:
        'El Ministerio de Educación anunció la apertura de un programa de liderazgo para estudiantes secundarios enfocado en innovación social. La propuesta busca fortalecer los lazos entre escuelas y organizaciones comunitarias.',
    },
    {
      id: createId(),
      title: 'Encuentro interreligioso promueve el diálogo',
      date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
      media: null,
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
    return null;
  }

  const { media, mediaType, mediaData, image } = item;

  if (media && typeof media === 'object') {
    const { type, data } = media;
    if ((type === 'image' || type === 'video') && typeof data === 'string' && data) {
      return { type, data };
    }
  }

  if (typeof mediaType === 'string' && typeof mediaData === 'string' && mediaData) {
    const type = mediaType === 'video' ? 'video' : mediaType === 'image' ? 'image' : null;
    if (type) {
      return { type, data: mediaData };
    }
  }

  if (typeof image === 'string' && image) {
    return { type: 'image', data: image };
  }

  return null;
}

function setMediaPreview(media) {
  const hasMedia = media && typeof media === 'object' && typeof media.data === 'string' && media.data;

  if (!hasMedia) {
    mediaPreviewWrapper.hidden = true;
    imagePreview.hidden = true;
    imagePreview.src = '';
    imagePreview.alt = '';
    videoPreview.pause();
    videoPreview.hidden = true;
    videoPreview.removeAttribute('src');
    videoPreview.load();
    return;
  }

  mediaPreviewWrapper.hidden = false;

  if (media.type === 'image') {
    imagePreview.hidden = false;
    imagePreview.src = media.data;
    imagePreview.alt = 'Vista previa de la noticia';
    videoPreview.pause();
    videoPreview.hidden = true;
    videoPreview.removeAttribute('src');
    videoPreview.load();
  } else if (media.type === 'video') {
    imagePreview.hidden = true;
    imagePreview.src = '';
    imagePreview.alt = '';
    videoPreview.hidden = false;
    videoPreview.src = media.data;
    videoPreview.load();
  } else {
    mediaPreviewWrapper.hidden = true;
  }
}

function handleMediaSelect(event) {
  const [file] = event.target.files || [];

  if (!file) {
    pendingMedia = null;
    setMediaPreview(null);
    return;
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    alert('Por favor selecciona un archivo de imagen o video.');
    mediaInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      pendingMedia = {
        type: isVideo ? 'video' : 'image',
        data: reader.result,
      };
      setMediaPreview(pendingMedia);
    } else {
      pendingMedia = null;
      setMediaPreview(null);
      alert('No se pudo cargar el archivo seleccionado. Intenta con otro archivo.');
      mediaInput.value = '';
    }
  };
  reader.onerror = () => {
    console.warn('No se pudo leer el archivo seleccionado.');
    alert('No se pudo cargar el archivo seleccionado. Intenta con otro archivo.');
    pendingMedia = null;
    setMediaPreview(null);
    mediaInput.value = '';
  };
  reader.readAsDataURL(file);
}

function handleRemoveMedia() {
  pendingMedia = null;
  setMediaPreview(null);
  mediaInput.value = '';
}

function populateDetailMedia(media, title) {
  if (!media || !media.data) {
    detailMedia.hidden = true;
    detailImage.hidden = true;
    detailImage.src = '';
    detailImage.alt = '';
    detailVideo.pause();
    detailVideo.hidden = true;
    detailVideo.removeAttribute('src');
    detailVideo.load();
    return;
  }

  if (media.type === 'image') {
    detailMedia.hidden = false;
    detailImage.hidden = false;
    detailImage.src = media.data;
    detailImage.alt = title ? `Imagen de la noticia ${title}` : 'Imagen de la noticia';
    detailVideo.pause();
    detailVideo.hidden = true;
    detailVideo.removeAttribute('src');
    detailVideo.load();
  } else if (media.type === 'video') {
    detailMedia.hidden = false;
    detailImage.hidden = true;
    detailImage.src = '';
    detailImage.alt = '';
    detailVideo.hidden = false;
    detailVideo.src = media.data;
    detailVideo.load();
  } else {
    detailMedia.hidden = true;
    detailImage.hidden = true;
    detailImage.src = '';
    detailImage.alt = '';
    detailVideo.pause();
    detailVideo.hidden = true;
    detailVideo.removeAttribute('src');
    detailVideo.load();
  }
}

function openNewsDetail(newsItem, trigger) {
  lastFocusedTrigger = trigger || document.activeElement;
  detailTitle.textContent = newsItem.title;
  detailDate.textContent = formatDate(newsItem.date);
  detailContent.textContent = newsItem.content;
  populateDetailMedia(newsItem.media, newsItem.title);

  newsDetailModal.hidden = false;
  document.body.style.overflow = 'hidden';
  detailCloseButton.focus();
}

function closeNewsDetail() {
  detailTitle.textContent = '';
  detailDate.textContent = '';
  detailContent.textContent = '';
  populateDetailMedia(null);
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
      const imageEl = article.querySelector('.news-card__image');
      const videoEl = article.querySelector('.news-card__video');
      const editButton = article.querySelector('.edit-button');
      const deleteButton = article.querySelector('.delete-button');
      const openButton = article.querySelector('.news-card__open');

      titleEl.textContent = newsItem.title;
      dateEl.textContent = formatDate(newsItem.date);
      contentEl.textContent = newsItem.content;

      if (newsItem.media && newsItem.media.type === 'image') {
        mediaEl.hidden = false;
        imageEl.hidden = false;
        imageEl.src = newsItem.media.data;
        imageEl.alt = newsItem.title
          ? `Imagen de la noticia ${newsItem.title}`
          : 'Imagen de la noticia';
        videoEl.hidden = true;
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      } else if (newsItem.media && newsItem.media.type === 'video') {
        mediaEl.hidden = false;
        imageEl.hidden = true;
        imageEl.src = '';
        imageEl.alt = '';
        videoEl.hidden = false;
        videoEl.src = newsItem.media.data;
        videoEl.load();
      } else {
        mediaEl.hidden = true;
        imageEl.hidden = true;
        imageEl.src = '';
        imageEl.alt = '';
        videoEl.hidden = true;
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
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
  return username === ADMIN_USER && password === ADMIN_PASSWORD;
}

function handleLogin(event) {
  event.preventDefault();
  const usernameValue = usernameInput.value.trim();
  const passwordValue = passwordInput.value.trim();

  if (authenticate(usernameValue, passwordValue)) {
    isAdmin = true;
    adminPanel.hidden = false;
    adminAccessButton.hidden = true;
    clearForm();
    closeModal();
    renderNews();
  } else {
    alert('Usuario o contraseña incorrectos.');
  }
}

function handleLogout() {
  isAdmin = false;
  adminPanel.hidden = true;
  adminAccessButton.hidden = false;
  cancelEditing();
  renderNews();
}

function clearForm() {
  newsForm.reset();
  pendingMedia = null;
  setMediaPreview(null);
  if (!dateInput.value) {
    dateInput.valueAsDate = new Date();
  }
  if (!adminPanel.hidden) {
    titleInput.focus();
  }
}

function startEditing(id) {
  if (!isAdmin) {
    return;
  }
  const item = newsItems.find((news) => news.id === id);
  if (!item) return;

  editingId = id;
  formTitle.textContent = 'Editar noticia';
  cancelEditButton.hidden = false;
  titleInput.value = item.title;
  dateInput.value = item.date;
  contentInput.value = item.content;
  pendingMedia = item.media ? { ...item.media } : null;
  setMediaPreview(pendingMedia);
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
    media: pendingMedia ? { ...pendingMedia } : null,
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

  adminAccessButton.addEventListener('click', openModal);
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
  detailCloseButton.addEventListener('click', closeNewsDetail);
  mediaInput.addEventListener('change', handleMediaSelect);
  removeMediaButton.addEventListener('click', handleRemoveMedia);
  newsForm.addEventListener('submit', handleSubmit);
  cancelEditButton.addEventListener('click', cancelEditing);
}

function initialize() {
  if (!dateInput.value) {
    dateInput.valueAsDate = new Date();
  }
  renderNews();
  setupEventListeners();
}

initialize();
