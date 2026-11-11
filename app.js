// --- EXTENSIVE FONTS DATABASES (Curated Google Fonts for Hindi & English) ---
let HINDI_FONTS = [
    'Noto Sans Devanagari', 'Rozha One', 'Yatra One', 'Kalam', 'Modak', 'Rajdhani',
    'Poppins', 'Khand', 'Teko', 'Gotu', 'Karma', 'Amita', 'Sahitya', 'Kurale',
    'Eczar', 'Ranga', 'Palanquin', 'Laila', 'Jaldi', 'Arya', 'Sarala', 'Tillana',
    'Biryani', 'Halant', 'Cambay', 'Sura', 'Vesper Libre', 'Pragati Narrow',
    'Rhodium Libre', 'Kadwa', 'Jaini', 'Jaini Purva', 'Mukta', 'Tiro Devanagari Hindi'
];

let ENGLISH_FONTS = [
    'Outfit', 'Poppins', 'Montserrat', 'Playfair Display', 'Bebas Neue', 'Inter',
    'Roboto', 'Oswald', 'Pacifico', 'Cinzel', 'Righteous', 'Caveat', 'Abril Fatface',
    'Anton', 'Dancing Script', 'Lobster', 'Satisfy', 'Cinzel Decorative', 'Great Vibes',
    'Sacramento', 'Playball', 'Courgette', 'Permanent Marker', 'Shadows Into Light',
    'Kaushan Script', 'Gloria Hallelujah', 'Alex Brush', 'Bad Script', 'Marck Script',
    'Tangerine', 'Yellowtail', 'Parisienne', 'Italianno', 'Allura', 'Pinyon Script'
];

// --- STATE MANAGEMENT ---
const state = {
    format: '9:16', // '9:16' (1080x1920) or '1:1' (1080x1080)
    bgType: 'color', // 'color' or 'image' (Default: 'color')
    solidColor: '#ffffff', // Default: white
    textColor: '#111111', // Default: dark text for white background
    imageOrientation: 'both', // 'both', 'portrait', or 'landscape'
    selectedImageUrl: '',
    selectedImageElement: null,
    searchPrompt: '',
    loadedCount: 0,
    textAlignment: 'center',
    loadedFonts: new Set(),
    activeFontFamily: "'Noto Sans Devanagari', sans-serif",
    textX: 540,
    textY: 960,
    textBounds: null,
    maxTextWidth: 918,
    isTextSelected: false,
    resizeCorners: null,
    sideHandles: null
};

// Inline Font Browser State
const fontState = {
    lang: 'hindi', // 'hindi' or 'english'
    query: '',
    page: 1,
    pageSize: 12
};

// --- DOM ELEMENTS ---
const quoteInput = document.getElementById('quote-input');
const charCounter = document.getElementById('char-counter');
const promptInput = document.getElementById('prompt-input');
const btnGenerateAi = document.getElementById('btn-generate-ai');
const aiSpinner = document.getElementById('ai-spinner');
const imageGrid = document.getElementById('image-grid');
const btnLoadMore = document.getElementById('btn-load-more');
const loadMoreSpinner = document.getElementById('load-more-spinner');

// Post Format Controls (9:16 Story vs 1:1 Square)
const btnFormatStory = document.getElementById('btn-format-story');
const btnFormatSquare = document.getElementById('btn-format-square');
const previewAspectContainer = document.getElementById('preview-aspect-container');
const previewFormatPill = document.getElementById('preview-format-pill');

// Image Orientation Controls
const btnOrientBoth = document.getElementById('btn-orient-both');
const btnOrientPortrait = document.getElementById('btn-orient-portrait');
const btnOrientLandscape = document.getElementById('btn-orient-landscape');

// Background Mode & Solid Color Controls
const btnBgSolid = document.getElementById('btn-bg-solid');
const btnBgImage = document.getElementById('btn-bg-image');
const solidColorControls = document.getElementById('solid-color-controls');
const imageBgControls = document.getElementById('image-bg-controls');
const solidColorPicker = document.getElementById('solid-color-picker');
const solidColorVal = document.getElementById('solid-color-val');
const solidColorPresets = document.querySelectorAll('.color-swatch-btn');
const textColorPicker = document.getElementById('text-color-picker');
const textColorVal = document.getElementById('text-color-val');

// File Upload
const btnBrowseImg = document.getElementById('btn-browse-img');
const fileUpload = document.getElementById('file-upload');

// Inline Typography Controls
const activeFontDisplay = document.getElementById('active-font-display');
const btnFontHindi = document.getElementById('btn-font-hindi');
const btnFontEnglish = document.getElementById('btn-font-english');
const fontSearchInput = document.getElementById('font-search-input');
const fontsInlineList = document.getElementById('fonts-inline-list');

// Customizer Controls
const sizeSlider = document.getElementById('size-slider');
const sizeVal = document.getElementById('size-val');
const positionSlider = document.getElementById('position-slider');
const positionVal = document.getElementById('position-val');
const alignButtons = document.querySelectorAll('#align-group .btn-toggle');

