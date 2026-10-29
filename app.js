(() => {
    const STORAGE_KEY = 'readersJournal.books.v1';
    const form = document.getElementById('book-form')
    const titleInput = document.getElementById('book-title')
    const volumeInput = document.getElementById('book-volume')
    const authorInput = document.getElementById('book-author')
    const chaptersInput = document.getElementById('book-chapters')
    const submitButton = document.getElementById('submit-button')
    const addButton = document.getElementById('add-button');
    const deleteButton = document.getElementById('delete-button');
    const emptyMessage = document.getElementById('empty-message');
    const booksTable = document.getElementById('books-table');
    const booksList = document.getElementById('books-list');
    const selectionHint = document.getElementById('selection-hint');
    const formMessage = document.getElementById('form-message');
    
    
    let books = readBooks();
    let formEnabled = false;
    let selectedId = null;


    function readBooks(){
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed.filter(book => book && book.id && book.title) : [];
        } catch(error){
            console.warn('Could not read Reader\'s Journal storage:', error);
            return [];
        }
    }
    function persist(){
        try{
            localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
            return true;
        }catch(error){
            showMessage('Browser storage is unavailable. Check your browser settings.', true);
            return false;
        }
    }
    function showMessage(message, isError = false){
        formMessage.textContent = message;
        formMessage.classList.toggle('error', isError);
    }
    function setFormEnabled(enabled){
        formEnabled = enabled;
        [titleInput, volumeInput, authorInput, chaptersInput].forEach(input => { input.disabled = !enabled; });
        submitButton.disabled = !enabled;
        if(enabled) titleInput.focus();
    }

    function resetForm(){
        form.reset();
        setFormEnabled(false);
        showMessage('');
    }
    
    function formateDate(timestamp){
        const date= new Date(timestamp);
        if (Number.isNaN(date.getTime())) return 'Unknown';
        return new Intl.DateTimeFormat(undefined, {
            month: 'short', day: '2-digit'
        }).format(date).replace(' ', ',');
    }

    

    function renderBooks(){
        booksList.replaceChildren();
        const hasBooks = books.length > 0;
        emptyMessage.hidden = hasBooks;
        booksTable.hidden = !hasBooks;
        selectionHint.hidden = !hasBooks;
        books.forEach((book, index) => {
            const row = document.createElement('tr');
            row.tabIndex = 0;
            row.setAttribute('aria-label', `Select ${book.title}`);
            row.setAttribute('aria-selected', String(book.id === selectedId));
            if (book.id === selectedId) row.classList.add('selected');
            const titleCell = document.createElement('td');
            const authorCell = document.createElement('td');
            const timeCell= document.createElement('td');
            
            titleCell.textContent = `${index + 1}. ${book.title}`;
            authorCell.textContent= book.author || 'Unknown';
            authorCell.title= book.author || 'Unknown';
            timeCell.textContent = formateDate(book.createdAt);
            timeCell.title = new Date(book.createdAt).toLocaleString();
            row.append(titleCell, authorCell, timeCell);
            const selectRow = () => {
                selectedId = selectedId === book.id ? null: book.id;
                renderBooks();
            };

            row.addEventListener('click', selectRow);
            row.addEventListener('keydown', event =>{
                if(event.key === 'Enter' || event.key === ' '){ 
                    event.preventDefault(); 
                    selectRow();
                }
            });
            booksList.append(row);
        });
    }

    addButton.addEventListener('click', () => {
        if(formEnabled){
            resetForm();
            return;
        }
        selectedId = null;
        renderBooks();
        form.reset();
        setFormEnabled(true);
        showMessage('');
    });

    deleteButton.addEventListener('click', () => {
        if(!selectedId){
            showMessage('Select a book from the list first.', true);
            return;
        }
        const book = books.find(item => item.id === selectedId);
        if(!book) { 
            selectedId = null; 
            renderBooks(); 
            return;
        }
        if(!window.confirm(`Delete "${book.title}" from your journal ?`)) return;
        books = books.filter(item => item.id !== selectedId);
        selectedId = null;
        if(persist()){
            renderBooks();
            showMessage('Book deleted.');
        }
    });

    form.addEventListener('submit', event =>{
        event.preventDefault();
        if(!formEnabled) return;
        const title = titleInput.value.trim();
        if(!title) {
            showMessage('Please enter a book title.', true); 
            titleInput.focus();
            return;
        }
        const rawChapters = chaptersInput.value.trim();
        const chapters= rawChapters === ''? null : Number(rawChapters);
        if(chapters !== null && (!Number.isInteger(chapters) || chapters < 1)) {
            showMessage('Chapter count must be a whole number greater thatn zero.', true);
            chaptersInput.focus();
            return;
        }
        const book = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      volume: volumeInput.value.trim(),
      author: authorInput.value.trim(),
      chaptersCompleted: chapters,
      completionStatus: chapters === null ? 'Fully completed' : 'In progress',
      createdAt: new Date().toISOString()
    };

    books.unshift(book);
    if(!persist()){
        books.shift();
        return;
    }selectedId= book.id;
    renderBooks();
    resetForm();
    showMessage(chapters === null? 'Book saved as fully completed.': 'Book added to your journal');
    });

    window.addEventListener('storage', event =>{
        if(event.key === STORAGE_KEY){
            books=readBooks();
            renderBooks();
        }
    });

    const spookyToggle = document.getElementById('spooky-toggle');

    spookyToggle.addEventListener('click', () =>{
        const enabled = document.body.classList.toggle('spooky-mode');
        spookyToggle.setAttribute('aria-pressed', String(enabled));
        spookyToggle.textContent =  enabled? 'Its Haloweeeee!': 'Turn On Spooky Vibes';
    });

    renderBooks();

    

    
})();

