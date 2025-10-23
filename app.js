const STORAGE_KEY = 'comunidadesPlusNoticias';
const ADMIN_ACCOUNTS = Object.freeze([
  { username: 'Luca', password: 'Luca3122', displayName: 'Luca' },
  { username: 'Natalio', password: '1234', displayName: 'Natalio' },
]);
const ADMIN_LOOKUP = new Map(
  ADMIN_ACCOUNTS.map((account) => [account.username.trim().toLowerCase(), account])
);

const state = {
  posts: [],
  filteredPosts: [],
  isAdmin: false,
  currentAdmin: null,
  editingPostId: null,
  attachments: [],
};

const elements = {
  newsList: document.getElementById('newsList'),
  adminNewsList: document.getElementById('adminNewsList'),
  searchInput: document.getElementById('searchInput'),
  adminAccessBtn: document.getElementById('adminAccessBtn'),
  adminPanel: document.getElementById('adminPanel'),
  adminHomeBtn: document.getElementById('adminHomeBtn'),
  adminLogoutBtn: document.getElementById('adminLogoutBtn'),
  loginModal: document.getElementById('loginModal'),
  loginForm: document.getElementById('loginForm'),
  loginError: document.getElementById('loginError'),
  usernameInput: document.getElementById('usernameInput'),
  passwordInput: document.getElementById('passwordInput'),
  newsForm: document.getElementById('newsForm'),
  titleInput: document.getElementById('titleInput'),
  contentInput: document.getElementById('contentInput'),
  mediaInput: document.getElementById('mediaInput'),
  mediaPreview: document.getElementById('mediaPreview'),
  resetFormBtn: document.getElementById('resetFormBtn'),
  detailModal: document.getElementById('detailModal'),
  detailTitle: document.getElementById('detailTitle'),
  detailDate: document.getElementById('detailDate'),
  detailMedia: document.getElementById('detailMedia'),
  detailBody: document.getElementById('detailBody'),
  emptyStateTemplate: document.getElementById('emptyStateTemplate'),
};

let lastFocusedElement = null;

init();

function init() {
  loadPosts();
  state.filteredPosts = [...state.posts];
  renderNewsList();
  renderAdminList();
  bindEvents();
}

function bindEvents() {
  elements.searchInput.addEventListener('input', handleSearch);
  elements.adminAccessBtn.addEventListener('click', () => {
    if (state.isAdmin) {
      showAdminPanel();
    } else {
      openLoginModal();
    }
  });

  elements.adminHomeBtn.addEventListener('click', hideAdminPanel);
  elements.adminLogoutBtn.addEventListener('click', handleLogout);

  elements.resetFormBtn.addEventListener('click', resetForm);
  elements.mediaInput.addEventListener('change', handleMediaSelection);

  elements.newsForm.addEventListener('submit', handleNewsSubmit);

  elements.loginForm.addEventListener('submit', handleLogin);

  elements.loginModal.addEventListener('click', (event) => {
    if (event.target === elements.loginModal) {
      closeModal(elements.loginModal);
    }
  });

  elements.detailModal.addEventListener('click', (event) => {
    if (event.target === elements.detailModal) {
      closeModal(elements.detailModal);
    }
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const modal = event.target.closest('.modal');
      if (modal) {
        closeModal(modal);
      }
    });
  });

  elements.newsList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-view-detail]');
    if (!button) return;
    const post = state.posts.find((item) => item.id === button.dataset.postId);
    if (post) {
      openDetail(post, button);
    }
  });

  elements.adminNewsList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    const postId = actionButton.dataset.postId;
    if (!postId) return;
    if (actionButton.dataset.action === 'edit') {
      beginEdit(postId);
    } else if (actionButton.dataset.action === 'delete') {
      deletePost(postId);
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!elements.detailModal.classList.contains('hidden')) {
        closeModal(elements.detailModal);
      } else if (!elements.loginModal.classList.contains('hidden')) {
        closeModal(elements.loginModal);
      }
    }
  });
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createAssetAttachment(src, name) {
  return {
    id: createId('att'),
    type: src.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image',
    name,
    data: src,
    isAsset: true,
  };
}