// Canvas
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');

// Download & Modal
const btnDownload8k = document.getElementById('btn-download-8k');
const downloadSpinner = document.getElementById('download-spinner');
const modalProcessing = document.getElementById('modal-processing');

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    setupCanvas();
    setupEventListeners();

    // Default to Solid Color (White)
    setBackgroundType('color');
    updateSolidColor('#ffffff');
    updateTextColor('#111111');
    updateCharCount();

    // Initialize Format (9:16 default)
    setPostFormat('9:16');

    // Initialize Inline Font Browser
    if (activeFontDisplay) {
        activeFontDisplay.textContent = 'Noto Sans Devanagari';
    }
    renderInlineFonts(true);

    // Dynamic Fonts Database from CDN in background
    loadGoogleFontsDatabase();

    document.fonts.ready.then(() => {
        drawCanvasPreview();
    });
});

async function loadGoogleFontsDatabase() {
    try {
        console.log("Fetching all available free fonts from live CDN...");
        const [hindiRes, englishRes] = await Promise.all([
            fetch('https://cdn.jsdelivr.net/gh/hasinhayder/google-fonts/subsets/devanagari/fonts.json'),
            fetch('https://cdn.jsdelivr.net/gh/hasinhayder/google-fonts/subsets/latin/fonts.json')
        ]);

        if (hindiRes.ok && englishRes.ok) {
            const hindiData = await hindiRes.json();
            const englishData = await englishRes.json();

            if (hindiData.fonts && hindiData.fonts.length > 0) {
                const set = new Set([...HINDI_FONTS, ...hindiData.fonts]);
                HINDI_FONTS = Array.from(set);
            }
            if (englishData.fonts && englishData.fonts.length > 0) {
                const set = new Set([...ENGLISH_FONTS, ...englishData.fonts]);
                ENGLISH_FONTS = Array.from(set);
            }
            console.log(`Successfully loaded ${HINDI_FONTS.length} Hindi fonts and ${ENGLISH_FONTS.length} English fonts dynamically!`);
            renderInlineFonts(false);
            return;
        }
    } catch (cdnErr) {
        console.warn("Failed to load fonts from CDN, trying backend proxy:", cdnErr);
    }

    try {
        if (window.location.protocol.startsWith('http')) {
            const response = await fetch('/api/fonts');
            if (response.ok) {
                const data = await response.json();
                if (data.hindi && data.hindi.length > 0) {
                    const set = new Set([...HINDI_FONTS, ...data.hindi]);
                    HINDI_FONTS = Array.from(set);
                }
                if (data.english && data.english.length > 0) {
                    const set = new Set([...ENGLISH_FONTS, ...data.english]);
                    ENGLISH_FONTS = Array.from(set);
                }
                renderInlineFonts(false);
            }
        }
    } catch (e) {
        console.error("Failed to load dynamic fonts database, using local fallback:", e);
    }
}

function setupCanvas() {
    canvas.width = 1080;
    canvas.height = state.format === '1:1' ? 1080 : 1920;
}

// --- POST FORMAT CONTROLLER (9:16 Story vs 1:1 Square) ---
function setPostFormat(format) {
    state.format = format; // '9:16' or '1:1'

    if (format === '1:1') {
        canvas.width = 1080;
        canvas.height = 1080;
        if (previewAspectContainer) previewAspectContainer.classList.add('format-square');
        if (previewFormatPill) previewFormatPill.textContent = '1:1 Square';
        if (btnFormatStory) btnFormatStory.classList.remove('active');
        if (btnFormatSquare) btnFormatSquare.classList.add('active');
    } else {
        canvas.width = 1080;
        canvas.height = 1920;
        if (previewAspectContainer) previewAspectContainer.classList.remove('format-square');
        if (previewFormatPill) previewFormatPill.textContent = '9:16 Story';
        if (btnFormatStory) btnFormatStory.classList.add('active');
        if (btnFormatSquare) btnFormatSquare.classList.remove('active');
    }

    if (positionSlider) {
        state.textY = canvas.height * (parseInt(positionSlider.value) / 100);
    }
    state.textX = canvas.width / 2;

    drawCanvasPreview();
}

// --- IMAGE ORIENTATION FILTER CONTROLLER ---
function setImageOrientation(orientation) {
    if (state.imageOrientation === orientation) return;
    state.imageOrientation = orientation;

    const orientBtns = [
        { el: btnOrientBoth, val: 'both' },
        { el: btnOrientPortrait, val: 'portrait' },
        { el: btnOrientLandscape, val: 'landscape' }
    ];

    orientBtns.forEach(({ el, val }) => {
        if (el) {
            el.classList.toggle('active', val === orientation);
        }
    });

    const query = promptInput ? promptInput.value.trim() : '';
    if (query) {
        generateAiImages(query, true);
    }
}

