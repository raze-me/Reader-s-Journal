(() => {
    const STORAGE_KEY = 'readersJournal.books.v1';
    const form = document.getElementById('book-form')
    const titleInput = document.getElementById('book-title')
    const volumeInput = document.getElementById('book-author')
    const chaptersInput = document.getElementById('book-chapters')
    const submitButton = document.getElementById('submit-button')
    

    function readBooks(){
        try {
            const parseed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
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
    
    function formateDate(timestamp){
        const date= new Date(timestamp);
        if (Number.isNaN(date.getTime())) return 'Unknown';
        return new Intl.DateTimeFormat(undefined, {
            month: 'short', day: '2-digit'
        }).format(date).replace(' ', ',');
    }

    
})

