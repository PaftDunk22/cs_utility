const maps = [
    {
        id: "inferno",
        name: "Inferno",
        image: "images/maps/inferno.jpg"
    },
    {
        id: "cache",
        name: "Cache",
        image: "images/maps/cache.jpg"
    },
    {
        id: "nuke",
        name: "Nuke",
        image: "images/maps/nuke.jpg"
    },
    {
        id: "ancient",
        name: "Ancient",
        image: "images/maps/ancient.jpg"
    },
    {
        id: "dust2",
        name: "Dust 2",
        image: "images/maps/dust2.jpg"
    },
    {
        id: "mirage",
        name: "Mirage",
        image: "images/maps/mirage.jpg"
    },
    {
        id: "anubis",
        name: "Anubis",
        image: "images/maps/anubis.jpg"
    },
    {
        id: "overpass",
        name: "Overpass",
        image: "images/maps/overpass.jpg"
    },
    {
        id: "vertigo",
        name: "Vertigo",
        image: "images/maps/vertigo.jpg"
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