// --- INLINE TYPOGRAPHY CONTROLLERS ---
function loadWebFont(family) {
    if (!family) return;
    const cleanFamily = family.replace(/['"]/g, '').split(',')[0].trim();
    if (state.loadedFonts.has(cleanFamily)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const url = `https://fonts.googleapis.com/css2?family=${cleanFamily.replace(/ /g, '+')}&display=swap`;
    link.href = url;
    document.head.appendChild(link);
    state.loadedFonts.add(cleanFamily);
}

function getSamplePreviewText() {
    const rawQuote = quoteInput ? quoteInput.value.trim() : '';
    if (rawQuote) {
        return rawQuote;
    }
    return fontState.lang === 'hindi' ? 'तस्वीर AI - शायरी और विचार' : 'Tashveer AI - Stylish Quotes';
}

function createFontItemRow(font) {
    const row = document.createElement('div');
    row.className = 'font-item-row';
    row.setAttribute('data-font', font);

    const isCurrent = state.activeFontFamily.includes(`'${font}'`) || state.activeFontFamily === font;
    if (isCurrent) {
        row.classList.add('active-font');
    }

    loadWebFont(font);

    const info = document.createElement('div');
    info.className = 'font-item-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'font-item-name';
    nameEl.textContent = font;

    const previewEl = document.createElement('div');
    previewEl.className = 'font-item-preview';
    previewEl.style.fontFamily = `'${font}', sans-serif`;
    previewEl.textContent = getSamplePreviewText();

    info.appendChild(nameEl);
    info.appendChild(previewEl);

    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'btn-font-apply' + (isCurrent ? ' applied' : '');
    applyBtn.innerHTML = isCurrent ? '<i class="fa-solid fa-check"></i> Applied' : 'Apply';

    applyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyInlineFont(font);
    });

    row.addEventListener('click', () => {
        applyInlineFont(font);
    });

    row.appendChild(info);
    row.appendChild(applyBtn);

    return row;
}

function renderInlineFonts(reset = false) {
    if (!fontsInlineList) return;

    if (reset) {
        fontState.page = 1;
        fontsInlineList.innerHTML = '';
    }

    const fullList = fontState.lang === 'hindi' ? HINDI_FONTS : ENGLISH_FONTS;
    const query = fontState.query.trim().toLowerCase();
    const filtered = query ? fullList.filter(f => f.toLowerCase().includes(query)) : fullList;

    if (filtered.length === 0) {
        fontsInlineList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.88rem;">No fonts found matching your search.</div>';
        return;
    }

    const startIdx = (fontState.page - 1) * fontState.pageSize;
    const currentSlice = filtered.slice(reset ? 0 : startIdx, fontState.page * fontState.pageSize);

    if (reset) {
        fontsInlineList.innerHTML = '';
    }

    currentSlice.forEach(font => {
        if (!fontsInlineList.querySelector(`[data-font="${font}"]`)) {
            const row = createFontItemRow(font);
            fontsInlineList.appendChild(row);
        }
    });
}

function handleFontLoadMore() {
    fontState.page++;
    renderInlineFonts(false);
}

function applyInlineFont(font) {
    loadWebFont(font);
    state.activeFontFamily = `'${font}', sans-serif`;

    if (activeFontDisplay) {
        activeFontDisplay.textContent = font;
    }

    document.querySelectorAll('.font-item-row').forEach(r => {
        const isMatch = r.getAttribute('data-font') === font;
        r.classList.toggle('active-font', isMatch);
        const btn = r.querySelector('.btn-font-apply');
        if (btn) {
            if (isMatch) {
                btn.classList.add('applied');
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Applied';
            } else {
                btn.classList.remove('applied');
                btn.innerHTML = 'Apply';
            }
        }
    });

    document.fonts.ready.then(() => {
        drawCanvasPreview();
    });
    drawCanvasPreview();
}

function switchInlineFontLang(lang) {
    if (fontState.lang === lang) return;
    fontState.lang = lang;
    if (lang === 'hindi') {
        if (btnFontHindi) btnFontHindi.classList.add('active');
        if (btnFontEnglish) btnFontEnglish.classList.remove('active');
    } else {
        if (btnFontHindi) btnFontHindi.classList.remove('active');
        if (btnFontEnglish) btnFontEnglish.classList.add('active');
    }
    renderInlineFonts(true);
}

function updateInlineFontPreviews() {
    const text = getSamplePreviewText();
    document.querySelectorAll('.font-item-row .font-item-preview').forEach(el => {
        el.textContent = text;
    });
}

// --- GALLERY IMAGE CARDS ---
function createImageCard(url, altText, isSelected = false) {
    const card = document.createElement('div');
    card.className = `gallery-card ${isSelected ? 'selected' : ''}`;

    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'img-loading-overlay';
    loadingOverlay.innerHTML = '<i class="fa-solid fa-spinner spinner-icon"></i>';
    card.appendChild(loadingOverlay);

    const img = document.createElement('img');
    img.alt = altText;
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
        loadingOverlay.classList.add('hidden');
    };

    img.onerror = () => {
        loadingOverlay.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>';
    };

    card.appendChild(img);

    card.addEventListener('click', () => {
        document.querySelectorAll('.gallery-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectBackgroundImage(url);
    });

    imageGrid.appendChild(card);
}

function selectBackgroundImage(url) {
    state.selectedImageUrl = url;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
        state.selectedImageElement = img;
        drawCanvasPreview();
    };

    img.onerror = () => {
        console.error("Failed to load background image:", url);
    };
}

