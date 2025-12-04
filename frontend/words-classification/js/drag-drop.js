class DragDropManager {
    constructor() {
        this.draggedWord = null;
        this.init();
    }

    init() {
        this.initializeEventDelegation();
    }

    initializeEventDelegation() {
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('dragenter', this.handleDragEnter.bind(this));
        document.addEventListener('dragleave', this.handleDragLeave.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));

        console.log('Drag and drop manager initialized');
    }

    handleDragStart(e) {
        if (e.target.classList.contains('word')) {
            this.draggedWord = e.target;
            e.dataTransfer.setData('text/plain', e.target.textContent);
            e.target.classList.add('dragging');
            console.log('Dragging word:', e.target.textContent);
        }
    }

    handleDragOver(e) {
        if (this.isCategoryElement(e.target)) {
            e.preventDefault();
        }
    }

    handleDragEnter(e) {
        const categoryElement = this.getCategoryContainer(e.target);
        if (categoryElement) {
            e.preventDefault();
            categoryElement.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const categoryElement = this.getCategoryContainer(e.target);
        if (categoryElement && !categoryElement.contains(e.relatedTarget)) {
            categoryElement.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        const categoryElement = this.getCategoryContainer(e.target);
        if (categoryElement && this.draggedWord) {
            e.preventDefault();
            categoryElement.classList.remove('drag-over');
            
            const word = this.draggedWord.textContent;
            const categoryId = categoryElement.getAttribute('data-category-id');
            
            console.log('Dropped word:', word, 'into category:', categoryId);
            
            if (window.app && categoryId) {
                window.app.verifyClassification(word, categoryId, this.draggedWord);
            } else {
                console.error('App not initialized or category ID missing');
            }
            
            this.draggedWord = null;
        }
    }

    handleDragEnd(e) {
        const words = document.querySelectorAll('.word');
        words.forEach(word => {
            word.classList.remove('dragging');
        });
        
        const categories = document.querySelectorAll('.category');
        categories.forEach(category => {
            category.classList.remove('drag-over');
        });
        
        this.draggedWord = null;
    }

    isCategoryElement(element) {
        return element.classList.contains('category') || 
               element.classList.contains('classified-words') ||
               element.classList.contains('classified-word') ||
               element.closest('.category');
    }

    getCategoryContainer(element) {
        if (element.classList.contains('category')) {
            return element;
        }
        return element.closest('.category');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dragDropManager = new DragDropManager();
});