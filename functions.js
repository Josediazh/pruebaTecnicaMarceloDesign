const images = [];
const canvas = document.getElementById("animation-canvas");
const context = canvas.getContext("2d");
const animationState = {
    frame: 0
};

const framesecciontwo = {
    frame: 0
};

function getImagePrefix() {
    const width = window.innerWidth;

    if (width > 480) {
        return 'sequence_img';
    } else {
        return 'sequence_mobil_img';
    }
}

function getFrames() {
    const width = window.innerWidth;

    if (width > 480) {
        return 255;
    } else {
        return 238;
    }
}

const prefix = getImagePrefix();
const frameCount = getFrames();
const currentFrame = index => `./${prefix}/swanson__${index.toString().padStart(5, '0')}.jpg`;

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    context.setTransform(1, 0, 0, 1, 0, 0);

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


const loaderDiv = document.getElementById("loader");
let loadedImages = 0;

for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
        loadedImages++;
        if (loadedImages === frameCount) {
            loaderDiv.style.display = "none";
            startGSAP(); // Solo aquí activamos GSAP
        }
    };
    images.push(img);
}

const render = () => {
    const img = images[Math.floor(animationState.frame)];

    if (img && img.complete) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
};

function mostrarTextoPorFrame(frame) {
    const t1 = document.getElementById("texto-1");
    const t2 = document.getElementById("texto-2");
    const t3 = document.getElementById("texto-3");
    const t4 = document.getElementById("texto-4");

    t1.style.opacity = (frame >= 0 && frame <= 163) ? "1" : "0";
    t2.style.opacity = (frame > 164 && frame <= 195) ? "1" : "0";
    t3.style.opacity = (frame > 195 && frame <= 224) ? "1" : "0";
    t4.style.opacity = (frame >= 225 && frame <= 255) ? "1" : "0";
}

function mostrarbloqueFrame(scroll) {
    const bloque1 = document.getElementById("bloque-1");
    const bloque2 = document.getElementById("bloque-2");
    const bloque3 = document.getElementById("bloque-3");
    const bloque4 = document.getElementById("bloque-4");

    bloque1.style.opacity = (scroll >= 0.00 && scroll <= 0.50) ? "1" : "0";
    bloque2.style.opacity = (scroll >= 0.00 && scroll <= 0.50) ? "1" : "0";
    bloque3.style.opacity = (scroll >= 0.51 && scroll <= 0.95) ? "1" : "0";
    bloque4.style.opacity = (scroll >= 0.51 && scroll <= 0.95) ? "1" : "0";

}

function startGSAP() {

    gsap.to(animationState, {
        frame: frameCount - 1,
        snap: "current",
        ease: "none",
        scrollTrigger: {
            trigger: '#scroll-section',
            scrub: true,
            pin: true,
            start: "top top",
            end: "+=5000",
            onLeave: () => {
                document.getElementById("two-section").scrollIntoView({ behavior: "smooth" });
            }
        },
        onUpdate: () => {
            const currentFrame = Math.round(animationState.frame);
            render(currentFrame);
            mostrarTextoPorFrame(currentFrame);
        }
    });

    images[0].onload = render;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {

        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
            trigger: "#two-section",
            start: "top top",
            end: "+=1500",
            pin: true,
            pinSpacing: true,
            onUpdate: (self) => {
                const scroll = self.progress.toFixed(2);
                mostrarbloqueFrame(scroll);
            }
        });

        const cards = gsap.utils.toArray(".card");
        let centerIndex = 2;
        const spacing = 220;

        function updateCards() {
            cards.forEach((card, i) => {
                const offset = i - centerIndex;
                const x = offset * spacing;
                const y = Math.pow(offset, 2) * 20 + 80;
                const scale = offset === 0 ? 1.2 : 0.9;
                const rotateZ = offset * 10;
                const zIndex = 100 - Math.abs(offset);
                const opacity = Math.abs(offset) > 2 ? 0 : 1;

                gsap.to(card, {
                    duration: 0.5,
                    x,
                    y,
                    scale,
                    rotateZ,
                    zIndex,
                    opacity,
                    ease: "power2.out"
                });
            });
        }

        function goToNext() {
            centerIndex = (centerIndex + 1) % cards.length;
            updateCards();
        }

        function goToPrev() {
            centerIndex = (centerIndex - 1 + cards.length) % cards.length;
            updateCards();
        }

        cards.forEach(card => {
            Draggable.create(card, {
                type: "x",
                inertia: false,
                onDragEnd: function () {
                    if (this.getDirection() === "left" && this.endX < -50) {
                        goToNext();
                    } else if (this.getDirection() === "right" && this.endX > 50) {
                        goToPrev();
                    } else {
                        updateCards();
                    }
                }
            });
        });

        updateCards();

        return () => {
            scrollTrigger.kill();
            draggables.forEach(d => d.kill());
        };

    });
}

