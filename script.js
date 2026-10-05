/**
 * EduBooks — Client-side Platform Controller
 */

// Начальные демонстрационные данные, если в LocalStorage пусто
const INITIAL_BOOKS = [
  {
    id: 'b-1',
    title: 'Геометрия. Учебник для 10–11 классов (Атанасян Л.С.)',
    subject: 'Математика',
    condition: 'Отличное',
    createdAt: 'Сегодня в 10:15'
  },
  {
    id: 'b-2',
    title: 'Физика. Базовый уровень. 10 класс (Мякишев Г.Я.)',
    subject: 'Физика',
    condition: 'Новое',
    createdAt: 'Сегодня в 12:40'
  },
  {
    id: 'b-3',
    title: 'История России. 9 класс (в 2-х частях)',
    subject: 'История',
    condition: 'Хорошее',
    createdAt: 'Вчера в 17:20'
  },
  {
    id: 'b-4',
    title: 'Химия. 8 класс (Рудзитис Г.Е., Фельдман Ф.Г.)',
    subject: 'Естествознание',
    condition: 'Требует ремонта',
    createdAt: '03.10.2026'
  }
];

class BookPlatform {
  constructor() {
    this.storageKey = 'edubooks_data_v2';
    this.books = this.loadBooks();
    this.currentFilter = 'all';
    this.searchQuery = '';

    this.initDOMElements();
    this.initEventListeners();
    this.render();
  }

