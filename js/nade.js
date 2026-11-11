const params = new URLSearchParams(window.location.search);

const mapId = params.get("map");
const nadeId = params.get("nade");
const team = params.get("team");
const type = params.get("type");

const BASE_URL = "https://raw.githubusercontent.com/PaftDunk22/cs_utility/main/";

const IS_LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1";

const title = document.getElementById("title");

const teamTag = document.getElementById("team-tag");

const typeTag = document.getElementById("type-tag");

const difficultyTag = document.getElementById("difficulty-tag");

const description = document.getElementById("description");

const technique = document.getElementById("technique");

const combinedCommand = document.getElementById("setpos-setang");

const copyCommandButton =document.getElementById("copy-command");

const lineupImage = document.getElementById("lineup-image");

const backButton = document.getElementById("back-button");

const videoButton = document.getElementById("video-button");

const imageButton = document.getElementById("image-button");

const videoContainer = document.getElementById("video-container");

const imageContainer = document.getElementById("image-container");

const video = document.getElementById("nade-video");


let currentNade = null;

async function loadNade() {

    if (!mapId || !nadeId) {

        window.location.href = "index.html";

        return;
    }

    backButton.addEventListener("click", event => {
        event.preventDefault();

        if (document.referrer.includes("map.html")) {
            history.back();
        } 
        else {
            window.location.href = `map.html?map=${mapId}`;
        }
    });

    try {
        const response = await fetch(`data/${mapId}.json`);

        if (!response.ok) {
            throw new Error("Could not load map data.");
        }

        const data = await response.json();

        const nade = data[team]?.[type]?.[nadeId];

        if (!nade) {
            throw new Error("Nade not found.");
        }

        currentNade = {
            ...nade,
            id: nadeId,
            team,
            type
        };

        title.textContent = nade.name;

        teamTag.textContent = team;

        typeTag.textContent = type.toUpperCase();

        difficultyTag.textContent = nade.difficulty.toUpperCase();

        description.textContent = nade.description || "-";

        technique.textContent = nade.technique || "-";

        combinedCommand.textContent = nade["setpos/setang"] || "-";

        const hasVideo = await hasMedia("video")
        const hasImage = await hasMedia("image")

        videoButton.style.display = hasVideo ? "" : "none";
        imageButton.style.display = hasImage ? "" : "none";

        if (hasVideo){
            video.src = IS_LOCAL ? nade.video : (BASE_URL + nade.video);
            setupVideoZoom();
        } 
        if (hasImage) {
            lineupImage.src = IS_LOCAL ? nade.image : (BASE_URL + nade.image);
            lineupImage.onload = setupImageZoom;
        }

        if (hasVideo) showVideo();
        else showImage();

    } catch (error) {

        console.error(error);
        title.textContent =  "Could not load nade";
        description.textContent = error.message;

    }

}

videoButton.addEventListener("click",showVideo);
imageButton.addEventListener("click",showImage);

function showVideo() {

    videoButton.classList.add("active");
    imageButton.classList.remove("active");
    videoContainer.classList.add("active");
    imageContainer.classList.remove("active");

    video.play().catch(() => {});

}

function showImage() {

    imageButton.classList.add("active");
    videoButton.classList.remove("active");
    imageContainer.classList.add("active");
    videoContainer.classList.remove("active");

    video.pause();

}

async function hasMedia(mediaType) {
    const url = IS_LOCAL ? currentNade[mediaType] : BASE_URL + currentNade[mediaType];

    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch {
        return false;
    }
}

async function copyCommand(command,button) 
{

    if (!command || command === "-") {
        return;
    }

    try {

        await navigator.clipboard.writeText(
            command
        );

        const originalText = button.textContent;

        button.textContent = "COPIED";

        setTimeout(() => {
            button.textContent = originalText;
        }, 1200);

    } catch (error) {

        console.error(
            "Could not copy command:",
            error
        );
    }

}