function createDefaultPosts() {
  return [
    {
      id: createId('post'),
      title: 'Celebración de Yom Ha’atzmaut en la comunidad',
      content:
        'Compartimos un día lleno de emoción, música y gastronomía típica para conmemorar el Día de la Independencia de Israel. Más de 300 familias participaron de los talleres para chicos, de los homenajes y de la ceremonia central en nuestra sede social.',
      attachments: [
        createAssetAttachment('assets/israel-flag-waving.svg', 'Bandera flameando'),
        createAssetAttachment('assets/israel-flag.svg', 'Emblema de Israel'),
      ],
      author: 'Redacción Comunidades Plus',
      createdAt: new Date('2024-05-08T18:00:00Z').toISOString(),
      updatedAt: null,
    },
    {
      id: createId('post'),
      title: 'Nueva biblioteca comunitaria con enfoque juvenil',
      content:
        'Inauguramos un espacio dedicado a los jóvenes con colecciones renovadas, talleres literarios y un rincón multimedia. El equipo de voluntarios estará disponible de lunes a viernes para recomendar lecturas y acompañar proyectos escolares.',
      attachments: [createAssetAttachment('assets/israel-flag-clouds.svg', 'Cielo inspirado en la bandera')],
      author: 'Redacción Comunidades Plus',
      createdAt: new Date('2024-04-22T14:30:00Z').toISOString(),
      updatedAt: null,
    },
  ];
}

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        state.posts = parsed.map(normalizePost);
        return;
      }
    }
  } catch (error) {
    console.warn('No se pudo leer el contenido guardado:', error);
  }

  state.posts = createDefaultPosts();
  persistPosts();
}

function normalizePost(post) {
  return {
    id: post.id || createId('post'),
    title: post.title || 'Noticia sin título',
    content: post.content || '',
    attachments: Array.isArray(post.attachments)
      ? post.attachments.map((attachment) => ({
          id: attachment.id || createId('att'),
          type: attachment.type === 'video' ? 'video' : 'image',
          name: attachment.name || 'Archivo',
          data: attachment.data,
          isAsset: Boolean(attachment.isAsset),
        }))
      : [],
    author: post.author || 'Redacción Comunidades Plus',
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || null,
  };
}

function persistPosts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
  } catch (error) {
    console.warn('No se pudieron guardar las noticias:', error);
  }
}

function handleSearch(event) {
  const term = event.target.value.trim().toLowerCase();
  if (!term) {
    state.filteredPosts = [...state.posts];
  } else {
    state.filteredPosts = state.posts.filter((post) =>
      post.title.toLowerCase().includes(term)
    );
  }
  renderNewsList();
}

function renderNewsList() {
  elements.newsList.innerHTML = '';

  if (state.filteredPosts.length === 0) {
    const template = elements.emptyStateTemplate.content.cloneNode(true);
    elements.newsList.append(template);
    return;
  }

  state.filteredPosts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((post) => {
      const card = document.createElement('article');
      card.className = 'card';

      if (post.attachments.length > 0) {
        const media = document.createElement('div');
        media.className = 'card__media';
        media.append(renderThumbnail(post.attachments[0]));
        card.append(media);
      }

      const body = document.createElement('div');
      body.className = 'card__body';

      const title = document.createElement('h3');
      title.className = 'card__title';
      title.textContent = post.title;
      body.append(title);

      const excerpt = document.createElement('p');
      excerpt.className = 'card__excerpt';
      excerpt.textContent = post.content;
      body.append(excerpt);

      const footer = document.createElement('div');
      footer.className = 'card__footer';

      const meta = document.createElement('span');
      meta.className = 'card__meta';
      meta.textContent = formatDate(post.updatedAt || post.createdAt);
      footer.append(meta);

      if (post.attachments.length > 0) {
        const count = document.createElement('span');
        count.className = 'card__meta';
        count.textContent = `${post.attachments.length} archivo${post.attachments.length > 1 ? 's' : ''}`;
        footer.append(count);
      }

      const button = document.createElement('button');
      button.className = 'card__button';
      button.type = 'button';
      button.dataset.viewDetail = 'true';
      button.dataset.postId = post.id;
      button.textContent = 'Ver noticia completa';
      footer.append(button);

      body.append(footer);
      card.append(body);
      elements.newsList.append(card);
    });
}

function renderThumbnail(attachment) {
  if (attachment.type === 'video') {
    const video = document.createElement('video');
    video.src = resolveAttachmentSource(attachment);
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('aria-label', attachment.name || 'Video adjunto');
    return video;
  }
  const img = document.createElement('img');
  img.src = resolveAttachmentSource(attachment);
  img.alt = attachment.name || 'Imagen adjunta';
  loadingLazy(img);
  return img;
}

