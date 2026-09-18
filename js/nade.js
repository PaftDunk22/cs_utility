const params = new URLSearchParams(
    window.location.search
);

const mapId = params.get("map");
const nadeId = params.get("nade");


const nadeName =
    document.getElementById("nade-name");

const title =
    document.getElementById("title");

const teamTag =
    document.getElementById("team-tag");

const typeTag =
    document.getElementById("type-tag");

const difficultyTag =
    document.getElementById("difficulty-tag");

const description =
    document.getElementById("description");

const technique =
    document.getElementById("technique");

const combinedCommand =
    document.getElementById("setpos-setang");

const copyCommandButton =
    document.getElementById("copy-command");

const lineupImage =
    document.getElementById("lineup-image");

const backButton =
    document.getElementById("back-button");


/* Media */

const videoButton =
    document.getElementById("video-button");

const imageButton =
    document.getElementById("image-button");

const videoContainer =
    document.getElementById("video-container");

const imageContainer =
    document.getElementById("image-container");

const video =
    document.getElementById("nade-video");


let currentNade = null;


/*
 * Load nade data.
 */

async function loadNade() {

    if (!mapId || !nadeId) {

        window.location.href =
            "index.html";

        return;
    }


    backButton.href =
        `map.html?map=${mapId}`;


    try {

        const response =
            await fetch(`data/${mapId}.json`);


        if (!response.ok) {

            throw new Error(
                "Could not load map data."
            );

        }


        const nades =
            await response.json();


        const nade =
            nades.find(
                item => item.id === nadeId
            );


        if (!nade) {

            throw new Error(
                "Nade not found."
            );

        }


        currentNade = nade;


        /*
         * Basic information.
         */

        nadeName.textContent =
            nade.name;

        title.textContent =
            nade.name;

        teamTag.textContent =
            nade.team;

        typeTag.textContent =
            nade.type.toUpperCase();

        difficultyTag.textContent =
            nade.difficulty.toUpperCase();


        /*
         * Description and technique.
         */

        description.textContent = nade.description || "-";

        technique.textContent = nade.technique || "-";


        /*
         * Commands.
         */

        combinedCommand.textContent = nade["setpos/setang"] || "-";
        
        /*
         * Image.
         */

        if (nade.lineupImage) {

            lineupImage.src =
                nade.lineupImage;

            lineupImage.onload =
                setupImageZoom;

        } else {

            imageButton.style.display =
                "none";

            imageContainer.classList.remove(
                "active"
            );

        }


        /*
         * Video.
         */

        if (nade.video) {

            video.src =
                nade.video;

            /*
             * Video is the default when
             * one is available.
             */

            showVideo();

        } else {

            /*
             * No video:
             * default to image.
             */

            videoButton.style.display =
                "none";

            showImage();

        }

    } catch (error) {

        console.error(error);

        title.textContent =
            "Could not load nade";

        description.textContent =
            error.message;

    }

}


/*
 * Show video.
 */

function showVideo() {

    videoButton.classList.add("active");

    imageButton.classList.remove("active");

    videoContainer.classList.add("active");

    imageContainer.classList.remove("active");

    video.play().catch(() => {});

}


/*
 * Show image.
 */

function showImage() {

    imageButton.classList.add("active");

    videoButton.classList.remove("active");

    imageContainer.classList.add("active");

    videoContainer.classList.remove("active");

    video.pause();

}


/*
 * Media buttons.
 */

videoButton.addEventListener(
    "click",
    showVideo
);

imageButton.addEventListener(
    "click",
    showImage
);


/*
 * Copy a command.
 */

async function copyCommand(
    command,
    button
) {

    if (!command || command === "-") {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            command
        );


        const originalText =
            button.textContent;


        button.textContent =
            "COPIED";


        setTimeout(() => {

            button.textContent =
                originalText;

        }, 1200);


    } catch (error) {

        console.error(
            "Could not copy command:",
            error
        );

    }

}


/*
 * Individual copy buttons.
 */

copyCommandButton.addEventListener("click", async () => {

    if (!currentNade || !currentNade["setpos/setang"]) {
        return;
    }

    try {

        await navigator.clipboard.writeText(
            currentNade["setpos/setang"]
        );

        const originalText =
            copyCommandButton.textContent;

        copyCommandButton.textContent =
            "COPIED";

        setTimeout(() => {

            copyCommandButton.textContent =
                originalText;

        }, 1200);

    } catch (error) {

        console.error(
            "Could not copy command:",
            error
        );

    }

});

/*
 * Image zoom.
 *
 * Creates a circular magnifying area
 * following the mouse.
 */

function setupImageZoom() {

    imageContainer.style.setProperty(
        "--zoom-image",
        `url("${lineupImage.src}")`
    );


    lineupImage.addEventListener(
        "mousemove",
        handleZoom
    );


    lineupImage.addEventListener(
        "mouseenter",
        () => {

            imageContainer.classList.add(
                "zooming"
            );

        }
    );


    lineupImage.addEventListener(
        "mouseleave",
        () => {

            imageContainer.classList.remove(
                "zooming"
            );

        }
    );

}


function handleZoom(event) {

    const rect =
        lineupImage.getBoundingClientRect();


    const x =
        event.clientX - rect.left;

    const y =
        event.clientY - rect.top;


    /*
     * Position of the mouse
     * inside the image.
     */

    const percentX =
        (x / rect.width) * 100;

    const percentY =
        (y / rect.height) * 100;


    /*
     * Position the magnifying circle.
     */

    imageContainer.style.setProperty(
        "--mouse-x",
        `${x}px`
    );

    imageContainer.style.setProperty(
        "--mouse-y",
        `${y}px`
    );


    /*
     * Enlarge the image inside
     * the magnifying circle.
     */

    const zoom =
        2.5;


    imageContainer.style.setProperty(
        "--zoom-size",
        `${rect.width * zoom}px ${rect.height * zoom}px`
    );


    imageContainer.style.setProperty(
        "--zoom-position",
        `${percentX}% ${percentY}%`
    );

}


loadNade();
