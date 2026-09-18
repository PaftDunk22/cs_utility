const maps = [
    {
        id: "mirage",
        name: "Mirage",
        image: "images/maps/mirage.png"
    },
    {
        id: "inferno",
        name: "Inferno",
        image: "images/maps/inferno.png"
    },
    {
        id: "ancient",
        name: "Ancient",
        image: "images/maps/ancient.png"
    },
    {
        id: "anubis",
        name: "Anubis",
        image: "images/maps/anubis.png"
    },
    {
        id: "nuke",
        name: "Nuke",
        image: "images/maps/nuke.png"
    },
    {
        id: "overpass",
        name: "Overpass",
        image: "images/maps/overpass.png"
    },
    {
        id: "vertigo",
        name: "Vertigo",
        image: "images/maps/vertigo.png"
    },
    {
        id: "cache",
        name: "Cache",
        image: "images/maps/cache.png"
    },
    {
        id: "dust2",
        name: "Dust 2",
        image: "images/maps/dust2.png"
    }
];


const mapGrid = document.getElementById("map-grid");


maps.forEach(map => {

    const mapCard = document.createElement("button");

    mapCard.classList.add("map-card");

    mapCard.innerHTML = `
        <img src="${map.image}" alt="${map.name} radar">
        <span>${map.name}</span>
    `;

    mapCard.addEventListener("click", () => {
        window.location.href = `map.html?map=${map.id}`;
    });

    mapGrid.appendChild(mapCard);
});