function renderAdminList() {
  elements.adminNewsList.innerHTML = '';

  const posts = state.posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  posts.forEach((post) => {
    const card = document.createElement('div');
    card.className = 'admin-card';

    const title = document.createElement('h4');
    title.className = 'admin-card__title';
    title.textContent = post.title;
    card.append(title);

    const meta = document.createElement('p');
    meta.className = 'card__meta';
    const updated = post.updatedAt ? `Actualizada ${formatDate(post.updatedAt)}` : `Publicada ${formatDate(post.createdAt)}`;
    const attachmentsInfo = post.attachments.length
      ? ` · ${post.attachments.length} archivo${post.attachments.length > 1 ? 's' : ''}`
      : '';
    meta.textContent = `${updated}${attachmentsInfo}`;
    card.append(meta);

    const actions = document.createElement('div');
    actions.className = 'admin-card__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--ghost';
    editBtn.type = 'button';
    editBtn.dataset.action = 'edit';
    editBtn.dataset.postId = post.id;
    editBtn.textContent = 'Editar';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--danger';
    deleteBtn.type = 'button';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.postId = post.id;
    deleteBtn.textContent = 'Eliminar';

    actions.append(editBtn, deleteBtn);
    card.append(actions);

    elements.adminNewsList.append(card);
  });
}

async function handleMediaSelection(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) {
    return;
  }

  const availableSlots = 2 - state.attachments.length;
  if (availableSlots <= 0) {
    showToast('Solo podés adjuntar hasta 2 archivos.');
    event.target.value = '';
    return;
  }

  const filesToProcess = files.slice(0, availableSlots);
  for (const file of filesToProcess) {
    const attachment = await createAttachmentFromFile(file);
    state.attachments.push(attachment);
  }

  updateMediaPreview();
  event.target.value = '';
}

function createAttachmentFromFile(file) {
  const type = file.type.startsWith('video') ? 'video' : 'image';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: createId('att'),
        type,
        name: file.name,
        data: reader.result,
        isAsset: false,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateMediaPreview() {
  elements.mediaPreview.innerHTML = '';
  state.attachments.forEach((attachment) => {
    const container = document.createElement('div');
    container.className = 'media-preview__item';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'media-preview__remove';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
      state.attachments = state.attachments.filter((item) => item.id !== attachment.id);
      updateMediaPreview();
    });

    container.append(removeBtn, renderThumbnail(attachment));
    elements.mediaPreview.append(container);
  });
}

function handleNewsSubmit(event) {
  event.preventDefault();
  const title = elements.titleInput.value.trim();
  const content = elements.contentInput.value.trim();
  if (!title || !content) {
    showToast('Completá el título y el contenido.');
    return;
  }

  if (state.attachments.length > 2) {
    showToast('Solo podés adjuntar hasta 2 archivos.');
    return;
  }

  if (state.editingPostId) {
    updatePost(title, content);
  } else {
    createPost(title, content);
  }

  persistPosts();
  state.filteredPosts = [...state.posts];
  renderNewsList();
  renderAdminList();
  resetForm();
}

function createPost(title, content) {
  const newPost = {
    id: createId('post'),
    title,
    content,
    attachments: state.attachments.map(cloneAttachment),
    author: state.currentAdmin?.displayName || 'Administrador',
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  state.posts.push(newPost);
  showToast('Noticia creada.');
}

function updatePost(title, content) {
  const index = state.posts.findIndex((post) => post.id === state.editingPostId);
  if (index === -1) {
    showToast('No encontramos la noticia a actualizar.');
    return;
  }

  state.posts[index] = {
    ...state.posts[index],
    title,
    content,
    attachments: state.attachments.map(cloneAttachment),
    updatedAt: new Date().toISOString(),
  };
  showToast('Noticia actualizada.');
}

function beginEdit(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) {
    showToast('No encontramos la noticia seleccionada.');
    return;
  }

  state.editingPostId = post.id;
  elements.titleInput.value = post.title;
  elements.contentInput.value = post.content;
  state.attachments = post.attachments.map(cloneAttachment);
  updateMediaPreview();
  elements.mediaInput.value = '';
  elements.newsForm.querySelector('button[type="submit"]').textContent = 'Actualizar noticia';
  showToast('Editando noticia seleccionada.');
}

function deletePost(postId) {
  if (!confirm('¿Seguro que querés eliminar esta noticia?')) {
    return;
  }

  const index = state.posts.findIndex((post) => post.id === postId);
  if (index === -1) {
    showToast('La noticia ya no existe.');
    return;
  }

  state.posts.splice(index, 1);
  if (state.editingPostId === postId) {
    resetForm();
  }
  persistPosts();
  state.filteredPosts = [...state.posts];
  renderNewsList();
  renderAdminList();
  showToast('Noticia eliminada.');
}

