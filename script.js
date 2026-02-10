document.addEventListener('DOMContentLoaded', () => {
    
    // --- Scroll Animation Observer ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.fade-in-on-scroll');
    scrollElements.forEach(el => observer.observe(el));

    // --- Particle Background Animation ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Config
    const particleCount = 100;
    const connectionDistance = 150;
    const mouseDistance = 200;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? '#64ffda' : '#bd34fe'; // Cyan or Purple
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Init particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(136, 146, 176, ${1 - distance / connectionDistance})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
            
            // Connect to mouse
            if (mouse.x != null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouseDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(100, 255, 218, ${1 - distance / mouseDistance})`; // Cyan glow
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();

    // --- Project Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                    // Optional: Add animation re-trigger here if desired, but simple display toggle is robust
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                }
            });
        });
    });

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links li");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    navLinks.forEach(n => n.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));

    // --- The Event Horizon (Gravity Sim) ---
    const gravityCanvas = document.getElementById('gravity-canvas');
    if (gravityCanvas) {
        const gCtx = gravityCanvas.getContext('2d');
        let gWidth, gHeight;
        let orbiters = [];
        let blackHole = { x: 0, y: 0, mass: 2000, radius: 20 };
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let dragCurrent = { x: 0, y: 0 };

        function resizeGravity() {
            gWidth = gravityCanvas.width = gravityCanvas.offsetWidth;
            gHeight = gravityCanvas.height = gravityCanvas.offsetHeight;
            blackHole.x = gWidth / 2;
            blackHole.y = gHeight / 2;
            // Adjust mass based on screen size for playability
            blackHole.mass = (gWidth * gHeight) / 500; 
        }

        window.addEventListener('resize', resizeGravity);
        resizeGravity();

        class Orbiter {
            constructor(x, y, vx, vy) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.radius = Math.random() * 2 + 1;
                this.color = Math.random() > 0.5 ? '#64ffda' : '#bd34fe'; // Cyan or Purple
                this.history = [];
                this.maxHistory = 20;
            }

            update() {
                // F = G * (m1 * m2) / r^2
                // We'll simplify G*m2 to just blackHole.mass
                
                const dx = blackHole.x - this.x;
                const dy = blackHole.y - this.y;
                const distSq = dx*dx + dy*dy;
                const dist = Math.sqrt(distSq);

                // Event Horizon (Collision)
                if (dist < blackHole.radius) {
                    return false; // Dead
                }

                // Gravity force
                const force = blackHole.mass / distSq;
                const ax = force * (dx / dist);
                const ay = force * (dy / dist);

                this.vx += ax;
                this.vy += ay;

                this.x += this.vx;
                this.y += this.vy;

                // Trail
                this.history.push({x: this.x, y: this.y});
                if (this.history.length > this.maxHistory) {
                    this.history.shift();
                }

                // Escape velocity check (too far)
                if (this.x < -1000 || this.x > gWidth + 1000 || this.y < -1000 || this.y > gHeight + 1000) {
                    return false;
                }

                return true;
            }

            draw() {
                // Draw trail
                gCtx.beginPath();
                for (let i = 0; i < this.history.length; i++) {
                    const point = this.history[i];
                    if (i === 0) gCtx.moveTo(point.x, point.y);
                    else gCtx.lineTo(point.x, point.y);
                }
                gCtx.strokeStyle = this.color;
                gCtx.lineWidth = 0.5;
                gCtx.stroke();

                // Draw head
                gCtx.beginPath();
                gCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                gCtx.fillStyle = '#fff';
                gCtx.fill();
            }
        }

        // Interaction
        gravityCanvas.addEventListener('mousedown', (e) => {
            const rect = gravityCanvas.getBoundingClientRect();
            isDragging = true;
            dragStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            dragCurrent = { ...dragStart };
        });

        gravityCanvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const rect = gravityCanvas.getBoundingClientRect();
            dragCurrent = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        window.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            // Launch!
            // Velocity is proportional to drag distance (slingshot)
            // Reverse direction: Drag BACK to shoot FORWARD
            const vx = (dragStart.x - dragCurrent.x) * 0.1;
            const vy = (dragStart.y - dragCurrent.y) * 0.1;

            orbiters.push(new Orbiter(dragStart.x, dragStart.y, vx, vy));
        });

        function animateGravity() {
            gCtx.fillStyle = 'rgba(10, 15, 28, 0.2)'; // Trails effect (fading background)
            gCtx.fillRect(0, 0, gWidth, gHeight);

            // Draw Black Hole
            gCtx.beginPath();
            gCtx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
            gCtx.fillStyle = '#000';
            gCtx.fill();
            gCtx.strokeStyle = 'rgba(100, 255, 218, 0.5)'; // Accretion disk glow
            gCtx.lineWidth = 2;
            gCtx.stroke();

            // Draw Drag Line
            if (isDragging) {
                gCtx.beginPath();
                gCtx.moveTo(dragStart.x, dragStart.y);
                gCtx.lineTo(dragCurrent.x, dragCurrent.y);
                gCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                gCtx.setLineDash([5, 5]);
                gCtx.stroke();
                gCtx.setLineDash([]);
                
                // Trajectory Preview (optional, maybe keep simple for mystery)
            }

            // Update Orbiters
            for (let i = orbiters.length - 1; i >= 0; i--) {
                const alive = orbiters[i].update();
                if (alive) {
                    orbiters[i].draw();
                } else {
                    orbiters.splice(i, 1);
                }
            }

            requestAnimationFrame(animateGravity);
        }

        animateGravity();
    }
});