  loadBooks() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_BOOKS));
      return [...INITIAL_BOOKS];
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Ошибка чтения данных, сброс к умолчанию', e);
      return [...INITIAL_BOOKS];
    }
  }

  saveBooks() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.books));
  }

  initDOMElements() {
    // Form elements
    this.form = document.getElementById('bookForm');
    this.titleInput = document.getElementById('bookTitle');
    this.subjectInput = document.getElementById('bookSubject');
    this.conditionSelect = document.getElementById('bookCondition');
    this.submitBtn = document.getElementById('submitBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.btnText = this.submitBtn.querySelector('.btn-text');
    this.btnSpinner = this.submitBtn.querySelector('.btn-spinner');

    // Error alert
    this.errorAlert = document.getElementById('formErrorAlert');
    this.errorList = document.getElementById('formErrorList');

    // Stats
    this.statTotal = document.getElementById('statTotal');
    this.statGood = document.getElementById('statGood');
    this.statRepair = document.getElementById('statRepair');
    this.countAll = document.getElementById('countAll');

    // Catalog & Filter
    this.searchInput = document.getElementById('searchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.filterTabs = document.getElementById('filterTabs');
    this.booksGrid = document.getElementById('booksGrid');
    this.emptyState = document.getElementById('emptyState');
    this.exportBtn = document.getElementById('exportBtn');
    this.clearAllBtn = document.getElementById('clearAllBtn');
    this.toastContainer = document.getElementById('toastContainer');
  }

  initEventListeners() {
    // Submit form
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Reset button
    this.resetBtn.addEventListener('click', () => {
      this.form.reset();
      this.clearErrors();
      this.showToast('Форма очищена', 'info');
    });

    // Real-time input error clearing
    this.titleInput.addEventListener('input', () => {
      if (this.titleInput.value.trim()) {
        this.titleInput.classList.remove('input-invalid');
      }
    });

    this.conditionSelect.addEventListener('change', () => {
      if (this.conditionSelect.value) {
        this.conditionSelect.classList.remove('input-invalid');
      }
    });

    // Search input
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.clearSearchBtn.hidden = !this.searchQuery;
      this.renderCatalog();
    });

    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.clearSearchBtn.hidden = true;
      this.renderCatalog();
    });

    // Filter tabs
    this.filterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab-btn');
      if (!tab) return;
      this.filterTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      tab.classList.add('active');
      this.currentFilter = tab.dataset.filter;
      this.renderCatalog();
    });

    // Export JSON
    this.exportBtn.addEventListener('click', () => this.exportData());

    // Clear all books
    this.clearAllBtn.addEventListener('click', () => this.clearAll());
  }

  clearErrors() {
    this.errorAlert.hidden = true;
    this.errorList.innerHTML = '';
    this.titleInput.classList.remove('input-invalid');
    this.conditionSelect.classList.remove('input-invalid');
  }

  validate() {
    const errors = [];
    const titleVal = this.titleInput.value.trim();
    const conditionVal = this.conditionSelect.value;

    if (!titleVal) {
      errors.push('Укажите название учебника (строка не должна быть пустой).');
      this.titleInput.classList.add('input-invalid');
    }

    if (!conditionVal) {
      errors.push('Выберите состояние книги из выпадающего списка.');
      this.conditionSelect.classList.add('input-invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: {
        title: titleVal,
        subject: this.subjectInput.value.trim() || 'Общее',
        condition: conditionVal
      }
    };
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.clearErrors();

    const { isValid, errors, data } = this.validate();

    if (!isValid) {
      errors.forEach(err => {
        const li = document.createElement('li');
        li.textContent = err;
        this.errorList.appendChild(li);
      });
      this.errorAlert.hidden = false;
      this.showToast('Заполните обязательные поля!', 'error');
      return;
    }

    // Эмуляция сохранения
    this.setSubmitting(true);
    await new Promise(r => setTimeout(r, 450));

    const newBook = {
      id: 'b-' + Date.now(),
      title: data.title,
      subject: data.subject,
      condition: data.condition,
      createdAt: 'Только что'
    };

    this.books.unshift(newBook);
    this.saveBooks();
    this.setSubmitting(false);

    this.form.reset();
    this.render();
    this.showToast(`Учебник «${this.truncate(newBook.title, 28)}» добавлен!`, 'success');
  }

  setSubmitting(isSubmitting) {
    this.submitBtn.disabled = isSubmitting;
    this.btnSpinner.hidden = !isSubmitting;
    this.btnText.textContent = isSubmitting ? 'Сохранение...' : 'Добавить в каталог';
  }

  deleteBook(id) {
    const book = this.books.find(b => b.id === id);
    if (!book) return;

    this.books = this.books.filter(b => b.id !== id);
    this.saveBooks();
    this.render();
    this.showToast(`Книга удалена из каталога`, 'info');
  }

  clearAll() {
    if (this.books.length === 0) {
      this.showToast('Каталог уже пуст', 'info');
      return;
    }
    if (confirm('Вы действительно хотите удалить все учебники из базы?')) {
      this.books = [];
      this.saveBooks();
      this.render();
      this.showToast('Все записи удалены', 'info');
    }
  }

  exportData() {
    if (this.books.length === 0) {
      this.showToast('Нет данных для экспорта', 'info');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.books, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `edubooks_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('Файл JSON успешно сгенерирован', 'success');
  }

  getFilteredBooks() {
    return this.books.filter(book => {
      // Фильтр по состоянию
      if (this.currentFilter !== 'all' && book.condition !== this.currentFilter) {
        return false;
      }
      // Фильтр по поисковому запросу
      if (this.searchQuery) {
        const titleMatch = book.title.toLowerCase().includes(this.searchQuery);
        const subjectMatch = (book.subject || '').toLowerCase().includes(this.searchQuery);
        if (!titleMatch && !subjectMatch) return false;
      }
      return true;
    });
  }

  render() {
    this.renderStats();
    this.renderCatalog();
  }

  renderStats() {
    const total = this.books.length;
    const goodConditionCount = this.books.filter(b => b.condition === 'Новое' || b.condition === 'Отличное').length;
    const repairCount = this.books.filter(b => b.condition === 'Требует ремонта').length;

    this.statTotal.textContent = total;
    this.statGood.textContent = goodConditionCount;
    this.statRepair.textContent = repairCount;
    this.countAll.textContent = total;
  }

  renderCatalog() {
    const filtered = this.getFilteredBooks();

    if (filtered.length === 0) {
      this.booksGrid.innerHTML = '';
      this.emptyState.hidden = false;
      return;
    }

    this.emptyState.hidden = true;
    this.booksGrid.innerHTML = filtered.map(book => {
      const badgeClass = this.getBadgeClass(book.condition);
      return `
        <article class="book-card" data-id="${book.id}">
          <div class="card-top">
            <span class="book-subject-tag">${this.escape(book.subject || 'Книга')}</span>
            <button type="button" class="book-delete-btn" title="Удалить книгу" onclick="app.deleteBook('${book.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
          <h4 class="book-title">${this.escape(book.title)}</h4>
          <div class="card-bottom">
            <span class="condition-badge ${badgeClass}">${this.escape(book.condition)}</span>
            <span class="book-time">${book.createdAt || ''}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  getBadgeClass(condition) {
    switch (condition) {
      case 'Новое': return 'badge-new';
      case 'Отличное': return 'badge-excellent';
      case 'Хорошее': return 'badge-good';
      case 'Требует ремонта': return 'badge-repair';
      default: return '';
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: '✅',
      error: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
      <span class="toast-text">${this.escape(message)}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  escape(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  truncate(str, length) {
    return str.length > length ? str.slice(0, length) + '…' : str;
  }
}

// Запуск приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new BookPlatform();
});