function cloneAttachment(attachment) {
  return {
    id: attachment.id || createId('att'),
    type: attachment.type === 'video' ? 'video' : 'image',
    name: attachment.name,
    data: attachment.data,
    isAsset: Boolean(attachment.isAsset),
  };
}

function resetForm() {
  state.editingPostId = null;
  state.attachments = [];
  elements.newsForm.reset();
  updateMediaPreview();
  const submitButton = elements.newsForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.textContent = 'Guardar noticia';
  }
}

function handleLogin(event) {
  event.preventDefault();
  const username = elements.usernameInput.value.trim().toLowerCase();
  const password = elements.passwordInput.value;

  const account = ADMIN_LOOKUP.get(username);
  if (!account || account.password !== password) {
    elements.loginError.textContent = 'Usuario o contraseña incorrectos.';
    elements.loginError.hidden = false;
    elements.passwordInput.value = '';
    elements.passwordInput.focus();
    return;
  }

  elements.loginError.hidden = true;
  state.isAdmin = true;
  state.currentAdmin = account;
  closeModal(elements.loginModal);
  showAdminPanel();
  showToast(`¡Bienvenido, ${account.displayName}!`);
  elements.loginForm.reset();
}

function handleLogout() {
  state.isAdmin = false;
  state.currentAdmin = null;
  resetForm();
  hideAdminPanel();
  showToast('Sesión finalizada.');
}

function openLoginModal() {
  lastFocusedElement = document.activeElement;
  elements.loginModal.classList.remove('hidden');
  document.body.classList.add('no-scroll');
  elements.loginModal.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => {
    elements.usernameInput.focus();
  }, 50);
}

function openDetail(post, trigger) {
  lastFocusedElement = trigger || document.activeElement;
  elements.detailTitle.textContent = post.title;
  elements.detailDate.textContent = formatDate(post.updatedAt || post.createdAt, true);
  elements.detailDate.setAttribute('datetime', post.updatedAt || post.createdAt);
  elements.detailBody.textContent = post.content;
  elements.detailMedia.innerHTML = '';

  if (post.attachments.length > 0) {
    post.attachments.forEach((attachment) => {
      const mediaWrapper = document.createElement('div');
      mediaWrapper.append(renderDetailMedia(attachment));
      elements.detailMedia.append(mediaWrapper);
    });
  }

  elements.detailModal.classList.remove('hidden');
  document.body.classList.add('no-scroll');
  elements.detailModal.setAttribute('aria-hidden', 'false');
  elements.detailModal.querySelector('.modal__close').focus();
}

function renderDetailMedia(attachment) {
  if (attachment.type === 'video') {
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.src = resolveAttachmentSource(attachment);
    video.setAttribute('aria-label', attachment.name || 'Video de la noticia');
    return video;
  }
  const image = document.createElement('img');
  image.src = resolveAttachmentSource(attachment);
  image.alt = attachment.name || 'Imagen de la noticia';
  loadingLazy(image);
  return image;
}

function resolveAttachmentSource(attachment) {
  if (attachment.isAsset) {
    return attachment.data;
  }
  return attachment.data;
}

function closeModal(modal) {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  if (modal === elements.loginModal) {
    elements.loginForm.reset();
    elements.loginError.hidden = true;
  }
  if (modal === elements.detailModal) {
    elements.detailMedia.scrollTop = 0;
  }
  if (lastFocusedElement) {
    lastFocusedElement.focus({ preventScroll: true });
  }
}

function showAdminPanel() {
  elements.adminPanel.classList.add('visible');
  elements.adminPanel.classList.remove('hidden');
  elements.adminPanel.setAttribute('aria-hidden', 'false');
  renderAdminList();
}

function hideAdminPanel() {
  elements.adminPanel.classList.remove('visible');
  elements.adminPanel.classList.add('hidden');
  elements.adminPanel.setAttribute('aria-hidden', 'true');
}

function formatDate(dateValue, includeTime = false) {
  const date = new Date(dateValue);
  const options = includeTime
    ? { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('es-AR', options).format(date);
}

function loadingLazy(element) {
  element.loading = 'lazy';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => {
    toast.classList.add('toast--hide');
  }, 2600);
  setTimeout(() => {
    toast.remove();
  }, 3200);
}
