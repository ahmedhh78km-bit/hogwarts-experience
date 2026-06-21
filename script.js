/* ==========================================================================
   WIZARDING WORLD OF HOGWARTS - INTERACTION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initCanvasParticles();
    initCardTilt();
    initSortingHat();
    initSpells();
    initCharacters();
    initHeaderNavigation();
    initAudio();
    initNarrativeAndScroll();
    initEasterEggs();
    initMagneticButtons();
    initTimelineObserver();
});

/* HERO TYPEWRITER EFFECT */
function initTypewriter() {
    const subtitleEl = document.getElementById('hero-subtitle');
    if (!subtitleEl) return;

    const phrases = [
        "Step into the magic of Hogwarts.",
        "Practice your defensive spells.",
        "Let the Sorting Hat choose your destiny.",
        "Meet legendary wizards & witches."
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            subtitleEl.innerHTML = currentPhrase.substring(0, charIndex - 1) + '<span class="typewriter-caret"></span>';
            charIndex--;
            typingSpeed = 40;
        } else {
            subtitleEl.innerHTML = currentPhrase.substring(0, charIndex + 1) + '<span class="typewriter-caret"></span>';
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

/* ==========================================================================
   2. HIGH-PERFORMANCE CANVAS PARTICLE SYSTEM & MAP OVERLAY
   ========================================================================== */
let spawnSpellParticles = null;
let spawnSortingExplosion = null;

function initCanvasParticles() {
    const canvas = document.getElementById('magic-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const maxParticles = 25;

    function getParticleColors() {
        const house = document.body.getAttribute('data-house') || 'none';
        switch (house) {
            case 'gryffindor':
                return ['#FFC500', '#AE0001', '#FF4D4D', '#FFF'];
            case 'slytherin':
                return ['#10B981', '#2A623D', '#34D399', '#FFF'];
            case 'ravenclaw':
                return ['#3B82F6', '#222F5B', '#60A5FA', '#FFF'];
            case 'hufflepuff':
                return ['#F59E0B', '#ECB939', '#FBBF24', '#FFF'];
            default:
                return ['#D4AF37', '#2A0A3D', '#5DDEFA', '#FFF'];
        }
    }

    class Particle {
        constructor(x, y, vx, vy, size, color, alpha, lifeDecay) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.color = color;
            this.alpha = alpha;
            this.lifeDecay = lifeDecay;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.lifeDecay;
            this.vy -= 0.01;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = this.size * 2;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function spawnAmbient() {
        if (particles.length >= maxParticles) return;
        const colors = getParticleColors();
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 2 + 1;

        particles.push(
            new Particle(
                Math.random() * width,
                height + 10,
                (Math.random() - 0.5) * 0.3,
                -(Math.random() * 0.5 + 0.1),
                size,
                color,
                Math.random() * 0.5 + 0.3,
                Math.random() * 0.003 + 0.001
            )
        );
    }

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (Math.random() < 0.25) {
            const colors = getParticleColors();
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(
                new Particle(
                    mouseX,
                    mouseY,
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 1.5,
                    Math.random() * 2 + 1,
                    color,
                    0.8,
                    Math.random() * 0.02 + 0.01
                )
            );
        }
    });

    spawnSpellParticles = (spellType, cardRect) => {
        const x = cardRect.left + cardRect.width / 2;
        const y = cardRect.top + cardRect.height / 2;
        let colors = ['#FFF'];
        let count = 40;

        if (spellType === 'lumos') colors = ['#FFF', '#FFFBEB', '#FEF08A', '#38BDF8'];
        if (spellType === 'expelliarmus') colors = ['#EF4444', '#F87171', '#EF4444', '#FFF'];
        if (spellType === 'patronum') colors = ['#60A5FA', '#93C5FD', '#E0F2FE', '#FFF'];
        if (spellType === 'alohomora') colors = ['#F59E0B', '#FCD34D', '#FFF', '#FEF3C7'];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            particles.push(
                new Particle(
                    x,
                    y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    Math.random() * 3 + 1.5,
                    colors[Math.floor(Math.random() * colors.length)],
                    1.0,
                    Math.random() * 0.03 + 0.01
                )
            );
        }
    };

    spawnSortingExplosion = (houseType) => {
        const hatImg = document.getElementById('sorting-hat-img');
        if (!hatImg) return;
        const rect = hatImg.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        let colors = [];
        if (houseType === 'gryffindor') colors = ['#FFC500', '#AE0001', '#E11D48'];
        if (houseType === 'slytherin') colors = ['#10B981', '#2A623D', '#047857'];
        if (houseType === 'ravenclaw') colors = ['#3B82F6', '#222F5B', '#1D4ED8'];
        if (houseType === 'hufflepuff') colors = ['#F59E0B', '#ECB939', '#B45309'];

        for (let i = 0; i < 120; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 3;
            particles.push(
                new Particle(
                    x,
                    y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    Math.random() * 4 + 2,
                    colors[Math.floor(Math.random() * colors.length)],
                    1.0,
                    Math.random() * 0.02 + 0.008
                )
            );
        }
    };

    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.pageYOffset;
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg && scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrollY * 0.4}px) scale(1.02)`;
        }
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        if (Math.random() < 0.15) {
            spawnAmbient();
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();

            if (p.alpha <= 0 || p.x < 0 || p.x > width || p.y < -20) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* 3D INTERACTIVE TILT FOR CARDS */
function initCardTilt() {
    if (window.innerWidth < 769) return;

    const cards = document.querySelectorAll('.house-card, .spell-card, .character-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Disable card tilts during Map Mode
            if (document.body.classList.contains('map-mode-active')) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // card inertia motion
            const rotateX = ((centerY - y) / centerY) * 10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

/* ==========================================================================
   4. SORTING HAT INTELLIGENCE (QUIZ & RANDOM FALLBACK)
   ========================================================================== */
function initSortingHat() {
    const sortBtn = document.getElementById('sort-btn');
    const sortQuizBtn = document.getElementById('sort-quiz-btn');
    const resetSortBtn = document.getElementById('reset-sort-btn');
    const hatSpeech = document.getElementById('hat-speech');
    const hatImg = document.getElementById('sorting-hat-img');
    const glowBurst = document.getElementById('sorting-glow');
    const hatGlow = document.querySelector('.hat-glow-effect');
    const sortingInterface = document.getElementById('sorting-interface');
    const sortingReveal = document.getElementById('sorting-reveal');
    const quizContainer = document.getElementById('sorting-quiz-container');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizProgress = document.getElementById('quiz-progress');
    const quizCounter = document.getElementById('quiz-counter');
    const houseCrest = document.getElementById('house-crest');
    const houseTraits = document.getElementById('house-traits');

    const revealedHouseName = document.getElementById('revealed-house-name');
    const revealedHouseDesc = document.getElementById('revealed-house-desc');

    if (!sortBtn) return;

    const housesData = {
        gryffindor: {
            name: "Gryffindor",
            desc: "Founded by Godric Gryffindor. Belongs to the brave, daring, and chivalrous. Their emblem is the lion, and their values stand high in magical history."
        },
        slytherin: {
            name: "Slytherin",
            desc: "Founded by Salazar Slytherin. Belongs to the ambitious, cunning, and resourceful leaders who will use any means to achieve their greatness."
        },
        ravenclaw: {
            name: "Ravenclaw",
            desc: "Founded by Rowena Ravenclaw. Belongs to the wise, witty, and creative minds who value intelligence, research, and individual wisdom above all else."
        },
        hufflepuff: {
            name: "Hufflepuff",
            desc: "Founded by Helga Hufflepuff. Belongs to the loyal, patient, and hard-working. Just and true, they value kindness and absolute equality."
        }
    };

    const quizQuestions = [
        {
            question: "In the dark of night, you hear a strange sound outside the Forbidden Forest. What is your reaction?",
            options: [
                { text: "Stand your ground, draw your wand, and investigate.", house: "gryffindor" },
                { text: "Slip under an Invisibility Cloak and study the source safely.", house: "slytherin" },
                { text: "Consult your textbook on magical beasts to identify the threat.", house: "ravenclaw" },
                { text: "Gather a group of classmates and notify a prefect.", house: "hufflepuff" }
            ]
        },
        {
            question: "Which mystical artifact calls to you from the ancient vault?",
            options: [
                { text: "The Ruby Sword of Gryffindor.", house: "gryffindor" },
                { text: "The heavy, emerald-locked Salazar's Locket.", house: "slytherin" },
                { text: "The delicate, eagle-crested Ravenclaw Diadem.", house: "ravenclaw" },
                { text: "The golden, warm-glowing Cup of Hufflepuff.", house: "hufflepuff" }
            ]
        },
        {
            question: "Choose the paths that you value most in your magical journey:",
            options: [
                { text: "Honor, bravery, and defending the vulnerable.", house: "gryffindor" },
                { text: "Power, legacy, and achieving strategic success.", house: "slytherin" },
                { text: "Knowledge, originality, and exploring the cosmos.", house: "ravenclaw" },
                { text: "Friendship, honest work, and staying true to peers.", house: "hufflepuff" }
            ]
        }
    ];

    let currentQuestionIndex = 0;
    let quizScores = { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0 };

    // 1. Skip Quiz (Random Sort)
    sortBtn.addEventListener('click', () => {
        runSortingHatReveal(null);
    });

    // 2. Quiz mode trigger
    sortQuizBtn.addEventListener('click', () => {
        sortingInterface.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        currentQuestionIndex = 0;
        quizScores = { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0 };
        renderQuizQuestion();
    });

    function renderQuizQuestion() {
        const currentQ = quizQuestions[currentQuestionIndex];
        quizQuestion.textContent = currentQ.question;
        quizProgress.style.width = `${(currentQuestionIndex / quizQuestions.length) * 100}%`;

        quizOptions.innerHTML = '';
        currentQ.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                quizScores[opt.house]++;
                playSyntheticSound('spell-cast-synth');

                currentQuestionIndex++;
                if (currentQuestionIndex < quizQuestions.length) {
                    renderQuizQuestion();
                } else {
                    quizProgress.style.width = '100%';
                    resolveQuizHouse();
                }
            });
            quizOptions.appendChild(btn);
        });
    }

    function resolveQuizHouse() {
        // Find house with highest points
        let bestHouse = 'gryffindor';
        let maxScore = -1;
        for (const house in quizScores) {
            if (quizScores[house] > maxScore) {
                maxScore = quizScores[house];
                bestHouse = house;
            }
        }

        quizContainer.classList.add('hidden');
        runSortingHatReveal(bestHouse);
    }

    function runSortingHatReveal(forcedHouse = null) {
        hatImg.classList.add('thinking');
        playSyntheticSound('sorting-rumble');

        const speechStages = [
            "Hmm... difficult, very difficult...",
            "Plenty of courage, I see. Not a bad mind, either.",
            "There's talent, oh my goodness, yes — and a nice thirst to prove yourself...",
            "Now where shall I put you...?"
        ];

        let stage = 0;
        const speechInterval = setInterval(() => {
            if (stage < speechStages.length) {
                hatSpeech.textContent = `"${speechStages[stage]}"`;
                stage++;
                playSyntheticSound('hat-whisper');
            } else {
                clearInterval(speechInterval);
                finishSorting(forcedHouse);
            }
        }, 1000);
    }

    function finishSorting(resolvedHouse = null) {
        hatImg.classList.remove('thinking');
        hatImg.classList.add('sorted');

        // Resolve house: fallback to random if none forced
        let houseNameKey = resolvedHouse;
        if (!houseNameKey) {
            const houses = Object.keys(housesData);
            houseNameKey = houses[Math.floor(Math.random() * houses.length)];
        }

        const sortedHouse = housesData[houseNameKey];

        document.body.setAttribute('data-house', houseNameKey);

        if (spawnSortingExplosion) {
            spawnSortingExplosion(houseNameKey);
        }

        if (glowBurst) glowBurst.className = 'glow-burst active';
        if (hatGlow) hatGlow.style.opacity = '1';
        playSyntheticSound('sorting-reveal-sound');

        setTimeout(() => {
            revealedHouseName.textContent = sortedHouse.name;
            revealedHouseDesc.textContent = sortedHouse.desc;
            
            // Update house crest and traits
            const houseCrests = {
                gryffindor: '🦁',
                slytherin: '🐍',
                ravenclaw: '🦅',
                hufflepuff: '🦡'
            };
            const houseTraitsData = {
                gryffindor: ['Bravery', 'Courage', 'Chivalry'],
                slytherin: ['Ambition', 'Cunning', 'Resourcefulness'],
                ravenclaw: ['Wisdom', 'Intelligence', 'Creativity'],
                hufflepuff: ['Loyalty', 'Patience', 'Fair Play']
            };
            
            if (houseCrest) houseCrest.textContent = houseCrests[sortedHouse.id] || '🏰';
            
            if (houseTraits) {
                houseTraits.innerHTML = '';
                houseTraitsData[sortedHouse.id].forEach(trait => {
                    const traitSpan = document.createElement('span');
                    traitSpan.className = 'trait';
                    traitSpan.textContent = trait;
                    houseTraits.appendChild(traitSpan);
                });
            }

            sortingInterface.classList.add('hidden');
            quizContainer.classList.add('hidden');
            sortingReveal.classList.remove('hidden');
        }, 300);
    }

    resetSortBtn.addEventListener('click', () => {
        document.body.setAttribute('data-house', 'none');
        if (glowBurst) glowBurst.className = 'glow-burst';
        if (hatGlow) hatGlow.style.opacity = '';
        hatImg.classList.remove('sorted');
        hatSpeech.textContent = '"Ah, yes. A curious mind... where shall I put you?"';

        sortingInterface.classList.remove('hidden');
        sortingReveal.classList.add('hidden');

        playSyntheticSound('spell-cast-synth');
    });
}

/* SPELLS CASTING INTERACTIONS */
function initSpells() {
    const spellItems = document.querySelectorAll('.spell-item');
    const castingStatus = document.getElementById('casting-status');

    spellItems.forEach(item => {
        // Optional soft hover sound
        item.addEventListener('mouseenter', () => {
            playSyntheticSound('card-hover-tick');
        });

        item.addEventListener('click', () => {
            const spellName = item.getAttribute('data-spell');
            const incantation = item.querySelector('.spell-incantation').textContent;

            item.classList.add('casting');
            castingStatus.textContent = `Casting ${incantation}...`;
            castingStatus.style.opacity = 1;

            playSyntheticSound('spell-cast-synth');

            if (spawnSpellParticles) {
                const rect = item.getBoundingClientRect();
                spawnSpellParticles(spellName, rect);
            }

            setTimeout(() => {
                item.classList.remove('casting');
            }, 600);

            setTimeout(() => {
                if (castingStatus.textContent === `Casting ${incantation}...`) {
                    castingStatus.style.opacity = 0;
                }
            }, 2500);
        });
    });
}

/* ==========================================================================
   6. CHARACTERS PROFILE MODALS & INTERACTIVE TIMELINE STRIPS
   ========================================================================== */
function initCharacters() {
    const characterCards = document.querySelectorAll('.character-card');
    const modal = document.getElementById('char-modal');
    const modalClose = document.getElementById('modal-close');
    const modalContentArea = document.getElementById('modal-content-area');

    const track = document.getElementById('characters-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (track && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -320, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }

    const charactersProfileData = {
        harry: {
            name: "Harry Potter",
            role: "The Boy Who Lived",
            house: "Gryffindor",
            houseClass: "gryffindor",
            wand: "11\", Holly, Phoenix feather core",
            patronus: "Stag",
            image: "assets/harry_potter.png",
            quote: "\"I don't go looking for trouble. Trouble usually finds me.\"",
            bio: "Harry Potter is the legendary wizard who survived the Killing Curse. Famous for his lightning bolt scar, he stood as Voldemort's ultimate rival.",
            timeline: [
                { year: "Year 1", event: "Sorted into Gryffindor. Safely foils Voldemort's attempts to steal the Philosopher's Stone." },
                { year: "Year 4", event: "Becomes a surprise competitor in the Triwizard Tournament, witnessing Voldemort's rebirth." },
                { year: "Year 7", event: "Leads the hunt for Voldemort's Horcruxes and defeats the Dark Lord in the Battle of Hogwarts." }
            ]
        },
        hermione: {
            name: "Hermione Granger",
            role: "The Brightest Witch of Her Age",
            house: "Gryffindor",
            houseClass: "gryffindor",
            wand: "10¾\", Vine wood, Dragon heartstring core",
            patronus: "Otter",
            image: "assets/hermione_granger.png",
            quote: "\"Fear of a name increases fear of the thing itself.\"",
            bio: "Hermione is an incredibly brilliant muggle-born witch whose academic intellect and mastery of charms repeatedly saved her companions.",
            timeline: [
                { year: "Year 1", event: "Solves the logic flame puzzle, helping secure the Philosopher's Stone." },
                { year: "Year 3", event: "Uses a Time-Turner to save Sirius Black and Buckbeak from unjust execution." },
                { year: "Year 7", event: "Synthesizes survival spells, deciphers Beedle the Bard, and destroys Hufflepuff's cup." }
            ]
        },
        ron: {
            name: "Ron Weasley",
            role: "The Loyal Knight",
            house: "Gryffindor",
            houseClass: "gryffindor",
            wand: "14\", Willow, Unicorn hair core",
            patronus: "Jack Russell Terrier",
            image: "assets/ron_weasley.png",
            quote: "\"Don't let the Muggles get you down!\"",
            bio: "Ron Weasley is Harry's loyal best friend. Coming from a large, loving family, Ron overcame insecurities to prove himself a chess wizard and brave fighter.",
            timeline: [
                { year: "Year 1", event: "Sacrifices himself in a high-stakes game of giant Wizard's Chess to allow Harry to proceed." },
                { year: "Year 2", event: "Drives the flying Ford Anglia to save Harry and enters the Chamber of Secrets." },
                { year: "Year 7", event: "Destroys Salazar Slytherin's Horcrux Locket with the Sword of Gryffindor." }
            ]
        },
        dumbledore: {
            name: "Albus Dumbledore",
            role: "Headmaster of Hogwarts",
            house: "Gryffindor",
            houseClass: "gryffindor",
            wand: "15\", Elder Wand, Thestral tail hair core",
            patronus: "Phoenix",
            image: "assets/albus_dumbledore.png",
            quote: "\"It does not do to dwell on dreams and forget to live.\"",
            bio: "Albus Dumbledore is considered by many to be the greatest headmaster Hogwarts has ever known, and the only wizard Lord Voldemort feared.",
            timeline: [
                { year: "1899", event: "Graduates from Hogwarts. Depressed by family tragedies involving his sister Ariana." },
                { year: "1945", event: "Defeats the dark wizard Gellert Grindelwald in the most famous magical duel in history." },
                { year: "1997", event: "Orchestrates his own demise with Snape to protect Draco Malfoy and defeat Voldemort." }
            ]
        }
    };

    characterCards.forEach(card => {
        // Optional soft hover sound
        card.addEventListener('mouseenter', () => {
            playSyntheticSound('card-hover-tick');
        });

        const detailsBtn = card.querySelector('.char-details-btn');
        const triggerEvent = () => {
            const charKey = card.getAttribute('data-character');
            const data = charactersProfileData[charKey];
            if (data) {
                openModal(data);
            }
        };

        if (detailsBtn) {
            detailsBtn.addEventListener('click', triggerEvent);
        }
        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                triggerEvent();
            }
        });
    });

    function openModal(data) {
        modalContentArea.innerHTML = `
            <div class="modal-profile-layout">
                <img src="${data.image}" alt="${data.name}" class="modal-profile-img">
                <div class="modal-profile-info">
                    <h3 class="modal-profile-name">${data.name}</h3>
                    <span class="modal-profile-house ${data.houseClass}">${data.house}</span>
                    
                    <p class="modal-quote" id="modal-typewriter-quote"></p>
                    
                    <h4 class="modal-profile-section-title">Wand &amp; Magic</h4>
                    <div class="modal-profile-attributes">
                        <div class="attribute-item">
                            <div class="attribute-label">Wand</div>
                            <div class="attribute-val">${data.wand}</div>
                        </div>
                        <div class="attribute-item">
                            <div class="attribute-label">Patronus</div>
                            <div class="attribute-val">${data.patronus}</div>
                        </div>
                        <div class="attribute-item">
                            <div class="attribute-label">Role</div>
                            <div class="attribute-val">${data.role}</div>
                        </div>
                    </div>
                    
                    <h4 class="modal-profile-section-title">Biography</h4>
                    <p class="modal-profile-text">${data.bio}</p>
                    
                    <h4 class="modal-profile-section-title">Magical Journey (Milestones)</h4>
                    <div class="modal-timeline-container">
                        <div class="timeline-strip">
                            ${data.timeline.map((item, idx) => `
                                <div class="timeline-node ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                                    <div class="timeline-dot"></div>
                                    <span class="timeline-label">${item.year}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="timeline-content-pane" id="timeline-pane">
                            ${data.timeline[0].event}
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        playSyntheticSound('spell-cast-synth');

        // Quote Typewriter reveal
        const quoteEl = document.getElementById('modal-typewriter-quote');
        let index = 0;
        function typeQuote() {
            if (index < data.quote.length) {
                quoteEl.textContent += data.quote.charAt(index);
                index++;
                setTimeout(typeQuote, 30);
            }
        }
        setTimeout(typeQuote, 200);

        // Timeline click controller
        const nodes = modalContentArea.querySelectorAll('.timeline-node');
        const pane = document.getElementById('timeline-pane');
        nodes.forEach(node => {
            node.addEventListener('click', () => {
                nodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');

                const idx = parseInt(node.getAttribute('data-index'));
                pane.style.opacity = '0';
                setTimeout(() => {
                    pane.textContent = data.timeline[idx].event;
                    pane.style.opacity = '1';
                    playSyntheticSound('card-hover-tick');
                }, 150);
            });
        });
    }

    function closeModal() {
        modal.classList.remove('active');
        // Restore only if map mode is not active
        if (!document.body.classList.contains('map-mode-active')) {
            document.body.style.overflow = '';
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

/* ==========================================================================
   7. NAVIGATION SYSTEM
   ========================================================================== */
/* ================= HEADER NAVIGATION ================= */
function initHeaderNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const header = document.querySelector('.main-header');
    const logoBtn = document.getElementById('hogwarts-logo');

    // Logo click - scroll to top
    if (logoBtn) {
        logoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    let lastScrollY = window.scrollY;
    let scrollTimeout;

    // Scroll-based active state and auto-hide header
    window.addEventListener('scroll', () => {
        if (document.body.classList.contains('map-mode-active')) return;

        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

        // Hide header when scrolling down, show when scrolling up
        if (scrollDirection === 'down' && currentScrollY > 100) {
            header.style.transform = 'translateY(-100%)';
            header.style.transition = 'transform 0.3s ease';
        } else if (scrollDirection === 'up' || currentScrollY < 50) {
            header.style.transform = 'translateY(0)';
            header.style.transition = 'transform 0.3s ease';
        }

        // Clear previous timeout
        clearTimeout(scrollTimeout);

        // Show header when scroll stops
        scrollTimeout = setTimeout(() => {
            header.style.transform = 'translateY(0)';
        }, 150);

        lastScrollY = currentScrollY;

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - 180)) {
                current = section.getAttribute('id');
            }
        });

        // Update desktop nav
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });

        // Update mobile nav
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking nav links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Sync mobile control buttons with main buttons
    const audioToggle = document.getElementById('audio-toggle');
    const mobileAudioToggle = document.getElementById('mobile-audio-toggle');

    if (audioToggle && mobileAudioToggle) {
        mobileAudioToggle.addEventListener('click', () => {
            audioToggle.click();
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

/* WORLD EXPANSION - HOGWARTS MAP MODE */
function initMapMode() {
    const mapToggle = document.getElementById('map-toggle');
    const mapZones = document.querySelectorAll('.map-zone');

    if (!mapToggle) return;

    mapToggle.addEventListener('click', () => {
        toggleMapMode();
    });

    function toggleMapMode(forceState = null) {
        const isMapActive = forceState !== null ? forceState : !document.body.classList.contains('map-mode-active');

        if (isMapActive) {
            document.body.classList.add('map-mode-active');
            mapToggle.classList.add('active');
            mapToggle.querySelector('.map-text').textContent = 'Scroll Mode';
            playSyntheticSound('sorting-reveal-sound');
        } else {
            document.body.classList.remove('map-mode-active');
            mapToggle.classList.remove('active');
            mapToggle.querySelector('.map-text').textContent = 'Map Mode';
            document.body.style.overflow = '';
            playSyntheticSound('spell-cast-synth');
        }
    }

    // Zone navigation clicks in Map Mode
    mapZones.forEach(zone => {
        zone.addEventListener('click', (e) => {
            if (!document.body.classList.contains('map-mode-active')) return;

            // Prevent conflicts with buttons/links inside zone
            if (e.target.closest('button') || e.target.closest('a')) return;

            // Turn off map mode
            toggleMapMode(false);

            // Smooth scroll directly to the selected element
            const id = zone.getAttribute('id');
            const target = document.getElementById(id);
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}

/* ==========================================================================
   9. NARRATIVE LORE SCROLL TRANSITIONS
   ========================================================================== */
function initNarrativeAndScroll() {
    const loreBanners = document.querySelectorAll('.lore-banner');
    const sections = document.querySelectorAll('section:not(.hero-section)');

    // Immersive scroll entrance observer
    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');

                // Show associated lore banner
                const banner = entry.target.querySelector('.lore-banner');
                if (banner) {
                    banner.classList.add('visible');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Make sure hero lore banner pops on load
    const heroLore = document.getElementById('lore-hero');
    if (heroLore) {
        setTimeout(() => {
            heroLore.classList.add('visible');
        }, 1200);
    }
}

/* ==========================================================================
   10. EASTER EGGS SYSTEM & MARAUDER'S MAP FOOTPRINTS
   ========================================================================== */
function initEasterEggs() {
    const logo = document.getElementById('hogwarts-logo');
    const maraudersToggle = document.getElementById('marauders-toggle');
    const overlay = document.getElementById('marauders-overlay');
    const canvas = document.getElementById('footprints-canvas');

    if (!logo || !maraudersToggle || !canvas) return;

    // 1. Logo clicks counter
    let logoClicks = 0;
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        logoClicks++;

        // Soft sparkle on every click
        if (spawnSpellParticles) {
            const rect = logo.getBoundingClientRect();
            spawnSpellParticles('lumos', rect);
        }

        if (logoClicks >= 5) {
            logoClicks = 0;
            // Secret unlock!
            triggerLogoEasterEgg();
        }
    });

    function triggerLogoEasterEgg() {
        playSyntheticSound('sorting-reveal-sound');
        const originalHouse = document.body.getAttribute('data-house') || 'none';

        // Turn body gold themed temporarily
        document.body.setAttribute('data-house', 'none');
        document.body.style.setProperty('--color-glass-border', '#FFDF00');

        const castingStatus = document.getElementById('casting-status');
        if (castingStatus) {
            castingStatus.textContent = "✨ Secret Spell Unlocked: Mischief Managed! ✨";
            castingStatus.style.opacity = 1;
            setTimeout(() => {
                castingStatus.style.opacity = 0;
                document.body.setAttribute('data-house', originalHouse);
                document.body.style.removeProperty('--color-glass-border');
            }, 5000);
        }

        // Explode random golden canvas elements
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (spawnSortingExplosion) spawnSortingExplosion('hufflepuff');
            }, i * 300);
        }
    }

    // 2. Marauder's Map walking footprints engine
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    let isFootprintsActive = false;
    let footprintTimer = null;
    let footsteps = []; // Array of footprint nodes

    maraudersToggle.addEventListener('click', () => {
        isFootprintsActive = !isFootprintsActive;

        if (isFootprintsActive) {
            maraudersToggle.classList.add('active');
            overlay.classList.remove('hidden');
            playSyntheticSound('sorting-rumble');

            // Re-trigger whisper animation
            overlay.style.animation = 'none';
            void overlay.offsetWidth; // trigger reflow
            overlay.style.animation = null;

            startWalkingFootsteps();
        } else {
            maraudersToggle.classList.remove('active');
            overlay.classList.add('hidden');
            stopWalkingFootsteps();
        }
    });

    function startWalkingFootsteps() {
        footsteps = [];

        // Generate a random winding walking path traversing screen
        const pathPoints = [];
        let curX = width * 0.1;
        let curY = height * 0.8;
        pathPoints.push({ x: curX, y: curY });

        // Add winding segments
        for (let i = 0; i < 15; i++) {
            curX += (Math.random() * 80 + 40);
            curY += (Math.random() * 120 - 60);

            // Boundary checks
            if (curX > width) curX = width * 0.1;
            if (curY < 50 || curY > height - 50) curY = height * 0.5;

            pathPoints.push({ x: curX, y: curY });
        }

        let pathIndex = 0;
        let leftFoot = true;

        footprintTimer = setInterval(() => {
            if (pathIndex >= pathPoints.length) {
                pathIndex = 0; // Loop footprints walk
            }

            const p = pathPoints[pathIndex];
            const nextP = pathPoints[(pathIndex + 1) % pathPoints.length];

            // Compute angle between coordinates
            const angle = Math.atan2(nextP.y - p.y, nextP.x - p.x);

            // Add new footprint node
            footsteps.push({
                x: p.x + (leftFoot ? -12 : 12) * Math.sin(angle),
                y: p.y + (leftFoot ? 12 : -12) * Math.cos(angle),
                angle: angle,
                leftFoot: leftFoot,
                alpha: 1.0,
                age: 0,
                maxAge: 160
            });

            leftFoot = !leftFoot;
            pathIndex++;
            playSyntheticSound('hat-whisper'); // Soft step tick
        }, 500);
    }

    function stopWalkingFootsteps() {
        if (footprintTimer) {
            clearInterval(footprintTimer);
            footprintTimer = null;
        }
        // Fading out existing footprints happens inside animation loop
    }

    // Footprints Draw helpers
    function drawShoePrint(x, y, angle, isLeft, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;

        ctx.fillStyle = '#8c6e3b'; // Sepia ink
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(140, 110, 59, 0.4)';

        // Draw vintage shoe sole outline
        // Sole
        ctx.beginPath();
        ctx.ellipse(5, isLeft ? 4 : -4, 10, 5, 0.2 * (isLeft ? 1 : -1), 0, Math.PI * 2);
        ctx.fill();

        // Heel
        ctx.beginPath();
        ctx.ellipse(-8, isLeft ? 2 : -2, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function animateFootsteps() {
        ctx.clearRect(0, 0, width, height);

        for (let i = footsteps.length - 1; i >= 0; i--) {
            const foot = footsteps[i];
            foot.age++;

            // Start fading out after 60% of lifespan
            if (foot.age > foot.maxAge * 0.6) {
                foot.alpha -= 0.02;
            }

            drawShoePrint(foot.x, foot.y, foot.angle, foot.leftFoot, Math.max(0, foot.alpha));

            if (foot.alpha <= 0 || foot.age >= foot.maxAge) {
                footsteps.splice(i, 1);
            }
        }

        requestAnimationFrame(animateFootsteps);
    }

    animateFootsteps();
}

/* MAGNETIC INTERACTION FOR BUTTONS */
function initMagneticButtons() {
    if (window.innerWidth < 769) return;

    const btns = document.querySelectorAll('.btn, .btn-audio, .btn-marauders, .spell-cast-btn');

    btns.forEach(btn => {
        window.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();

            // Center points
            const btnX = rect.left + rect.width / 2;
            const btnY = rect.top + rect.height / 2;

            const distanceX = e.clientX - btnX;
            const distanceY = e.clientY - btnY;

            // Pythagorean distance
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const magneticThreshold = 70; // Attraction boundary

            if (distance < magneticThreshold) {
                // Attract button coordinates towards mouse delta vector
                const strength = 0.28;
                const moveX = distanceX * strength;
                const moveY = distanceY * strength;

                btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.03)`;
                btn.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
            } else {
                // Return to neutral
                btn.style.transform = '';
                btn.style.boxShadow = '';
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.boxShadow = '';
        });
    });
}