// --- BACKGROUND TYPE & COLOR MANAGERS ---
function setBackgroundType(type) {
    state.bgType = type;
    if (type === 'color') {
        if (btnBgSolid) btnBgSolid.classList.add('active');
        if (btnBgImage) btnBgImage.classList.remove('active');
        if (solidColorControls) solidColorControls.classList.remove('hidden');
        if (imageBgControls) imageBgControls.classList.add('hidden');

        // Auto contrast text if on light background
        if (isColorLight(state.solidColor) && state.textColor.toLowerCase() === '#ffffff') {
            updateTextColor('#111111');
        }
    } else {
        if (btnBgImage) btnBgImage.classList.add('active');
        if (btnBgSolid) btnBgSolid.classList.remove('active');
        if (imageBgControls) imageBgControls.classList.remove('hidden');
        if (solidColorControls) solidColorControls.classList.add('hidden');

        // Switch to white text for image background if text is still default dark
        if (state.textColor.toLowerCase() === '#111111') {
            updateTextColor('#ffffff');
        }
    }
    drawCanvasPreview();
}

function updateSolidColor(color) {
    state.solidColor = color;
    if (solidColorPicker) solidColorPicker.value = color;
    if (solidColorVal) solidColorVal.textContent = color.toUpperCase();

    // Update active swatch
    if (solidColorPresets) {
        solidColorPresets.forEach(btn => {
            const btnColor = btn.getAttribute('data-color');
            if (btnColor && btnColor.toLowerCase() === color.toLowerCase()) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Auto-adjust text contrast if using pure black or white
    if (isColorLight(color)) {
        if (state.textColor.toLowerCase() === '#ffffff') {
            updateTextColor('#111111');
        }
    } else {
        if (state.textColor.toLowerCase() === '#111111') {
            updateTextColor('#ffffff');
        }
    }

    drawCanvasPreview();
}

function updateTextColor(color) {
    state.textColor = color;
    if (textColorPicker) textColorPicker.value = color;
    if (textColorVal) textColorVal.textContent = color.toUpperCase();
    drawCanvasPreview();
}

function isColorLight(hexColor) {
    if (!hexColor) return true;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
}

function updateCharCount() {
    if (charCounter && quoteInput) {
        charCounter.textContent = `${quoteInput.value.length}/200`;
    }
}

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
    // Post Format Listeners (9:16 Story vs 1:1 Square)
    if (btnFormatStory) {
        btnFormatStory.addEventListener('click', () => setPostFormat('9:16'));
    }
    if (btnFormatSquare) {
        btnFormatSquare.addEventListener('click', () => setPostFormat('1:1'));
    }

    // Image Orientation Filter Listeners (Both, Portrait, Landscape)
    if (btnOrientBoth) {
        btnOrientBoth.addEventListener('click', () => setImageOrientation('both'));
    }
    if (btnOrientPortrait) {
        btnOrientPortrait.addEventListener('click', () => setImageOrientation('portrait'));
    }
    if (btnOrientLandscape) {
        btnOrientLandscape.addEventListener('click', () => setImageOrientation('landscape'));
    }

    // Background Mode Toggle
    if (btnBgSolid) {
        btnBgSolid.addEventListener('click', () => setBackgroundType('color'));
    }
    if (btnBgImage) {
        btnBgImage.addEventListener('click', () => setBackgroundType('image'));
    }

    // Solid Color Custom Picker
    if (solidColorPicker) {
        solidColorPicker.addEventListener('input', (e) => updateSolidColor(e.target.value));
    }

    // Solid Color Preset Swatches
    if (solidColorPresets) {
        solidColorPresets.forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.getAttribute('data-color');
                if (color) updateSolidColor(color);
            });
        });
    }

    // Text Color Custom Picker
    if (textColorPicker) {
        textColorPicker.addEventListener('input', (e) => {
            updateTextColor(e.target.value);
        });
    }

    // Quote Input
    if (quoteInput) {
        quoteInput.addEventListener('input', () => {
            updateCharCount();
            updateInlineFontPreviews();
            drawCanvasPreview();
        });
    }

    // File Browse Handler
    if (btnBrowseImg && fileUpload) {
        btnBrowseImg.addEventListener('click', () => fileUpload.click());
        fileUpload.addEventListener('change', handleFileUpload);
    }

    // Drag-to-Move Text Canvas Event Listeners
    if (canvas) {
        canvas.addEventListener('mousedown', startDrag);
        canvas.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', endDrag);

        canvas.addEventListener('touchstart', startDrag, { passive: false });
        canvas.addEventListener('touchmove', drag, { passive: false });
        window.addEventListener('touchend', endDrag);
    }

    // Pexels Search Actions
    if (btnGenerateAi && promptInput) {
        btnGenerateAi.addEventListener('click', () => {
            const query = promptInput.value.trim();
            if (query) {
                generateAiImages(query, true);
            }
        });

        promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = promptInput.value.trim();
                if (query) {
                    generateAiImages(query, true);
                }
            }
        });
    }

    // Pexels Load More action
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            if (state.searchPrompt) {
                generateAiImages(state.searchPrompt, false);
            }
        });
    }

    // Inline Typography Listeners
    if (btnFontHindi) {
        btnFontHindi.addEventListener('click', () => switchInlineFontLang('hindi'));
    }
    if (btnFontEnglish) {
        btnFontEnglish.addEventListener('click', () => switchInlineFontLang('english'));
    }
    if (fontSearchInput) {
        fontSearchInput.addEventListener('input', (e) => {
            fontState.query = e.target.value.trim().toLowerCase();
            renderInlineFonts(true);
        });
    }
    if (fontsInlineList) {
        fontsInlineList.addEventListener('scroll', () => {
            if (fontsInlineList.scrollTop + fontsInlineList.clientHeight >= fontsInlineList.scrollHeight - 50) {
                const fullList = fontState.lang === 'hindi' ? HINDI_FONTS : ENGLISH_FONTS;
                const query = fontState.query.trim().toLowerCase();
                const filtered = query ? fullList.filter(f => f.toLowerCase().includes(query)) : fullList;
                const totalRendered = fontsInlineList.querySelectorAll('.font-item-row').length;
                if (totalRendered < filtered.length) {
                    handleFontLoadMore();
                }
            }
        });
    }

    // Text Size Slider
    if (sizeSlider && sizeVal) {
        sizeSlider.addEventListener('input', (e) => {
            sizeVal.textContent = `${e.target.value}px`;
            drawCanvasPreview();
        });
    }

    // Vertical Position Slider
    if (positionSlider && positionVal) {
        positionSlider.addEventListener('input', (e) => {
            positionVal.textContent = `${e.target.value}%`;
            state.textY = canvas.height * (parseInt(e.target.value) / 100);
            drawCanvasPreview();
        });
    }

    // Text Alignment Buttons
    if (alignButtons) {
        alignButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                alignButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.textAlignment = btn.getAttribute('data-value');

                if (state.textAlignment === 'left') {
                    state.textX = canvas.width * 0.085;
                } else if (state.textAlignment === 'right') {
                    state.textX = canvas.width * 0.915;
                } else {
                    state.textX = canvas.width / 2;
                }
                drawCanvasPreview();
            });
        });
    }

    // Download Button
    if (btnDownload8k) {
        btnDownload8k.addEventListener('click', handleDownload8K);
    }
}

