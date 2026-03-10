// ===== Global Variables =====
let complaints = [];
let currentEditId = null;

// ===== DOM Content Loaded =====
document.addEventListener('DOMContentLoaded', function() {
    // Load complaints from localStorage
    loadComplaints();
    
    // Initialize page-specific functionality
    initializePage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup animations
    setupAnimations();
});

// ===== Page Initialization =====
function initializePage() {
    const currentPage = window.location.pathname;

    switch(currentPage) {
        case '/':
            initializeHomePage();
            break;

        case '/apply-complaint':
            initializeComplaintForm();
            break;

        case '/previous-complaints':
            initializeComplaintsList();
            break;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;

    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;

        if (linkPath === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});


// ===== Mobile Menu Setup =====
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

// ===== Smooth Scrolling =====
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Animations =====
function setupAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards, stats, and other animated elements
    document.querySelectorAll('.feature-card, .stat-card, .benefit-card, .tech-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== Home Page Initialization =====
function initializeHomePage() {
    // Animate statistics numbers
    animateStats();
    
    // Add parallax effect to hero section
    setupParallax();
}

// ===== Statistics Animation =====
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                entry.target.classList.add('animated');
                
                const updateNumber = () => {
                    current += step;
                    if (current < target) {
                        entry.target.textContent = Math.floor(current);
                        requestAnimationFrame(updateNumber);
                    } else {
                        entry.target.textContent = target;
                    }
                };
                
                updateNumber();
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// ===== Parallax Effect =====
function setupParallax() {
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            heroImage.style.transform = `translateY(${parallax}px)`;
        });
    }
}

// ===== Complaint Form Initialization =====
function initializeComplaintForm() {
    const form = document.getElementById('complaintForm');
    const resetBtn = form?.querySelector('button[type="reset"]');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        
        // Real-time validation
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => clearFieldError(field));
        });
        
        // Initialize file upload
        initializeFileUpload();
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearAllErrors();
            hideSuccessMessage();
            clearImagePreviews();
        });
    }
}

// ===== File Upload Functionality =====
let uploadedImages = [];

function initializeFileUpload() {
    const fileInput = document.getElementById('photoUpload');
    const fileUploadLabel = document.querySelector('.file-upload-label');
    const imagePreviewContainer = document.getElementById('imagePreview');
    
    if (!fileInput || !fileUploadLabel || !imagePreviewContainer) return;
    
    // Click to upload
    fileUploadLabel.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    fileUploadLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadLabel.style.borderColor = 'var(--accent-color)';
        fileUploadLabel.style.background = 'rgba(255, 209, 102, 0.2)';
    });
    
    fileUploadLabel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadLabel.style.borderColor = 'rgba(58, 134, 255, 0.5)';
        fileUploadLabel.style.background = 'rgba(22, 33, 62, 0.5)';
    });
    
    fileUploadLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadLabel.style.borderColor = 'rgba(58, 134, 255, 0.5)';
        fileUploadLabel.style.background = 'rgba(22, 33, 62, 0.5)';
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const photoError = document.getElementById('photoError');
    
    if (imageFiles.length === 0) {
        photoError.textContent = 'Please select valid image files';
        return;
    }
    
    // Check file sizes (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
        photoError.textContent = 'Some files are larger than 10MB';
        return;
    }
    
    // Clear previous error
    photoError.textContent = '';
    
    // Process each file
    imageFiles.forEach(file => {
        if (uploadedImages.length < 5) { // Limit to 5 images
            processImageFile(file);
        }
    });
}

function processImageFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const imageData = {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target.result,
            id: Date.now() + Math.random()
        };
        
        uploadedImages.push(imageData);
        displayImagePreview(imageData);
    };
    
    reader.readAsDataURL(file);
}

function displayImagePreview(imageData) {
    const imagePreviewContainer = document.getElementById('imagePreview');
    
    const previewDiv = document.createElement('div');
    previewDiv.className = 'image-preview';
    previewDiv.dataset.imageId = imageData.id;
    
    const img = document.createElement('img');
    img.src = imageData.dataUrl;
    img.alt = imageData.name;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => removeImage(imageData.id));
    
    previewDiv.appendChild(img);
    previewDiv.appendChild(removeBtn);
    imagePreviewContainer.appendChild(previewDiv);
}