/* WEB AUDIO SYNTHESIZER FALLBACK */
let audioCtx = null;
let isAudioActive = false;
let ambientOsc = null;
let ambientGain = null;
let chimeInterval = null;

function initAudio() {
    const musicBtn = document.getElementById('audio-toggle');
    const ambientAudio = document.getElementById('ambient-audio');

    if (!musicBtn) return;

    musicBtn.addEventListener('click', () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        isAudioActive = !isAudioActive;

        if (isAudioActive) {
            musicBtn.querySelector('.audio-icon').textContent = '🔊';
            musicBtn.querySelector('.audio-text').textContent = 'On';
            musicBtn.style.background = 'rgba(212, 175, 55, 0.15)';
            musicBtn.style.borderColor = 'var(--color-gold-bright)';

            if (ambientAudio) {
                ambientAudio.currentTime = 0;
                ambientAudio.play().then(() => {
                    ambientAudio.volume = 0.35;
                }).catch(err => {
                    console.log("Audio file blocked. Generating synthetic ambient spell drones...");
                    startSyntheticAmbient();
                });
            } else {
                startSyntheticAmbient();
            }
        } else {
            musicBtn.querySelector('.audio-icon').textContent = '🔇';
            musicBtn.querySelector('.audio-text').textContent = 'Ambience';
            musicBtn.style.background = 'rgba(255, 255, 255, 0.05)';
            musicBtn.style.borderColor = 'rgba(212, 175, 55, 0.2)';

            if (ambientAudio) {
                ambientAudio.pause();
                ambientAudio.currentTime = 0;
            }
            stopSyntheticAmbient();
        }
    });
}

