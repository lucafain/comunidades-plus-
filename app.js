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
const imageInput = document.getElementById('news-image');
const imagePreviewWrapper = document.getElementById('image-preview-wrapper');
const imagePreview = document.getElementById('image-preview');
const removeImageButton = document.getElementById('remove-image');

let newsItems = loadNews();
let filteredNews = [...newsItems];
let isAdmin = false;
let editingId = null;
let pendingImageData = null;

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
      image: null,
      content:
        'Las comunidades de todo el país se reunieron para celebrar Iom Haatzmaut con actividades culturales, música y gastronomía típica. El evento central se realizó en la plaza principal y contó con la participación de jóvenes voluntarios.',
    },
    {
      id: createId(),
      title: 'Nueva iniciativa educativa en Jerusalén',
      date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
      image: null,
      content:
        'El Ministerio de Educación anunció la apertura de un programa de liderazgo para estudiantes secundarios enfocado en innovación social. La propuesta busca fortalecer los lazos entre escuelas y organizaciones comunitarias.',
    },
    {
      id: createId(),
      title: 'Encuentro interreligioso promueve el diálogo',
      date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
      image: null,
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
      image: typeof item.image === 'string' ? item.image : null,
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

function setImagePreview(dataUrl) {
  if (dataUrl) {
    imagePreview.src = dataUrl;
    imagePreview.alt = 'Vista previa de la noticia';
    imagePreviewWrapper.hidden = false;
  } else {
    imagePreview.src = '';
    imagePreview.alt = '';
    imagePreviewWrapper.hidden = true;
  }
}

function handleImageSelect(event) {
  const [file] = event.target.files || [];

  if (!file) {
    pendingImageData = null;
    setImagePreview(null);
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen.');
    imageInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      pendingImageData = reader.result;
      setImagePreview(pendingImageData);
    } else {
      pendingImageData = null;
      setImagePreview(null);
      alert('No se pudo cargar la imagen seleccionada. Intenta con otro archivo.');
      imageInput.value = '';
    }
  };
  reader.onerror = () => {
    console.warn('No se pudo leer la imagen seleccionada.');
    alert('No se pudo cargar la imagen seleccionada. Intenta con otro archivo.');
    pendingImageData = null;
    setImagePreview(null);
    imageInput.value = '';
  };
  reader.readAsDataURL(file);
}

function handleRemoveImage() {
  pendingImageData = null;
  setImagePreview(null);
  imageInput.value = '';
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
      const editButton = article.querySelector('.edit-button');
      const deleteButton = article.querySelector('.delete-button');

      titleEl.textContent = newsItem.title;
      dateEl.textContent = formatDate(newsItem.date);
      contentEl.textContent = newsItem.content;

      if (newsItem.image) {
        mediaEl.hidden = false;
        imageEl.src = newsItem.image;
        imageEl.alt = newsItem.title
          ? `Imagen de la noticia ${newsItem.title}`
          : 'Imagen de la noticia';
      } else {
        mediaEl.hidden = true;
        imageEl.src = '';
        imageEl.alt = '';
      }

      actionsEl.hidden = !isAdmin;
      if (isAdmin) {
        editButton.addEventListener('click', () => startEditing(newsItem.id));
        deleteButton.addEventListener('click', () => deleteNews(newsItem.id));
      }

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
  loginModal.hidden = false;
  document.body.style.overflow = 'hidden';
  loginForm.reset();
  usernameInput.focus();
}

function closeModal() {
  loginModal.hidden = true;
  document.body.style.overflow = '';
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
  pendingImageData = null;
  setImagePreview(null);
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
  pendingImageData = item.image || null;
  setImagePreview(pendingImageData);
  imageInput.value = '';
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
    image: pendingImageData,
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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !loginModal.hidden) {
      closeModal();
    }
  });

  loginForm.addEventListener('submit', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  imageInput.addEventListener('change', handleImageSelect);
  removeImageButton.addEventListener('click', handleRemoveImage);
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