copyCommandButton.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(currentNade["setpos/setang"]);

        const originalText = copyCommandButton.textContent;

        copyCommandButton.textContent = "COPIED";

        setTimeout(() => {

            copyCommandButton.textContent =originalText;

        }, 1200);

    } catch (error) {

        console.error(
            "Could not copy command:",
            error
        );
    }
});

function setupImageZoom() {

    imageContainer.style.setProperty("--zoom-image",`url("${lineupImage.src}")`);

    lineupImage.addEventListener("mousemove",handleZoom);

    lineupImage.addEventListener("mouseenter",() => 
        {
            imageContainer.classList.add("zooming");
        }
    );

    lineupImage.addEventListener("mouseleave",() => 
        {
            imageContainer.classList.remove("zooming");
        }
    );

}

function setupImageZoom() {

    imageContainer.style.setProperty("--zoom-image", `url("${lineupImage.src}")`);

    lineupImage.addEventListener("mousemove", event => {
        handleZoom(event, lineupImage, imageContainer);
    });

    lineupImage.addEventListener("mouseenter", () => {
        imageContainer.classList.add("zooming");
    });

    lineupImage.addEventListener("mouseleave", () => {
        imageContainer.classList.remove("zooming");
    });

}

function setupVideoZoom() {

    video.addEventListener("mousemove", event => {

    const rect = video.getBoundingClientRect();
    const y = event.clientY - rect.top;

    if (y > rect.height - 60) {
        videoContainer.classList.remove("zooming");
        return;
    }

    videoContainer.classList.add("zooming");
    handleZoom(event, video, videoContainer);

    });

    video.addEventListener("mouseenter", () => {
        videoContainer.classList.add("zooming");
    });

    video.addEventListener("mouseleave", () => {
        videoContainer.classList.remove("zooming");
        video.style.transformOrigin = "center center";
    });

}

function handleZoom(event, element, container) {

    const rect = element.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const zoom = 2.5;

    if (element === video) {
        video.style.transformOrigin = `${percentX}% ${percentY}%`;
    } else {
        container.style.setProperty("--mouse-x", `${x}px`);
        container.style.setProperty("--mouse-y", `${y}px`);

        container.style.setProperty(
            "--zoom-size",
            `${rect.width * zoom}px ${rect.height * zoom}px`
        );

        container.style.setProperty(
            "--zoom-position",
            `${percentX}% ${percentY}%`
        );
    }

}

/*
function setupVideoZoom() {

    video.addEventListener("mousemove", handleVideoZoom);

    video.addEventListener("mouseenter", () => {
        videoContainer.classList.add("zooming");
    });

    video.addEventListener("mouseleave", () => {
        videoContainer.classList.remove("zooming");
        video.style.transformOrigin = "center center";
    });

}

function handleZoom(event, element, container) {

    const rect = element.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    container.style.setProperty("--mouse-x", `${x}px`);
    container.style.setProperty("--mouse-y", `${y}px`);

    const zoom = 2.5;

    container.style.setProperty(
        "--zoom-size",
        `${rect.width * zoom}px ${rect.height * zoom}px`
    );

    container.style.setProperty(
        "--zoom-position",
        `${percentX}% ${percentY}%`
    );
}


function handleVideoZoom(event) {

    if (event.offsetY > video.clientHeight - 45) return;

    const rect = video.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    video.style.transformOrigin = `${percentX}% ${percentY}%`;

}

function handleZoom(event) {

    const rect = lineupImage.getBoundingClientRect();

    const x = event.clientX - rect.left;

    const y = event.clientY - rect.top;
        
    const percentX = (x / rect.width) * 100;

    const percentY = (y / rect.height) * 100;

    imageContainer.style.setProperty("--mouse-x",`${x}px`);

    imageContainer.style.setProperty("--mouse-y",`${y}px`);

    const zoom = 2.5;

    imageContainer.style.setProperty("--zoom-size",`${rect.width * zoom}px ${rect.height * zoom}px`);

    imageContainer.style.setProperty("--zoom-position",`${percentX}% ${percentY}%`);

}
*/
loadNade();
