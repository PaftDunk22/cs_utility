const params = new URLSearchParams(window.location.search);

const mapId = params.get("map");

const mapName = document.getElementById("map-name");
const radarImage = document.getElementById("radar-image");
const markerContainer = document.getElementById("nade-markers");
const originContainer = document.getElementById("nade-origins");
const throwLines = document.getElementById("throw-lines");

const searchInput = document.getElementById("search");

const teamFilters =
    document.querySelectorAll(".team-filter");

const typeFilters =
    document.querySelectorAll(".type-filter");

const difficultyFilters =
    document.querySelectorAll(".difficulty-filter");

const situationFilters =
    document.querySelectorAll(".situation-filter");

const instantFilters =
    document.querySelectorAll('input[name="instant"]');

const clearButton =
    document.getElementById("clear-filters");

let nades = [];
let selectedLandingSpot = null;


async function loadMap() {

    if (!mapId) {
        window.location.href = "index.html";
        return;
    }

    mapName.textContent = mapId.toUpperCase();

    radarImage.src = `images/radars/${mapId}.png`;

    try {

        const response =
            await fetch(`data/${mapId}.json`);

        if (!response.ok) {
            throw new Error("Could not load map data.");
        }

        nades = await response.json();

        renderNades();

    } catch (error) {

        console.error(error);

        markerContainer.innerHTML =
            "<p>Could not load nade data.</p>";
    }
}


function getCheckedValues(elements) {

    return Array.from(elements)
        .filter(element => element.checked)
        .map(element => element.value);
}


function matchesFilters(nade) {

    const search =
        searchInput.value.trim().toLowerCase();

    if (search) {

        const searchableText = `
            ${nade.name}
            ${nade.description}
            ${nade.technique}
        `.toLowerCase();

        if (!searchableText.includes(search)) {
            return false;
        }
    }


    const selectedTeams =
        getCheckedValues(teamFilters);

    if (
        selectedTeams.length > 0 &&
        !selectedTeams.includes(nade.team)
    ) {
        return false;
    }


    const selectedTypes =
        getCheckedValues(typeFilters);

    if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(nade.type)
    ) {
        return false;
    }


    const selectedDifficulties =
        getCheckedValues(difficultyFilters);

    if (
        selectedDifficulties.length > 0 &&
        !selectedDifficulties.includes(nade.difficulty)
    ) {
        return false;
    }


    const selectedSituations =
        getCheckedValues(situationFilters);

    if (selectedSituations.length > 0) {

        const matchesSituation =
            selectedSituations.some(
                situation =>
                    nade.situation.includes(situation)
            );

        if (!matchesSituation) {
            return false;
        }
    }


    const instantValue =
        document.querySelector(
            'input[name="instant"]:checked'
        ).value;

    if (instantValue !== "all") {

        const wantedValue =
            instantValue === "true";

        if (nade.instant !== wantedValue) {
            return false;
        }
    }

    return true;
}


function renderNades() {

    markerContainer.innerHTML = "";
    originContainer.innerHTML = "";
    throwLines.innerHTML = "";

    selectedLandingSpot = null;

    const filteredNades =
        nades.filter(matchesFilters);


    /*
     * Group lineups by landing spot.
     */

    const landingSpots = new Map();

    filteredNades.forEach(nade => {

        if (!landingSpots.has(nade.landingSpotId)) {

            landingSpots.set(
                nade.landingSpotId,
                []
            );
        }

        landingSpots
            .get(nade.landingSpotId)
            .push(nade);
    });


    /*
     * Create one marker for each landing spot.
     */

    landingSpots.forEach((spotNades, landingSpotId) => {

        const firstNade = spotNades[0];

        const marker =
        document.createElement("button");

        marker.classList.add(
            "nade-marker",
            firstNade.type
        );

        marker.style.left =
            `${firstNade.landingPosition.x}%`;

        marker.style.top =
            `${firstNade.landingPosition.y}%`;

        marker.title =
            `${firstNade.name} (${spotNades.length} lineups)`;


        /*
        * Add nade icon.
        */

        const icon = document.createElement("img");

        icon.src =
            `images/icons/${firstNade.team.toLowerCase()}/${firstNade.type}.png`;

        icon.alt =
            `${firstNade.team} ${firstNade.type}`;

        marker.appendChild(icon);


        marker.addEventListener("click", () => {

            showOrigins(
                landingSpotId,
                spotNades,
                marker
            );

        });


        markerContainer.appendChild(marker);

    });

}


function showOrigins(
    landingSpotId,
    spotNades,
    marker
) {

    originContainer.innerHTML = "";
    throwLines.innerHTML = "";

    selectedLandingSpot = landingSpotId;


    const landingPosition =
        spotNades[0].landingPosition;


    /*
     * Create one dashed line for every lineup.
     */

    spotNades.forEach((nade, index) => {

        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

        line.classList.add("throw-line");


        line.setAttribute(
            "x1",
            `${nade.originPosition.x}%`
        );

        line.setAttribute(
            "y1",
            `${nade.originPosition.y}%`
        );

        line.setAttribute(
            "x2",
            `${landingPosition.x}%`
        );

        line.setAttribute(
            "y2",
            `${landingPosition.y}%`
        );


        throwLines.appendChild(line);


        /*
         * Create clickable origin.
         */

        const origin =
            document.createElement("button");

        origin.classList.add("nade-origin");

        origin.style.left =
            `${nade.originPosition.x}%`;

        origin.style.top =
            `${nade.originPosition.y}%`;


        origin.innerHTML =
            `<span>${index + 1}</span>`;


        origin.title =
            `${nade.name} - Lineup ${index + 1}`;


        origin.addEventListener("click", () => {

            window.location.href =
                `nade.html?map=${mapId}&nade=${nade.id}`;

        });


        originContainer.appendChild(origin);

    });

}


searchInput.addEventListener(
    "input",
    renderNades
);


[
    ...teamFilters,
    ...typeFilters,
    ...difficultyFilters,
    ...situationFilters,
    ...instantFilters
].forEach(filter => {

    filter.addEventListener(
        "change",
        renderNades
    );

});


clearButton.addEventListener("click", () => {

    searchInput.value = "";


    [
        ...teamFilters,
        ...typeFilters,
        ...difficultyFilters,
        ...situationFilters
    ].forEach(filter => {

        filter.checked = false;

    });


    document.querySelector(
        'input[name="instant"][value="all"]'
    ).checked = true;


    renderNades();

});


loadMap();