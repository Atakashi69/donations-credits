const sliders = document.querySelectorAll('input[type=range]');
const num_inputs = document.querySelectorAll('input[type=number]');
const donations_url = document.getElementById('donations_url');

const base_url = donations_url.value;

function generateURL() {
    const credits_fps = document.getElementById('credits_fps');
    const credits_speed = document.getElementById('credits_speed');
    const credits_pause = document.getElementById('credits_pause');

    const args = new URLSearchParams({
        credits_fps: credits_fps.value,
        credits_speed: credits_speed.value,
        credits_pause: credits_pause.value
    });

    const lastIndex = base_url.lastIndexOf('//');
    donations_url.value = base_url.slice(0, lastIndex) + base_url.slice(lastIndex + 1) + '&' + args;
}

function copyURL() {
    donations_url.select();
    donations_url.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(donations_url.value).then(() => {
        alert('Copied text to clipboard!');
    });
}

function updateSliderValue(event) {
    const slider = event.target;
    const sliderValueElement = slider.nextElementSibling;

    const min = Number(slider.min);
    const max = Number(slider.max);
    const val = Number(slider.value);

    let percentage = (val - min) * 100 / (max - min);
    slider.style.backgroundSize = `${percentage}% 100%`
    sliderValueElement.textContent = slider.value;
    generateURL();
}

function checkNumberValue(event) {
    const num_input = event.target;

    const min = Number(num_input.min);
    const max = Number(num_input.max);
    const val = Number(num_input.value);

    if (val < min)
        num_input.value = min;
    else if (val > max)
        num_input.value = max;
    generateURL();
}

sliders.forEach(slider => {
    slider.addEventListener('input', updateSliderValue);
    slider.dispatchEvent(new Event('input'));
});

num_inputs.forEach(num_input => {
    num_input.addEventListener('change', checkNumberValue);
    num_input.dispatchEvent(new Event('change'));
});