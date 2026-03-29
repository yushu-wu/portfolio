const films = document.querySelectorAll(".film");
const cvElement = document.querySelector(".name[data-cv]");
const panel = document.getElementById("panel");

/* ---------- ACTIVE STATE ---------- */

function clearActive() {
    document.querySelectorAll('.film, .name').forEach(el => {
        el.classList.remove('active');
    });
}

function setActive(element) {
    clearActive();
    if (element) element.classList.add('active');
}

/* ---------- CV PANEL ---------- */

function openCV() {
    const cvData = document.getElementById('cv-content');
    if (!cvData) return;

    setActive(cvElement);

    const htmlContent = cvData.innerHTML + `
        <div class="nav-controls">
            <span class="close-btn">Return</span>
        </div>
    `;

    panel.innerHTML = htmlContent;
    panel.classList.add('open');

    panel.querySelector('.close-btn').onclick = (e) => {
        e.stopPropagation();
        panel.classList.remove('open');
        clearActive();
    };
}

/* ---------- FILM PANEL ---------- */

function openFilm(key) {
    const selectedFilm = document.querySelector(`.film[data-film="${key}"]`);
    if (!selectedFilm) return;

    setActive(selectedFilm);

    const filmArray = Array.from(films);
    const currentIndex = filmArray.findIndex(f => f.dataset.film === key);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < filmArray.length - 1;

    const title = selectedFilm.dataset.title || selectedFilm.textContent.trim();
    const descNode = selectedFilm.querySelector('.film-description');
    const description = descNode ? descNode.innerHTML.trim() : '';
    const runtimeNode = selectedFilm.querySelector('.film-runtime');
    const runtime = runtimeNode ? runtimeNode.textContent.trim() : '';
    const creditsNodes = Array.from(selectedFilm.querySelectorAll('.film-credit'));
    const video = selectedFilm.dataset.video || '';
    const stills = (selectedFilm.dataset.stills || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const stillsHTML = stills.map(img => `<img src="${img}" alt="still">`).join('');

    const creditsHTML = creditsNodes.map(node => {
        const jobs = Array.from(node.querySelectorAll('.credit-job'));
        const names = Array.from(node.querySelectorAll('.credit-name'));

        return jobs.map((job, i) => `
            <p class="credit">
                <span class="credit-job">${job.textContent.trim()}</span>
                <span class="credit-name">${names[i]?.textContent.trim() || ''}</span>
            </p>
        `).join('');
    }).join('');

    const hasCredits = creditsHTML.trim().length > 0;

    const backBtn = hasPrev ? `<span class="nav-btn nav-back">←</span>` : '';
    const nextBtn = hasNext ? `<span class="nav-btn nav-next">→</span>` : '';

    const creditsSection = hasCredits ? `
        <div class="credits-group">
            <div class="credits-toggle">
                <span class="credits-arrow">></span>
                <span class="credits-label">Credits</span>
            </div>
            <div class="credits-content">
                ${creditsHTML}
            </div>
        </div>
    ` : '';

    const stillsSection = stills.length > 0 ? `
        <div class="stills-group">
            <div class="stills-toggle">
                <span class="stills-arrow">></span>
                <span class="stills-label">Stills</span>
            </div>
            <div class="stills-content">
                <div class="stills">${stillsHTML}</div>
            </div>
        </div>
    ` : '';

    panel.innerHTML = `
        <p class="description">${description}</p>
        <p class="runtime">${runtime}</p>

        ${creditsSection}

        <iframe class="video" src="${video}" frameborder="0" allowfullscreen></iframe>

        ${stillsSection}

        <div class="nav-controls">
            ${backBtn}
            <span class="close-btn">Return</span>
            ${nextBtn}
        </div>
    `;

    panel.classList.add('open');

    const creditsGroup = panel.querySelector('.credits-group');
    if (creditsGroup) {
        const toggle = creditsGroup.querySelector('.credits-toggle');
        const arrow = creditsGroup.querySelector('.credits-arrow');
        
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            creditsGroup.classList.toggle('open');
            arrow.textContent = creditsGroup.classList.contains('open') ? '>' : '>';
        });
    }

    const stillsGroup = panel.querySelector('.stills-group');
    if (stillsGroup) {
        const toggle = stillsGroup.querySelector('.stills-toggle');
        const arrow = stillsGroup.querySelector('.stills-arrow');
        
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            stillsGroup.classList.toggle('open');
            arrow.textContent = stillsGroup.classList.contains('open') ? '>' : '>';
        });
    }

    /* close */
    panel.querySelector('.close-btn').onclick = (e) => {
        e.stopPropagation();
        panel.classList.remove('open');
        clearActive();
    };

    /* navigation */
    if (hasPrev) {
        panel.querySelector('.nav-back').onclick = (e) => {
            e.stopPropagation();
            openFilm(filmArray[currentIndex - 1].dataset.film);
        };
    }

    if (hasNext) {
        panel.querySelector('.nav-next').onclick = (e) => {
            e.stopPropagation();
            openFilm(filmArray[currentIndex + 1].dataset.film);
        };
    }

    /* ---------- STILLS SIZING ---------- */

    const stillsContainer = panel.querySelector('.stills');
    if (stillsContainer) {
        const images = Array.from(stillsContainer.querySelectorAll('img'));
        const panelWidth = panel.clientWidth - 50;

        let horizontalHeight = null;
        const horizontalImg = images.find(img => img.naturalWidth > img.naturalHeight);

        const applySizes = () => {
            if (!horizontalHeight && horizontalImg?.naturalWidth) {
                horizontalHeight = (panelWidth * horizontalImg.naturalHeight) / horizontalImg.naturalWidth;
            }

            images.forEach(img => {
                if (img.naturalWidth > img.naturalHeight) {
                    img.style.width = '100%';
                    img.style.maxHeight = '60vh';
                } else {
                    const h = horizontalHeight ? horizontalHeight * 1.8 : panelWidth;
                    img.style.height = `${h}px`;
                }
            });
        };

        images.forEach(img => {
            if (!img.complete) img.onload = applySizes;
        });

        applySizes();
    }
}