function removeImage(imageId) {
    // Remove from array
    uploadedImages = uploadedImages.filter(img => img.id !== imageId);
    
    // Remove from DOM
    const previewElement = document.querySelector(`[data-image-id="${imageId}"]`);
    if (previewElement) {
        previewElement.remove();
    }
}

function clearImagePreviews() {
    uploadedImages = [];
    const imagePreviewContainer = document.getElementById('imagePreview');
    if (imagePreviewContainer) {
        imagePreviewContainer.innerHTML = '';
    }
    
    // Clear file input
    const fileInput = document.getElementById('photoUpload');
    if (fileInput) {
        fileInput.value = '';
    }
}

// ===== Field Validation =====
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(fieldName)} is required`;
    }
    
    // Specific field validations
    switch(fieldName) {
        case 'studentName':
            if (value && value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            } else if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Name should only contain letters and spaces';
            }
            break;
            
        case 'roomNumber':
            if (value && !/^[A-Z0-9\-\/]+$/.test(value.toUpperCase())) {
                isValid = false;
                errorMessage = 'Invalid room number format';
            }
            break;
            
        case 'contactNumber':
            if (value && !/^\+?[\d\s\-()]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Invalid phone number format';
            } else if (value && value.replace(/\D/g, '').length < 10) {
                isValid = false;
                errorMessage = 'Phone number must be at least 10 digits';
            }
            break;
            
        case 'description':
            if (value && value.length < 10) {
                isValid = false;
                errorMessage = 'Description must be at least 10 characters long';
            } else if (value && value.length > 500) {
                isValid = false;
                errorMessage = 'Description must not exceed 500 characters';
            }
            break;
    }
    
    // Show or hide error message
    const errorElement = document.getElementById(`${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}Error`);
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    // Update field styling
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('valid');
    } else {
        field.classList.add('error');
        field.classList.remove('valid');
    }
    
    return isValid;
}

// ===== Get Field Label =====
function getFieldLabel(fieldName) {
    const labels = {
        studentName: 'Student Name',
        roomNumber: 'Room Number',
        category: 'Category',
        priority: 'Priority',
        description: 'Description',
        contactNumber: 'Contact Number'
    };
    return labels[fieldName] || fieldName;
}

// ===== Clear Field Error =====
function clearFieldError(field) {
    const fieldName = field.name;
    const errorElement = document.getElementById(`${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}Error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
    field.classList.remove('error');
}

// ===== Clear All Errors =====
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
    document.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });
}

// ===== Form Submission =====
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate all fields
    let isFormValid = true;
    form.querySelectorAll('input, select, textarea').forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Please correct the errors in the form', 'error');
        return;
    }
    
    // Create complaint object
    const complaint = {
        id: generateId(),
        studentName: formData.get('studentName'),
        roomNumber: formData.get('roomNumber'),
        category: formData.get('category'),
        priority: formData.get('priority'),
        description: formData.get('description'),
        contactNumber: formData.get('contactNumber'),
        images: uploadedImages, // Add uploaded images
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Save complaint
    saveComplaint(complaint);
    
    // Show success message
    showSuccessMessage();
    
    // Reset form
    form.reset();
    clearAllErrors();
    clearImagePreviews(); // Clear uploaded images
    uploadedImages = []; // Reset images array
    
    // Update statistics if on home page
    updateStatistics();
}

// ===== Generate Unique ID =====
function generateId() {
    return 'CMP' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ===== Save Complaint =====
function saveComplaint(complaint) {
    complaints.push(complaint);
    localStorage.setItem('hostelComplaints', JSON.stringify(complaints));
}

// ===== Load Complaints =====
function loadComplaints() {
    const stored = localStorage.getItem('hostelComplaints');
    if (stored) {
        complaints = JSON.parse(stored);
    }
}

// ===== Show Success Message =====
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.add('show');
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            hideSuccessMessage();
        }, 10000);
    }
}

// ===== Hide Success Message =====
function hideSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.remove('show');
    }
}

// ===== Complaints List Initialization =====
function initializeComplaintsList() {
    loadComplaints();
    displayComplaints();
    setupFilters();
    setupModal();
    updateStatistics();
}