function playSyntheticSound(type) {
    if (!isAudioActive || !audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'spell-cast-synth') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    if (type === 'sorting-rumble') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.linearRampToValueAtTime(45, now + 4.5);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);

        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 4.5);

        osc.start(now);
        osc.stop(now + 4.5);
    }

    if (type === 'hat-whisper') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    if (type === 'card-hover-tick') {
        // Subtle wand spark tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

        gainNode.gain.setValueAtTime(0.02, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    if (type === 'sorting-reveal-sound') {
        const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
        notes.forEach((freq, index) => {
            const chimeOsc = audioCtx.createOscillator();
            const chimeGain = audioCtx.createGain();

            chimeOsc.connect(chimeGain);
            chimeGain.connect(audioCtx.destination);

            chimeOsc.type = 'sine';
            chimeOsc.frequency.setValueAtTime(freq, now + (index * 0.12));

            chimeGain.gain.setValueAtTime(0.15, now + (index * 0.12));
            chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + (index * 0.12));

            chimeOsc.start(now + (index * 0.12));
            chimeOsc.stop(now + 1.2 + (index * 0.12));
        });
    }
}

function startSyntheticAmbient() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    ambientOsc = audioCtx.createOscillator();
    ambientGain = audioCtx.createGain();
    const lpFilter = audioCtx.createBiquadFilter();

    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(180, now);

    ambientOsc.type = 'triangle';
    ambientOsc.frequency.setValueAtTime(110, now);

    ambientOsc.connect(lpFilter);
    lpFilter.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);

    ambientGain.gain.setValueAtTime(0.15, now);

    ambientOsc.start(now);

    chimeInterval = setInterval(() => {
        const chord = [440.00, 523.25, 659.25, 783.99, 880.00];
        const freq = chord[Math.floor(Math.random() * chord.length)];

        const nowTime = audioCtx.currentTime;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();

        o.connect(g);
        g.connect(audioCtx.destination);

        o.type = 'sine';
        o.frequency.setValueAtTime(freq, nowTime);

        g.gain.setValueAtTime(0.05, nowTime);
        g.gain.exponentialRampToValueAtTime(0.001, nowTime + 2.5);

        o.start(nowTime);
        o.stop(nowTime + 3.0);
    }, 2800);
}

function stopSyntheticAmbient() {
    if (ambientOsc) {
        try {
            ambientOsc.stop();
        } catch (e) { }
        ambientOsc = null;
    }
    if (ambientGain) {
        ambientGain.disconnect();
        ambientGain = null;
    }
    if (chimeInterval) {
        clearInterval(chimeInterval);
        chimeInterval = null;
    }
}
function initTimelineObserver() {
    const cards = document.querySelectorAll('.timeline-story-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2
    });

    cards.forEach(card => observer.observe(card));
}
function initTimelineObserver() {
    const cards = document.querySelectorAll('.timeline-story-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.2 });

    cards.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        card.style.transition = "all 0.6s ease";
        observer.observe(card);
    });
}

document.addEventListener("DOMContentLoaded", initTimelineObserver);
