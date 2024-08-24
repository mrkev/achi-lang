class Point {
    x: number;
    y: number;
    constructor(props: {
        x: number;
        y: number;
    }) {
        this.x = props.x;
        this.y = props.y;
    }
}
const x = 10;
const point = new Point({
    x: x,
    y: 2
});
export {};