// ===== Display Complaints =====
function displayComplaints(filteredComplaints = null) {
    const container = document.getElementById('complaintsContainer');
    const noComplaintsMessage = document.getElementById('noComplaintsMessage');
    const statsSummary = document.getElementById('statsSummary');
    
    const complaintsToDisplay = filteredComplaints || complaints;
    
    if (complaintsToDisplay.length === 0) {
        if (noComplaintsMessage) {
            noComplaintsMessage.style.display = 'block';
        }
        if (statsSummary) {
            statsSummary.style.display = 'none';
        }
        return;
    }
    
    if (noComplaintsMessage) {
        noComplaintsMessage.style.display = 'none';
    }
    
    if (statsSummary) {
        statsSummary.style.display = 'grid';
    }
    
    // Create complaint cards
    const complaintsHTML = complaintsToDisplay.map(complaint => createComplaintCard(complaint)).join('');
    container.innerHTML = complaintsHTML;
    
    // Add click handlers to complaint cards
    container.querySelectorAll('.complaint-card').forEach(card => {
        card.addEventListener('click', function() {
            const complaintId = this.getAttribute('data-id');
            showComplaintDetails(complaintId);
        });
    });
    
    // Animate cards
    setTimeout(() => {
        container.querySelectorAll('.complaint-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
}

// ===== Create Complaint Card =====
function createComplaintCard(complaint) {
    const statusClass = `status-${complaint.status.replace('_', '-')}`;
    const priorityIcon = getPriorityIcon(complaint.priority);
    const categoryIcon = getCategoryIcon(complaint.category);
    const hasImages = complaint.images && complaint.images.length > 0;
    
    return `
        <div class="complaint-card" data-id="${complaint.id}" style="opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease;">
            <div class="complaint-header">
                <span class="complaint-id">${complaint.id}</span>
                <span class="complaint-status ${statusClass}">${formatStatus(complaint.status)}</span>
            </div>
            <div class="complaint-details">
                <div class="detail-item">
                    <span class="detail-label">Student</span>
                    <span class="detail-value">${complaint.studentName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Room</span>
                    <span class="detail-value">${complaint.roomNumber}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">${categoryIcon} ${formatCategory(complaint.category)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Priority</span>
                    <span class="detail-value">${priorityIcon} ${formatPriority(complaint.priority)}</span>
                </div>
            </div>
            ${hasImages ? `
                <div class="complaint-images">
                    <div class="image-thumbnails">
                        ${complaint.images.slice(0, 3).map(img => `
                            <img src="${img.dataUrl}" alt="${img.name}" class="thumbnail" onclick="viewImage('${img.dataUrl}', '${img.name}')">
                        `).join('')}
                        ${complaint.images.length > 3 ? `
                            <div class="more-images">
                                +${complaint.images.length - 3}
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            <div class="complaint-description">
                ${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}
            </div>
            <div class="complaint-footer">
                <small style="color: rgba(245, 247, 250, 0.6);">
                    ${formatDate(complaint.createdAt)}
                </small>
            </div>
        </div>
    `;
}

// ===== Get Priority Icon =====
function getPriorityIcon(priority) {
    const icons = {
        urgent: '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>',
        high: '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>',
        medium: '<i class="fas fa-info-circle" style="color: #3b82f6;"></i>',
        low: '<i class="fas fa-check-circle" style="color: #22c55e;"></i>'
    };
    return icons[priority] || '';
}

// ===== Get Category Icon =====
function getCategoryIcon(category) {
    const icons = {
        electrical: '<i class="fas fa-bolt"></i>',
        plumbing: '<i class="fas fa-wrench"></i>',
        furniture: '<i class="fas fa-couch"></i>',
        cleaning: '<i class="fas fa-broom"></i>',
        internet: '<i class="fas fa-wifi"></i>',
        security: '<i class="fas fa-shield-alt"></i>',
        noise: '<i class="fas fa-volume-up"></i>',
        maintenance: '<i class="fas fa-tools"></i>',
        other: '<i class="fas fa-ellipsis-h"></i>'
    };
    return icons[category] || '';
}

// ===== Format Status =====
function formatStatus(status) {
    const formatted = {
        pending: 'Pending',
        'in-progress': 'In Progress',
        resolved: 'Resolved',
        rejected: 'Rejected'
    };
    return formatted[status] || status;
}

// ===== Format Category =====
function formatCategory(category) {
    const formatted = {
        electrical: 'Electrical',
        plumbing: 'Plumbing',
        furniture: 'Furniture',
        cleaning: 'Cleaning',
        internet: 'Internet',
        security: 'Security',
        noise: 'Noise',
        maintenance: 'Maintenance',
        other: 'Other'
    };
    return formatted[category] || category;
}

// ===== Format Priority =====
function formatPriority(priority) {
    const formatted = {
        urgent: 'Urgent',
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    };
    return formatted[priority] || priority;
}

// ===== Format Date =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// ===== Setup Filters =====
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterComplaints);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterComplaints);
    }
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterComplaints);
    }
}

