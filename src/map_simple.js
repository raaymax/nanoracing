module.exports = {
    map: {
        size: {
            width: 8*400,
            height: 8*400,
        },
        road: [
            {
                pos: [0, 1],
                tile: "road.png"
            },
            {
                pos: [0, 0],
                tile: "turning.png"
            },
            {
                pos: [1, 0],
                tile: "turning.png",
                rotation: Math.PI/2
            },
            {
                pos: [1, 1],
                tile: "turning.png",
                rotation: -Math.PI/2
            },
            {
                pos: [2, 1],
                tile: "road.png"
            },
            {
                pos: [3, 1],
                tile: "turning.png",
                rotation: Math.PI
            },
            {
                pos: [3, 0],
                tile: "turning.png"
            },
            {
                pos: [4, 0],
                tile: "turning.png",
                rotation: Math.PI/2
            },
            {
                pos: [4, 1],
                tile: "road.png"
            },
            {
                pos: [4, 2],
                tile: "road.png"
            },
            {
                pos: [4, 3],
                tile: "turning.png",
                rotation: Math.PI
            },
            {
                pos: [3, 3],
                tile: "road.png"
            },
            {
                pos: [2, 3],
                tile: "road.png"
            },
            {
                pos: [1, 3],
                tile: "road.png"
            },
            {
                pos: [0, 3],
                tile: "turning.png",
                rotation: -Math.PI/2
            },
            {
                pos: [0, 2],
                tile: "goal.png",
                rotation: Math.PI / 2
            },
        ]
    }
};