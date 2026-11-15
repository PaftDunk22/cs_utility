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

const copyButton = document.getElementById("copy-button");

const backButton = document.getElementById("back-button");

const videoButton = document.getElementById("video-button");

const imageButton = document.getElementById("image-button");

const videoContainer = document.getElementById("video-container");

const imageContainer = document.getElementById("image-container");

const image = document.getElementById("nade-image");

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
            setupZoom(video);
        
        } 
        if (hasImage) {
            image.src = IS_LOCAL ? nade.image : (BASE_URL + nade.image);
            setupZoom(image);
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
    videoContainer.style.display = "block";
    imageContainer.style.display = "none";

}

function showImage() {

    imageButton.classList.add("active");
    videoButton.classList.remove("active");
    videoContainer.style.display = "none";
    imageContainer.style.display = "block";
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

copyButton.addEventListener("click", async () => {

    await navigator.clipboard.writeText(currentNade["setpos/setang"]);

    copyButton.textContent = "COPIED";

    setTimeout(() => {
        copyButton.textContent = "COPY COMMAND";
    }, 1200);

});

function setupZoom(media) {

    const zoom = 3;

    media.addEventListener("mousemove", e => {

        const rect = media.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (y > rect.height * 0.90 && media.tagName == "VIDEO") {
            return;
        }

        const originX = (x / rect.width) * 100;
        const originY = (y / rect.height) * 100;

        media.style.transformOrigin = `${originX}% ${originY}%`;
        media.style.transform = `scale(${zoom})`;

    });

    media.addEventListener("mouseleave", () => media.style.transform = "scale(1)");

}

loadNade();