// --- FILE UPLOAD PROCESSING ---
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;
        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
            galleryContainer.classList.remove('hidden');
        }

        createImageCard(dataUrl, "Uploaded Image", true);

        document.querySelectorAll('.gallery-card').forEach(c => {
            const img = c.querySelector('img');
            if (img && img.src !== dataUrl) {
                c.classList.remove('selected');
            }
        });

        selectBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);
}

// --- IMAGE SEARCH FROM PEXELS API ---
async function generateAiImages(prompt, clearGrid = true) {
    state.searchPrompt = prompt;

    if (clearGrid) {
        state.loadedCount = 0;
        imageGrid.innerHTML = '';
        btnGenerateAi.disabled = true;
        aiSpinner.classList.remove('hidden');
    } else {
        btnLoadMore.disabled = true;
        loadMoreSpinner.classList.remove('hidden');
    }

    const perPage = 12;
    const pageNum = Math.floor(state.loadedCount / perPage) + 1;

    let orientationParam = '';
    if (state.imageOrientation === 'portrait') {
        orientationParam = '&orientation=portrait';
    } else if (state.imageOrientation === 'landscape') {
        orientationParam = '&orientation=landscape';
    }

    try {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=${perPage}&page=${pageNum}${orientationParam}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': 'F5GY5xTk5YuS3NslDKxmhW94LAL51xpts7av26v3BE6mHFvCB5H5KQCn'
            }
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const results = data.photos || [];
        const images = results.map(item => {
            const src = item.src || {};
            return {
                id: item.id || '',
                thumb: src.portrait || src.medium || '',
                full: src.original || src.large || ''
            };
        });

        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
            galleryContainer.classList.remove('hidden');
        }

        if (images.length === 0 && clearGrid) {
            imageGrid.innerHTML = '<div style="grid-column: span 3; text-align: center; padding: 2rem; color: var(--text-muted);">No images found on Pexels. Try other keywords or orientation.</div>';
            btnLoadMore.classList.add('hidden');
        } else {
            images.forEach((imgObj, index) => {
                const isFirst = clearGrid && index === 0;
                createImageCard(imgObj.thumb, `Pexels Photo ${imgObj.id}`, isFirst);
                if (isFirst) {
                    selectBackgroundImage(imgObj.full);
                }
            });

            state.loadedCount += images.length;
            if (images.length < perPage) {
                btnLoadMore.classList.add('hidden');
            } else {
                btnLoadMore.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error("Pexels search failed:", e);
        if (clearGrid) {
            imageGrid.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 2rem; color: #ef4444;">Search failed: ${e.message}. Please check your internet connection and Pexels API key.</div>`;
        }
    } finally {
        btnGenerateAi.disabled = false;
        aiSpinner.classList.add('hidden');
        btnLoadMore.disabled = false;
        loadMoreSpinner.classList.add('hidden');
    }
}

