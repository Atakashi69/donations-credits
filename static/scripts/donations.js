const creditsContainer = document.querySelector('.donations');
creditsContainer.style.top = '100%'

function startCreditsScroll() {
    const creditsHeight = creditsContainer.clientHeight;
    const windowHeight = window.innerHeight;

    const urlParams = new URLSearchParams(window.location.search);

    const fps = urlParams.get('credits_fps');
    const scrollSpeed = urlParams.get('credits_speed');
    const pause = urlParams.get('credits_pause');
    console.log(fps, scrollSpeed, pause)
    const duration = 1 / ((scrollSpeed * fps) / (creditsHeight + windowHeight))
    const animationSteps = fps * duration;

    let step = 0;

    console.log(animationSteps);
    function scrollStep() {
        if (step >= animationSteps) {
            step = 0;
            creditsContainer.style.top = '100%';
            setTimeout(scrollStep, 1000 * pause)
        } else {
            step++;
            creditsContainer.style.top = `calc(100% - ${scrollSpeed * step}px)`;
            setTimeout(scrollStep, 1000/fps);
        }
    }

    scrollStep();
}

startCreditsScroll();