/* ---------- EVENT BINDING ---------- */

films.forEach(film => {
    film.addEventListener("click", (e) => {
        e.stopPropagation();
        openFilm(film.dataset.film);
    });
});

if (cvElement) {
    cvElement.addEventListener("click", (e) => {
        e.stopPropagation();
        openCV();
    });
}

/* click outside → close */
document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !e.target.closest(".film") && !e.target.closest(".name")) {
        panel.classList.remove("open");
        clearActive();
    }
});

/* ---------- PHOTO GALLERY ---------- */

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function buildPhotosGallery() {
    const grid = document.getElementById('photos-grid');
    if (!grid) return;

    try {
        const res = await fetch('photographs/manifest.json');
        if (res.ok) {
            const list = await res.json();
            shuffleArray(list);
            list.forEach(fn => {
                const img = document.createElement('img');
                img.src = `photographs/${fn}`;
                grid.appendChild(img);
            });
            return;
        }
    } catch {}

    const max = 30;
    const exts = ['jpg','JPG','jpeg','png','webp'];

    for (let i = 1; i <= max; i++) {
        for (const ext of exts) {
            const img = new Image();
            img.src = `photographs/photo${i}.${ext}`;
            img.onload = () => grid.appendChild(img);
        }
    }
}

/* ---------- AUTO SCROLL ---------- */

document.addEventListener('DOMContentLoaded', () => {
    buildPhotosGallery();

    const column = document.querySelector('.photos-column');
    if (!column) return;

    column.style.scrollBehavior = 'smooth';

    let dir = 1;
    let paused = false;

    setInterval(() => {
        if (paused) return;

        if (column.scrollTop + column.clientHeight >= column.scrollHeight) dir = -1;
        if (column.scrollTop <= 0) dir = 1;

        column.scrollTop += dir;
    }, 40);

    const pause = () => {
        paused = true;
        setTimeout(() => paused = false, 10000);
    };

    ['mouseenter','mousemove','wheel','touchstart', 'wheelmove'].forEach(evt => {
        column.addEventListener(evt, pause, { passive: true });
    });
});