// --- RENDER TEXT OVERLAY & CANVAS DRAW ---
function drawCanvasPreview(customCanvas = null, customCtx = null, targetWidth = 1080, targetHeight = null) {
    const activeCanvas = customCanvas || canvas;
    const activeCtx = customCtx || ctx;
    const canvasH = targetHeight !== null ? targetHeight : activeCanvas.height;

    activeCtx.clearRect(0, 0, targetWidth, canvasH);

    // 1. Draw Background (Solid Color or Image)
    if (state.bgType === 'color') {
        activeCtx.fillStyle = state.solidColor || '#ffffff';
        activeCtx.fillRect(0, 0, targetWidth, canvasH);
    } else {
        if (state.selectedImageElement) {
            const img = state.selectedImageElement;
            const imgRatio = img.width / img.height;
            const canvasRatio = targetWidth / canvasH;

            let sx, sy, sWidth, sHeight;

            if (imgRatio > canvasRatio) {
                sHeight = img.height;
                sWidth = img.height * canvasRatio;
                sx = (img.width - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = img.width;
                sHeight = img.width / canvasRatio;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            }

            activeCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, canvasH);
        } else {
            const fallbackGrad = activeCtx.createRadialGradient(
                targetWidth / 2, canvasH / 2, 50,
                targetWidth / 2, canvasH / 2, targetWidth
            );
            fallbackGrad.addColorStop(0, '#1c1917');
            fallbackGrad.addColorStop(1, '#0c0a09');
            activeCtx.fillStyle = fallbackGrad;
            activeCtx.fillRect(0, 0, targetWidth, canvasH);
        }
    }

    // 2. Black overlay: Completely removed

    // 3. Draw Typography
    const rawQuote = quoteInput ? quoteInput.value.trim() : '';
    if (!rawQuote) {
        state.textBounds = null;
        state.isTextSelected = false;
        return;
    }

    const scaleFactor = targetWidth / 1080;
    const baseFontSize = parseInt(sizeSlider.value) * scaleFactor;

    // Reset shadow completely (no text shadow)
    activeCtx.shadowColor = 'transparent';
    activeCtx.shadowBlur = 0;
    activeCtx.shadowOffsetX = 0;
    activeCtx.shadowOffsetY = 0;

    const selectedFont = state.activeFontFamily;
    const textAlignment = state.textAlignment;

    activeCtx.font = `bold ${baseFontSize}px ${selectedFont}`;
    activeCtx.fillStyle = state.textColor || '#111111';
    activeCtx.textAlign = textAlignment;
    activeCtx.textBaseline = 'middle';

    const maxTextWidth = state.maxTextWidth * scaleFactor;
    const lines = wrapText(activeCtx, rawQuote, maxTextWidth);

    const lineSpacing = baseFontSize * 1.5;
    const totalTextHeight = (lines.length - 1) * lineSpacing;

    const heightScale = canvasH / canvas.height;
    const centerY = state.textY * heightScale;
    const xPos = state.textX * scaleFactor;

    let startY = centerY - (totalTextHeight / 2);

    lines.forEach((line) => {
        activeCtx.fillText(line, xPos, startY);
        startY += lineSpacing;
    });

    activeCtx.shadowColor = 'transparent';
    activeCtx.shadowBlur = 0;

    // Store text bounds for dragging (only for the active preview canvas)
    if (!customCanvas) {
        const textHeightTotal = (lines.length - 1) * lineSpacing + baseFontSize;
        const startYPos = centerY - (baseFontSize / 2) - ((lines.length - 1) * lineSpacing / 2);

        let minXPos, maxXPos;
        if (state.textAlignment === 'left') {
            minXPos = xPos;
            maxXPos = xPos + maxTextWidth;
        } else if (state.textAlignment === 'right') {
            minXPos = xPos - maxTextWidth;
            maxXPos = xPos;
        } else { // center
            minXPos = xPos - maxTextWidth / 2;
            maxXPos = xPos + maxTextWidth / 2;
        }

        state.textBounds = {
            minX: minXPos,
            maxX: maxXPos,
            minY: startYPos,
            maxY: startYPos + textHeightTotal
        };

        // Draw dotted outline and resize handles ONLY if the text is selected!
        if (state.isTextSelected) {
            const pad = 12; // padding around text bounds
            const outlineX = state.textBounds.minX - pad;
            const outlineY = state.textBounds.minY - pad;
            const outlineW = (state.textBounds.maxX - state.textBounds.minX) + 2 * pad;
            const outlineH = (state.textBounds.maxY - state.textBounds.minY) + 2 * pad;

            // Draw Dashed Selection Box
            activeCtx.strokeStyle = 'rgba(99, 102, 241, 0.75)'; // Unified Indigo border
            activeCtx.lineWidth = 1.5;
            activeCtx.setLineDash([4, 4]); // Dashed line
            activeCtx.strokeRect(outlineX, outlineY, outlineW, outlineH);
            activeCtx.setLineDash([]); // Reset line dash

            // Corner handles (circles for size resizing)
            const corners = [
                { x: outlineX, y: outlineY, cursor: 'nwse-resize' }, // Top-Left
                { x: outlineX + outlineW, y: outlineY, cursor: 'nesw-resize' }, // Top-Right
                { x: outlineX, y: outlineY + outlineH, cursor: 'nesw-resize' }, // Bottom-Left
                { x: outlineX + outlineW, y: outlineY + outlineH, cursor: 'nwse-resize' } // Bottom-Right
            ];

            activeCtx.fillStyle = '#6366f1';
            activeCtx.strokeStyle = '#ffffff';
            activeCtx.lineWidth = 1.5;
            corners.forEach(corner => {
                activeCtx.beginPath();
                activeCtx.arc(corner.x, corner.y, 6, 0, 2 * Math.PI);
                activeCtx.fill();
                activeCtx.stroke();
            });
            state.resizeCorners = corners;

            // Side handles (vertical pills for wrapping width resizing)
            const sides = [
                { x: outlineX, y: outlineY + outlineH / 2, cursor: 'ew-resize', type: 'left' },
                { x: outlineX + outlineW, y: outlineY + outlineH / 2, cursor: 'ew-resize', type: 'right' }
            ];

            activeCtx.fillStyle = '#ffffff';
            activeCtx.strokeStyle = '#6366f1';
            activeCtx.lineWidth = 1.5;
            sides.forEach(side => {
                activeCtx.beginPath();
                if (activeCtx.roundRect) {
                    activeCtx.roundRect(side.x - 3, side.y - 8, 6, 16, 3);
                } else {
                    activeCtx.rect(side.x - 3, side.y - 8, 6, 16);
                }
                activeCtx.fill();
                activeCtx.stroke();
            });
            state.sideHandles = sides;

        } else {
            state.resizeCorners = null;
            state.sideHandles = null;
        }
    }
}