// ===== Filter Complaints =====
function filterComplaints() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const priorityValue = priorityFilter ? priorityFilter.value : '';
    
    let filtered = complaints.filter(complaint => {
        const matchesSearch = !searchTerm || 
            complaint.studentName.toLowerCase().includes(searchTerm) ||
            complaint.roomNumber.toLowerCase().includes(searchTerm) ||
            complaint.description.toLowerCase().includes(searchTerm) ||
            complaint.id.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusValue || complaint.status === statusValue;
        const matchesPriority = !priorityValue || complaint.priority === priorityValue;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });
    
    displayComplaints(filtered);
}

// ===== Setup Modal =====
function setupModal() {
    const modal = document.getElementById('complaintModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ===== Show Complaint Details =====
function showComplaintDetails(complaintId) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;
    
    const modal = document.getElementById('complaintModal');
    const modalBody = document.getElementById('modalBody');
    
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="complaint-detail">
                <div class="detail-header">
                    <h4>${complaint.id}</h4>
                    <span class="complaint-status status-${complaint.status.replace('_', '-')}">
                        ${formatStatus(complaint.status)}
                    </span>
                </div>
                <div class="detail-grid">
                    <div class="detail-row">
                        <strong>Student Name:</strong>
                        <span>${complaint.studentName}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Room Number:</strong>
                        <span>${complaint.roomNumber}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Category:</strong>
                        <span>${getCategoryIcon(complaint.category)} ${formatCategory(complaint.category)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Priority:</strong>
                        <span>${getPriorityIcon(complaint.priority)} ${formatPriority(complaint.priority)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Contact Number:</strong>
                        <span>${complaint.contactNumber || 'Not provided'}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Submitted:</strong>
                        <span>${formatDate(complaint.createdAt)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Last Updated:</strong>
                        <span>${formatDate(complaint.updatedAt)}</span>
                    </div>
                </div>
                <div class="detail-description">
                    <strong>Description:</strong>
                    <p>${complaint.description}</p>
                </div>
            </div>
        `;
    }
    
    if (modal) {
        modal.classList.add('show');
    }
}

// ===== Close Modal =====
function closeModal() {
    const modal = document.getElementById('complaintModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// ===== Update Statistics =====
function updateStatistics() {
    const totalComplaints = document.getElementById('totalComplaints');
    const pendingCount = document.getElementById('pendingCount');
    const inProgressCount = document.getElementById('inProgressCount');
    const resolvedCount = document.getElementById('resolvedCount');
    
    if (totalComplaints) {
        totalComplaints.textContent = complaints.length;
    }
    
    if (pendingCount) {
        pendingCount.textContent = complaints.filter(c => c.status === 'pending').length;
    }
    
    if (inProgressCount) {
        inProgressCount.textContent = complaints.filter(c => c.status === 'in-progress').length;
    }
    
    if (resolvedCount) {
        resolvedCount.textContent = complaints.filter(c => c.status === 'resolved').length;
    }
}

// ===== Show Notification =====
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Setup close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ===== Get Notification Icon =====
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// ===== Get Notification Color =====
function getNotificationColor(type) {
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

// ===== Add CSS for notifications =====
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
    }
`;

// Add notification styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// ===== Image Viewer Function =====
function viewImage(imageSrc, imageName) {
    // Create modal for full image view
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <div class="image-modal-header">
                <h4>${imageName}</h4>
                <button class="image-modal-close">&times;</button>
            </div>
            <div class="image-modal-body">
                <img src="${imageSrc}" alt="${imageName}">
            </div>
        </div>
    `;
    
    // Add styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(11, 19, 43, 0.95);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    const closeBtn = modal.querySelector('.image-modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// ===== Export Functions for Testing =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateField,
        saveComplaint,
        loadComplaints,
        generateId,
        formatDate,
        formatStatus,
        formatCategory,
        formatPriority
    };
}