function wrapText(context, text, maxWidth) {
    const paragraphs = text.split('\n');
    let allLines = [];

    paragraphs.forEach(paragraph => {
        const words = paragraph.split(' ');
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = context.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
                allLines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            allLines.push(currentLine);
        }
    });

    return allLines;
}

// --- 8K HIGH RESOLUTION EXPORT HANDLING ---
function handleDownload8K() {
    btnDownload8k.disabled = true;
    downloadSpinner.classList.remove('hidden');

    modalProcessing.classList.remove('hidden');
    updateModalStep(1, 'active');
    updateModalStep(2, 'pending');
    updateModalStep(3, 'pending');
    updateModalStep(4, 'pending');

    const exportWidth = 4320;
    const exportHeight = state.format === '1:1' ? 4320 : 7680;

    const step1El = document.querySelector('#pstep-1 span');
    if (step1El) {
        step1El.textContent = `Upscaling background to ${exportWidth}x${exportHeight} pixels...`;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const exportCtx = exportCanvas.getContext('2d');

    setTimeout(() => {
        updateModalStep(1, 'completed');
        updateModalStep(2, 'active');

        setTimeout(() => {
            updateModalStep(2, 'completed');
            updateModalStep(3, 'active');

            drawCanvasPreview(exportCanvas, exportCtx, exportWidth, exportHeight);

            setTimeout(() => {
                updateModalStep(3, 'completed');
                updateModalStep(4, 'active');

                setTimeout(() => {
                    exportCanvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `tashveer_ai_${state.format === '1:1' ? '1x1_square' : '9x16_story'}_${Date.now()}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }

                        updateModalStep(4, 'completed');
                        setTimeout(() => {
                            modalProcessing.classList.add('hidden');
                            btnDownload8k.disabled = false;
                            downloadSpinner.classList.add('hidden');
                        }, 500);
                    }, 'image/png');
                }, 1000);
            }, 800);
        }, 800);
    }, 1000);
}

function updateModalStep(stepNumber, status) {
    const stepEl = document.getElementById(`pstep-${stepNumber}`);
    if (!stepEl) return;

    stepEl.classList.remove('active', 'completed');

    if (status === 'active') {
        stepEl.classList.add('active');
    } else if (status === 'completed') {
        stepEl.classList.add('completed');
    }
}

// --- DRAG AND RESIZE TEXT CONTROLLERS ---
let isDragging = false;
let isResizing = false;
let isWrapping = false;

let startDragX = 0;
let startDragY = 0;
let startResizeX = 0;
let startResizeY = 0;
let startFontSize = 52;

let startWrapX = 0;
let startMaxTextWidth = 918;
let activeSideHandle = null;

function startDrag(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const clickX = (clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (clientY - rect.top) * (canvas.height / rect.height);

    // 1. Check click on side handles (for box stretching)
    if (state.sideHandles && state.isTextSelected) {
        for (let side of state.sideHandles) {
            const dist = Math.hypot(clickX - side.x, clickY - side.y);
            if (dist <= 12) {
                isWrapping = true;
                activeSideHandle = side;
                startWrapX = clickX;
                startMaxTextWidth = state.maxTextWidth;
                canvas.style.cursor = 'ew-resize';
                if (e.cancelable) e.preventDefault();
                return;
            }
        }
    }

    // 2. Check click on any of the 4 corner handles (for proportional resizing)
    if (state.resizeCorners && state.isTextSelected) {
        for (let corner of state.resizeCorners) {
            const dist = Math.hypot(clickX - corner.x, clickY - corner.y);
            if (dist <= 10) {
                isResizing = true;
                canvas.style.cursor = corner.cursor;
                startResizeX = clickX;
                startResizeY = clickY;
                startFontSize = parseInt(sizeSlider.value);
                if (e.cancelable) e.preventDefault();
                return;
            }
        }
    }

    // 3. Check click inside the main text boundaries (for moving/dragging)
    if (state.textBounds &&
        clickX >= state.textBounds.minX &&
        clickX <= state.textBounds.maxX &&
        clickY >= state.textBounds.minY &&
        clickY <= state.textBounds.maxY) {

        state.isTextSelected = true;
        isDragging = true;
        canvas.style.cursor = 'grabbing';

        startDragX = clickX - state.textX;
        startDragY = clickY - state.textY;

        drawCanvasPreview();
        if (e.cancelable) e.preventDefault();
    } else {
        // Clicked outside: deselect text box
        state.isTextSelected = false;
        drawCanvasPreview();
    }
}

function drag(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const currentX = (clientX - rect.left) * (canvas.width / rect.width);
    const currentY = (clientY - rect.top) * (canvas.height / rect.height);

    // A. Wrapping drag action
    if (isWrapping && activeSideHandle) {
        let newWidth = startMaxTextWidth;
        if (state.textAlignment === 'center') {
            newWidth = Math.abs(currentX - state.textX) * 2;
        } else if (state.textAlignment === 'left') {
            newWidth = currentX - state.textX;
        } else if (state.textAlignment === 'right') {
            newWidth = state.textX - currentX;
        }

        state.maxTextWidth = Math.max(150, Math.min(1000, newWidth));

        drawCanvasPreview();
        if (e.cancelable) e.preventDefault();
        return;
    }

    // B. Proportional font resizing drag action
    if (isResizing) {
        const dx = currentX - startResizeX;
        const dy = currentY - startResizeY;

        const change = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        const newSize = startFontSize + (change * 0.25);

        const sliderVal = Math.max(20, Math.min(120, Math.round(newSize)));
        sizeSlider.value = sliderVal;
        sizeVal.textContent = `${sliderVal}px`;

        drawCanvasPreview();
        if (e.cancelable) e.preventDefault();
        return;
    }

    // C. Position moving drag action
    if (isDragging) {
        state.textX = currentX - startDragX;
        state.textY = currentY - startDragY;

        state.textX = Math.max(50, Math.min(canvas.width - 50, state.textX));
        state.textY = Math.max(100, Math.min(canvas.height - 100, state.textY));

        const sliderPercent = Math.round((state.textY / canvas.height) * 100);
        positionSlider.value = sliderPercent;
        positionVal.textContent = `${sliderPercent}%`;

        drawCanvasPreview();
        if (e.cancelable) e.preventDefault();
        return;
    }

    // D. Normal hover cursor feedback
    if (state.isTextSelected) {
        // Check side handles hover
        if (state.sideHandles) {
            for (let side of state.sideHandles) {
                if (Math.hypot(currentX - side.x, currentY - side.y) <= 10) {
                    canvas.style.cursor = side.cursor;
                    return;
                }
            }
        }

        // Check corner handles hover
        if (state.resizeCorners) {
            for (let corner of state.resizeCorners) {
                if (Math.hypot(currentX - corner.x, currentY - corner.y) <= 8) {
                    canvas.style.cursor = corner.cursor;
                    return;
                }
            }
        }
    }

    // Check main text bounds hover
    if (state.textBounds &&
        currentX >= state.textBounds.minX &&
        currentX <= state.textBounds.maxX &&
        currentY >= state.textBounds.minY &&
        currentY <= state.textBounds.maxY) {
        canvas.style.cursor = 'grab';
    } else {
        canvas.style.cursor = 'default';
    }
}

function endDrag() {
    isDragging = false;
    isResizing = false;
    isWrapping = false;
    activeSideHandle = null;
    canvas.style.cursor = 'default';
}
