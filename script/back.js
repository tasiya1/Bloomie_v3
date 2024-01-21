/*


const drawingModes = [DRAW,RECT,SCATTER,ELLIPSE,NEON,STAR,
    //FILL,
    BRIDGE,AIRBRUSH,DROPS,STROKES,WATERMELON,PIXELS
]

*/
const toolButtons = ["draw","rect","scatter","ellipse","neon","star","bridge","airbrush","drops","strokes","baza","pixels"]


class ColorPalette {
    constructor (name, colors) {
        this.name = name
        this.colors = colors
    }
}

class DrawingTool {
    constructor (name, onDrawFunction){
        this.name = name
        this.onDraw = onDrawFunction
    }
}

class DrawingMachine {
    constructor(){

        this.canvas = document.getElementById("ground")
        this.preview = document.getElementById("preview")

        this.currentTool = null
        this.drawingTools = []
        this.drawingMode = null
        this.prevX = this.prevY = this.curX = this.curY = 0

        this.canvas.height = window.innerHeight
        this.canvas.width = window.innerWidth

        this.preview.height = window.innerHeight
        this.preview.width = window.innerWidth

        this.ct = this.canvas.getContext("2d", { willReadFrequently: true });
        this.pr = this.preview.getContext("2d");

        this.pointArray = []

        this.toolDown = this.toolDown.bind(this);
        this.toolOn = this.toolOn.bind(this);
        this.toolUp = this.toolUp.bind(this);

        this.initCanvas();
        this.initDrawingTools()
        this.initToolButtons()
    }

    initCanvas(){
        /*
        let x = parseInt(document.getElementById("size-x").value);
        let y = parseInt(document.getElementById("size-y").value);

        if (isNaN(x) || x == null || isNaN(y) || y == null){
            x = 1400;
            y = 700;
        }
        this.canvas.height = y;
        this.canvas.width = x;

        this.preview.height = y;
        this.preview.width = x;*/

        this.pr = this.preview.getContext("2d");
        this.ct = this.canvas.getContext("2d", { willReadFrequently: true });
        this.ct.fillStyle = "#f9f8f5";
        this.ct.fillRect(0, 0, window.innerWidth, window.innerHeight);

        document.getElementById("canvas-size-window").style.visibility = "hidden";

        window.addEventListener("mousedown", this.toolDown);
        window.addEventListener("mousemove", this.toolOn);
        window.addEventListener("mouseup", this.toolUp);

        this.ct.lineWidth = penwi;
        this.ct.lineCap = "round";
        this.ct.lineJoin = "miter";
        this.ct.strokeStyle = color1;
        this.ct.fillStyle = color2;
        this.pr.lineJoin = "miter";
    }

    toolDown(ev){
        is_drawing = true
        updatePen()
        this.ct.beginPath() // to prevent changing the properties of finished objects

        this.pointArray.splice(0, this.pointArray.length)

        prevX = ev.clientX
        prevY = ev.clientY

        //console.log(ev)
    }

    toolOn(ev){
        var curX = ev.clientX
        var curY = ev.clientY
    
        if (jitter){
            this.ct.lineWidth = Math.random()*penwi
            this.ct.globalAlpha = Math.random()
        }
    
        //this.ct.strokeStyle = "rgb(" + Math.random()*255 + ", " + Math.random()*255 + ", " + Math.random()*255 + ")"
        
        if (drawingMode != POLYINPUT && drawingMode != DRAW && drawingMode!=PIXELS) 
        this.pr.clearRect(0,0,this.preview.width, this.preview.height)
    
        if (prevX == null || prevY == null){
            prevX = ev.clientX
            prevY = ev.clientY
            //return
        }
        if (drawingMode != RECT && drawingMode != ELLIPSE && drawingMode != STAR && drawingMode != WATERMELON) {
            prevX = curX
            prevY = curY
        }
        //console.log(ev)

        //this.currentTool = this.getCurrentTool();
        if (is_drawing)
        this.currentTool.onDraw(ev);

    }

    toolUp(ev){
        is_drawing = false
        var endX = ev.clientX
        var endY = ev.clientY
        this.ct.closePath()
    
        saved = false
    
        updateBuffer()
    
        if (drawingMode == RECT) {
            authRect(this.ct,prevX, prevY, endX, endY)
        } else if (drawingMode == ELLIPSE){
            authEll(this.ct,prevX, prevY, endX, endY)
        } else if (drawingMode == STAR){
            drawStar(this.ct,prevX, prevY, endX, endY, ncuts*2)
        } else if (drawingMode == FILL){
            paintAt(endX, endY)
        } else if (drawingMode == WATERMELON){
            watermelon(prevX, prevY, endX, endY)
        } else if (drawingMode == POLYINPUT){
            polyInput(endX, endY)
        }
        //console.log(ev)

    }

    initDrawingTools(){
        this.drawingTools = [
            new DrawingTool("Pen", this.penOn.bind(this)),
            new DrawingTool("Rectangle", this.rectangleOn.bind(this)),
            new DrawingTool("Scatter", this.scatterOn.bind(this)),
            new DrawingTool("Ellipse", this.ellipseOn.bind(this)),
            new DrawingTool("Star", this.starOn.bind(this)),
            new DrawingTool("Neon", this.neonOn.bind(this)),
            new DrawingTool("Fill", this.fillOn.bind(this)),
            new DrawingTool("Bridge", this.bridgeOn.bind(this)),
            new DrawingTool("Airbrush", this.airbrushOn.bind(this)),
            new DrawingTool("Drops", this.dropsOn.bind(this)),
            new DrawingTool("Strokes", this.strokesOn.bind(this)),
            new DrawingTool("Watermelon", this.watermelonOn.bind(this)),
            new DrawingTool("PolyInput", this.polyinput.bind(this)),
            new DrawingTool("Polygon", this.polygonOn.bind(this)),
            new DrawingTool("Pixels", this.pixelsOn.bind(this))
        ]

        this.currentTool = this.drawingTools["Pen"]
    }

    initToolButtons(){
        let tools = ["Pen", "Rectangle", "Scatter", "Ellipse", "Star", "Neon", "Fill", "Bridge", 
        "Airbrush", "Drops", "Strokes", "Watermelon", "PolyInput", "Polygon", "Pixels"]

        for (let i = 0; i < tools.length; i++){
            document.getElementById(toolButtons[i] + "_button").addEventListener("click", (ev)=>{
                //drawingMode = drawingModes[i];
                let button = event.target;
                let id = button.data.id
                this.setCurrentTool(id)
            })
        }
    }

    penOn(prevX, prevY, curX, curY){
        //this.pointArray.push([curX, curY])
        
        //add pen calibration
        
        this.ct.beginPath();   
    
        this.ct.moveTo(prevX, prevY)
        this.ct.lineTo(curX, curY)
        this.ct.stroke(); 
        //this.ct.lineWidth = penwi / (1/ distanceBetweenPoints(prevX, prevY, curX, curY) * jitter_range)
    }
    
    getCurrentTool(){
        this.drawingMode
    }

    setCurrentTool(title){
        this.currentTool = this.drawingTools[title]
    }

    ellipseOn(){

    }

    scatterOn(){

    }

    rectangleOn(){
        
    }

    starOn(){
        
    }

    neonOn(){
        
    }

    fillOn(){
        
    }

    bridgeOn(){
        
    }

    airbrushOn(){
        
    }

    dropsOn(){
        
    }

    strokesOn(){
        
    }

    watermelonOn(){
        
    }

    polyinput(){
        
    }

    polygonOn(){
        
    }    

    pixelsOn(curX, curY){
        this.ct.beginPath()
        this.ct.fillRect(Math.floor(curX/pixel_size)*pixel_size, Math.floor(curY/pixel_size)*pixel_size, pixel_size, pixel_size)
        this.ct.stroke()
    }


    

}

let dm = new DrawingMachine()

document.getElementById("startCanvas").style.visibility = "hidden"//.addEventListener("click", () => { dm = new DrawingMachine(); });


//getting the presaved data
var saved = false

const sideBarWidth = 300
var sbopen = false

class Point{
    constructor(x, y){
        this.x = x
        this.y = y
        this.a = 0
        this.isreflex = false
    }
}




const MAX_BUFFER_SIZE = 10

// DRAWING MODES
const DRAW = 1
const RECT = 2
const SCATTER = 3
const ELLIPSE = 4
const STAR = 5
const NEON = 6
const FILL = 7
const BRIDGE = 8
const AIRBRUSH = 9
const DROPS = 10
const STROKES = 11
const WATERMELON = 12
const POLYINPUT = 13
const POLYGON = 14
const PIXELS = 15

// DRAWING STATUSES
var is_drawing = false
var drawingMode = DRAW // drawing mode DRAW by default
var fill_or_no = false
var flat = false
var contour = true
var jitter = false
var round = true

// VALUES
var prevX = null //var vs var
var prevY = null

var cx = 0, cy = 0

var color1 = "#000000"
var color2 = "#f9f8f5"

var r, g, b

// DRAWING PARAMETERS
var penwi = 1
var diami = 50
var densi = 100
var transi = 50
var ncuts = 5
var n = 2
var point_recentness = 10
var connectivity_range = 300
var line_offset = 0
var nlines = 5
var linedistance = 10
var jitter_range = 15
var bridge_density = 5
var pixel_size = 30

var polySet = []


document.getElementById("clear").addEventListener("click", () => {
    dm.ct.globalAlpha = 1
    dm.ct.fillStyle = color2
    dm.ct.fillRect(0, 0, dm.canvas.width, dm.canvas.height)
    dm.ct.beginPath();
    updateBuffer()
    //dm.canvas.width = dm.canvas.width
    //dm.canvas.height = dm.canvas.height
})

document.getElementById("save").addEventListener("click", () => {
    //var  file_name = prompt("Повне ім'я файлу:");
    let data = dm.canvas.toDataURL("imag/jpg")
    let canvas_image = document.createElement("a")
    canvas_image.href = data

    canvas_image.download = "My Blooming sketch" //file_name
    canvas_image.click()
})


document.getElementById("save-to-db").addEventListener("click", () => {
 
      var projectForm = document.getElementById("sendImageData");
      const imageInput = document.getElementById("imageInput");

      // Convert the canvas image data to a Blob
        let imageData = dm.canvas.toDataURL("image/png")
        document.getElementById('imageDataInput').value = imageData;
        projectForm.submit();
    saved = true
})



// SLIDERS CHANGE
var pen_size = document.getElementById("pen_size");
var pen_size_label = document.getElementById("pen_size_label");
pen_size_label.innerHTML = pen_size.value;
dm.ct.lineWidth = pen_size.value;
pen_size.addEventListener("input", () => {
    dm.ct.lineWidth = pen_size.value;
    penwi = pen_size.value
    pen_size_label.innerHTML = pen_size.value;
})

var transparency_slider = document.getElementById("transparency_slider");
var transparency_slider_label = document.getElementById("transparency_slider_label");
transparency_slider_label.innerHTML = transparency_slider.value;
transi = transparency_slider.value;
transparency_slider.addEventListener("input", () => {
    transi = transparency_slider.value;
    transparency_slider_label.innerHTML = transparency_slider.value;
})

document.getElementById("round").addEventListener("input", () => {round = !round})

var radius = document.getElementById("radius");
var radius_label = document.getElementById("radius_label");
radius_label.innerHTML = radius.value;
diami = radius.value;
radius.addEventListener("input", () => {
    diami = radius.value;
    radius_label.innerHTML = radius.value;
})

var density = document.getElementById("density");
var density_label = document.getElementById("density_label");
density_label.innerHTML = density.value;
densi = density.value;
density.addEventListener("input", () => {
    densi = density.value;
    density_label.innerHTML = density.value;
})

var star_ncuts = document.getElementById("star_ncuts");
var star_ncuts_label = document.getElementById("star_ncuts_label");
star_ncuts_label.innerHTML = star_ncuts.value;
ncuts = star_ncuts.value;
star_ncuts.addEventListener("input", (ev) => {
    ncuts = ev.target.value;
    star_ncuts_label.innerHTML = star_ncuts.value;
})

var inner_radius = document.getElementById("inner_radius");
var inner_radius_label = document.getElementById("inner_radius_label");
inner_radius_label.innerHTML = inner_radius.value;
n = inner_radius.value;
inner_radius.addEventListener("input", () => {
    n = inner_radius.value;
    inner_radius_label.innerHTML = inner_radius.value;
})

var density = document.getElementById("density");
var density_label = document.getElementById("density_label");
density_label.innerHTML = density.value;
densi = density.value;
density.addEventListener("input", () => {
    densi = density.value;
    density_label.innerHTML = density.value;
})

var jitter_slider = document.getElementById("jitter_slider");
var jitter_slider_label = document.getElementById("jitter_slider_label");
jitter_slider_label.innerHTML = jitter_slider.value;
jitter_range = jitter_slider.value;
jitter_slider.addEventListener("input", () => {
    jitter_range = jitter_slider.value;
    jitter_slider_label.innerHTML = jitter_slider.value;
})

var recentness_slider = document.getElementById("recentness_slider");
var recentness_slider_label = document.getElementById("recentness_slider_label");
recentness_slider_label.innerHTML = recentness_slider.value;
point_recentness = recentness_slider.value;
recentness_slider.addEventListener("input", () => {
    point_recentness = recentness_slider.value;
    recentness_slider_label.innerHTML = recentness_slider.value;
})

var connectivity_slider = document.getElementById("connectivity_slider");
var connectivity_slider_label = document.getElementById("connectivity_slider_label");
connectivity_slider_label.innerHTML = connectivity_slider.value;
connectivity_range = connectivity_slider.value;
connectivity_slider.addEventListener("input", () => {
    connectivity_range = connectivity_slider.value;
    connectivity_slider_label.innerHTML = connectivity_slider.value;
})

var bridge_transi_slider = document.getElementById("bridge_transi_slider");
var bridge_transi_slider_label = document.getElementById("bridge_transi_slider_label");
bridge_transi_slider_label.innerHTML = bridge_transi_slider.value;
bridge_transi = bridge_transi_slider.value;
bridge_transi_slider.addEventListener("input", () => {
    bridge_transi = bridge_transi_slider.value;
    bridge_transi_slider_label.innerHTML = bridge_transi_slider.value;
})

var br_densi_slider = document.getElementById("br_densi_slider");
var br_densi_slider_label = document.getElementById("br_densi_slider_label");
br_densi_slider_label.innerHTML = br_densi_slider.value;
bridge_density = br_densi_slider.value;
br_densi_slider.addEventListener("input", () => {
    bridge_density = br_densi_slider.value;
    br_densi_slider_label.innerHTML = br_densi_slider.value;
})

var offset_slider = document.getElementById("offset_slider");
var offset_slider_label = document.getElementById("offset_slider_label");
offset_slider_label.innerHTML = offset_slider.value;
line_offset = offset_slider.value;
offset_slider.addEventListener("input", () => {
    line_offset = offset_slider.value;
    offset_slider_label.innerHTML = offset_slider.value;
})

var strokes_slider = document.getElementById("strokes_slider");
var strokes_sliderlabel = document.getElementById("strokes_slider_label");
strokes_slider_label.innerHTML = strokes_slider.value;
linedistance = strokes_slider.value;
strokes_slider.addEventListener("input", () => {
    linedistance = strokes_slider.value;
    strokes_slider_label.innerHTML = strokes_slider.value;
})

var nstrokes_slider = document.getElementById("nstrokes_slider");
var nstrokes_slider_label = document.getElementById("nstrokes_slider_label");
nstrokes_slider_label.innerHTML = nstrokes_slider.value;
nlines = nstrokes_slider.value;
nstrokes_slider.addEventListener("input", () => {
    nlines = nstrokes_slider.value;
    nstrokes_slider_label.innerHTML = nstrokes_slider.value;
})

var pixel_size_slider = document.getElementById("pixel_size_slider");
var pixel_size_label = document.getElementById("pixel_size_label");
pixel_size_label.innerHTML = pixel_size_slider.value;
pixel_size = pixel_size_slider.value;
pixel_size_slider.addEventListener("input", () => {
    pixel_size = pixel_size_slider.value;
    pixel_size_label.innerHTML = pixel_size_slider.value;

    dm.pr.clearRect(0, 0, window.innerWidth, window.innerHeight)
    var curx=0, cury=0
    /*
    for (let i = 0; cury<window.innerHeight; i++){
        for (let j = 0; curx<window.innerWidth; j++){
            dm.ct.beginPath()
            dm.ct.rect(tx1, ty1, pixel_size, pixel_size)
            dm.ct.stroke()
            tx1 += pixel_size+pixel_size
        }
        ty1 += pixel_size+pixel_size
        tx1 = 0
    }*/
    dm.pr.strokeStyle = "rgba(100, 100, 100, 0.5)"
    while (cury<window.innerHeight){
        dm.pr.beginPath()
        dm.pr.moveTo(0, cury)
        dm.pr.lineTo(window.innerWidth, cury)
        dm.pr.stroke()
        cury+=parseInt(pixel_size)
    }
    while (curx<window.innerWidth){
        dm.pr.beginPath()
        dm.pr.moveTo(curx, 0)
        dm.pr.lineTo(curx, window.innerHeight)
        dm.pr.stroke()
        curx+=parseInt(pixel_size)
    }
})

let pen_color = document.getElementById("pen_color")
let brush_color = document.getElementById("brush_color")
let fill_checkbox = document.getElementById("fill_rect")

document.getElementById("undo_button").addEventListener("click", () => undo())
document.getElementById("redo_button").addEventListener("click", () => redo())
document.getElementById("grid_button").addEventListener("click", () => document.getElementById("gridBar").style.width = sideBarWidth + "px")
document.getElementById("closeGrid").addEventListener("click", () => document.getElementById("gridBar").style.width = "0")

var x1=0, y1=0, w1=0, h1=0, offx=0, offy=0, nx=0, ny=0
document.getElementById("sx_grid").addEventListener("input", (e) => {
    x1 = parseInt(e.target.value)
    document.getElementById("sxL").innerHTML = x1
})
document.getElementById("sy_grid").addEventListener("input", (e) => {
    y1 = parseInt(e.target.value)
    document.getElementById("syL").innerHTML = y1
})
document.getElementById("w_grid").addEventListener("input", (e) => {
    w1 = parseInt(e.target.value)
    document.getElementById("wL").innerHTML = w1
})
document.getElementById("h_grid").addEventListener("input", (e) => {
    h1 = parseInt(e.target.value)
    document.getElementById("hL").innerHTML = h1
})
document.getElementById("offx_grid").addEventListener("input", (e) => {
    offx = parseInt(e.target.value)
    document.getElementById("oxL").innerHTML = offx
})
document.getElementById("offy_grid").addEventListener("input", (e) => {
    offy = parseInt(e.target.value)
    document.getElementById("oyL").innerHTML = offy
})
document.getElementById("nx_grid").addEventListener("input", (e) => {
    nx = parseInt(e.target.value)
    document.getElementById("nxL").innerHTML = nx
})
document.getElementById("ny_grid").addEventListener("input", (e) => {
    ny = parseInt(e.target.value)
    document.getElementById("nyL").innerHTML = ny
})

//var x1=300, y1=100, w1=100, h1=100, ix=350, iy=250, ngridx = 3, ngridy = 3

document.getElementById("goGrid").addEventListener("click", () => {grid()})

function grid(){
    let xb = x1
    //buffer variables not to change original data
    let tx1=x1, ty1=y1

    for (let i = 0; i < ny; i++){
        for (let j = 0; j < nx; j++){
            dm.ct.beginPath()
            dm.ct.rect(tx1, ty1, w1, h1)
            dm.ct.stroke()
            tx1 += (1*offx)+(1*w1)
        }
        ty1 += (1*offy)+(1*h1)
        tx1 = x1
    }
    updateBuffer()

   /* var x = 300, y = 100
    dm.ct.strokeStyle = "grey"
for (let i = 0; i < 3; i++){
    for (let j = 0; j < 3; j++){
        dm.ct.beginPath()
        dm.ct.rect(x, y, 200, 200)
        dm.ct.stroke()
        x += 350 
    }
    y += 250
    x = 300
}*/
}

function rand(from, to){
    let r = Math.floor(Math.random() * (to - from) + from);
    console.log("from: " + from + ", to: " + to + "     rand:" + r)
    return r
}

// DRAWING FUNCTIONS

function setRGB(r, g, b){
    return "rgb(" + r + "," + g + "," + b + ")"
}

function setRGBA(r, g, b, a){
    return "rgb(" + r + "," + g + "," + b + "," + a + ")"
}

function updatePen(){
    if (round){
        dm.ct.lineCap = "round"     
        dm.pr.lineCap = "round"     
    } else {
        dm.ct.lineCap = "butt"
        dm.pr.lineCap = "round"  
    }
    dm.ct.globalAlpha = transi/100
    dm.ct.lineWidth = penwi
    if (drawingMode == NEON){
        dm.ct.strokeStyle = "white"
        dm.ct.shadowBlur = diami
        dm.ct.shadowColor = color1

    } else {
        dm.ct.strokeStyle = color1
        dm.ct.shadowBlur = 0
    }
    if (drawingMode!=PIXELS) dm.ct.fillStyle = color2
    else dm.ct.fillStyle = color1

    if (drawingMode != POLYINPUT && drawingMode!=PIXELS){
        dm.pr.clearRect(0,0,dm.preview.width, dm.preview.height)
    }

    // copy parameters to make a preview tha same as the original
    dm.pr.lineWidth = penwi
    dm.pr.strokeStyle = color1
    dm.pr.fillStyle = color2
    dm.pr.globalAlpha = transi/100
}

var canvasBuffer = []
var uCount = 0

pushToBuffer()

function bufferSizeIsLegal(){
    return canvasBuffer.length < MAX_BUFFER_SIZE
}

function pushToBuffer(){ 
    if (bufferSizeIsLegal()){
        var snapshot = dm.ct.getImageData(0, 0, dm.canvas.width, dm.canvas.height); // adding current canvas snapshot to a buffer
        canvasBuffer.push(snapshot)
    }
}

function undo(){
    if ((canvasBuffer.length > 0) && (uCount < canvasBuffer.length)){
        uCount++
        dm.ct.putImageData(canvasBuffer[canvasBuffer.length-uCount], 0, 0)
    }
}

function redo(){
    if (uCount > 0){
        uCount--
        dm.ct.putImageData(canvasBuffer[canvasBuffer.length-uCount], 0, 0)
    }
}

function updateBuffer(){ // updating the buffer after evry user's action
    if (uCount > 0){
        canvasBuffer.splice(canvasBuffer.length - uCount, uCount)
    }

    uCount = 0 // setting undo counter to 0 as user added something to canvas
    if (!bufferSizeIsLegal())
        canvasBuffer.shift() // erasing the outdated snapshot

    pushToBuffer() //then push
}

function colorFilter(){
    var img = dm.ct.getImageData(0, 0, dm.canvas.width, dm.canvas.height);
    var pixel = img.data;

    for (let i = 0; i < pixel.length; i += 4) {
        pixel[i] = pixel[i]+20
        pixel[i+1] = pixel[i+1]-20
        pixel[i+2] = pixel[i+2]+20
    }
    dm.ct.putImageData(img, 0, 0)
}

function invert(){
    let img = dm.ct.getImageData(0, 0, dm.canvas.width, dm.canvas.height);
    let pixel = img.data;

    for (let i = 0; i < pixel.length; i += 4) {
        pixel[i] = 255 - pixel[i]
        pixel[i+1] = 255 - pixel[i+1]
        pixel[i+2] = 255 - pixel[i+2]
    }
    dm.ct.putImageData(img, 0, 0)
}

function pointsWithinCircle(d, x, y){
    let lx, ly    
    var a = Math.random()
    var b = Math.random()

    if (flat && b < a){
        let temp = a
        a = b
        b = temp
    }
    lx = b*d*Math.cos(2*Math.PI*(a/b))+x
    ly = b*d*Math.sin(2*Math.PI*(a/b))+y

    return [lx, ly]
}

function scatter(x, y){
    var p = []
    for (let i = 0; i < densi; i++) {
        
        p = pointsWithinCircle(diami, x, y)
        dm.ct.beginPath()
        dm.ct.moveTo(p[0], p[1])
        dm.ct.lineTo(p[0], p[1])
        dm.ct.stroke()
    }
}

function circleCoords(centreX, centreY, radius, i, ncuts){
    var ncuts_angle = (360/ncuts)/57
    //if (outer) ncuts_angle += 2*(360/ncuts)/57
    cx = centreX + Math.cos(ncuts_angle*i*2)*radius
    cy = centreY + Math.sin(ncuts_angle*i*2)*radius
    //console.log("X: " + cx + "   Y: " + cy)
}

// MAKE COLOR PALETTE !!

function bridge(prevX, prevY, curX, curY){
    // dm.ct.moveTo(prevX, prevY)
    // dm.ct.lineTo(curX, curY)

    // var i
    // if (pointArray.length >= (point_recentness + 1))
    //     i = pointArray.length - point_recentness - 1
    // else i = 0
    // for (; i < pointArray.length; i++){
    // var dx = pointArray[i][0]-curX
    // var dy = pointArray[i][1]-curY
    // var d = dx * dx + dy * dy;
    //     if (d < connectivity_range*connectivity_range){
    //         dm.ct.moveTo(curX+dx*0.2, curY+dy*0.2)
    //         dm.ct.lineTo(pointArray[i][0]-dx*0.2, pointArray[i][1]+dy*0.2)
    //         dm.ct.stroke();
    //     }
    // }

    //dm.ct.moveTo(prevX, prevY)
    //dm.ct.lineTo(curX, curY)

    var i
    if (dm.pointArray.length >= (point_recentness + 1))
        i = dm.pointArray.length - point_recentness - 1
    else i = 0
    for (; i < dm.pointArray.length; i++){
        dm.ct.globalAlpha = (transi/100)
        dm.ct.beginPath()
        dm.ct.moveTo(prevX, prevY)
        dm.ct.lineTo(curX, curY)
        dm.ct.stroke()

        var dx = dm.pointArray[i][0]-curX
        var dy = dm.pointArray[i][1]-curY
        var d = dx * dx + dy * dy;
        if ((d < connectivity_range*connectivity_range) && (i % bridge_density == 0)){
            dm.ct.globalAlpha = (bridge_transi/100)
            var odx = dx*(line_offset/10)
            var ody = dy*(line_offset/10)
            dm.ct.beginPath()
            //var rgb = extractRGB(color1)
            //dm.ct.strokeStyle = setRGBA(rgb[0], rgb[1], rgb[2], transi*25.5)

            dm.ct.moveTo((curX > dm.pointArray[i][0])?(curX+odx):(curX-odx), (curY > dm.pointArray[i][1])?(curY+ody):(curY-ody))
            dm.ct.lineTo((curX > dm.pointArray[i][0])?(dm.pointArray[i][0]-odx):(dm.pointArray[i][0]+ody), (curY > dm.pointArray[i][1])?(dm.pointArray[i][1]-ody):(dm.pointArray[i][1]+ody))
            dm.ct.stroke();
        }
    }
}

function drawStar(ct, startX, startY, endX, endY, ncuts){
    var curAngle = 0.8
    var centreX = (endX+startX)/2
    var centreY = (endY+startY)/2
    ct.beginPath()

    var r = Math.min(Math.abs(endX-startX), Math.abs(endY-startY))
    console.log(r)
    r = Math.sqrt(r*r)/2
    console.log(r)
    for (let i = 1; i <= ncuts; i++) {
            //ct.beginPath()
            if (i%2==0){
                circleCoords(centreX, centreY, r, i, ncuts*2)
            } else circleCoords(centreX, centreY, r/n, i, ncuts*2)
            
            if (i==1){
                ct.moveTo(cx, cy)
                var sx = cx
                var sy = cy
            }
                
            dct.lineTo(cx, cy)
    }
    ct.lineTo(sx, sy)
    if (contour)
        ct.stroke()
    if (fill_or_no)
        ct.fill()
}
//dm.ct.strokeStyle = "pink"
// test
//drawStar(200, 200, 400, 500, 10)

//----------------------------------------------------------------------EVENT LISTENERS--------
document.getElementById("invert_button").addEventListener("click", () => invert())
// ---------------------------------COLOR CHANGE----------------------
pen_color.addEventListener("input", (event) => {color1 = event.target.value
    updatePen()})
pen_color.addEventListener("change", (event) => {color1 = event.target.value
    updatePen()})
brush_color.addEventListener("input", (event) => {color2 = event.target.value
    updatePen()})
brush_color.addEventListener("change", (event) => {color2 = event.target.value
    updatePen()})

// --------------------DRAWING PARAMETERS CHANGE----------------------

fill_checkbox.addEventListener("change", () => {fill_or_no = !fill_or_no})
document.getElementById("flat").addEventListener("change", () => { flat = !flat})
document.getElementById("contour").addEventListener("change", () => {contour = !contour})
document.getElementById("jitter").addEventListener("change", () => jitter = !jitter)
//var dm.pointArray = [[0, 0]]

function authRect(ct, prevX, prevY, endX, endY){
    //dm.ct.fillStyle = "blue"
    ct.beginPath()
    ct.rect(prevX, prevY, (endX-prevX), (endY-prevY))
    if (fill_or_no) ct.fill()
    if (contour) ct.stroke()
}

function authEll(ct, prevX, prevY, endX, endY){
    ct.beginPath();
    ct.ellipse((endX+prevX)/2, (endY+prevY)/2, Math.abs(endX-prevX)/2, Math.abs(endY-prevY)/2, 0, 0, 2*Math.PI)
    if (fill_or_no)  ct.fill()
    if (contour) ct.stroke();
}

function polyInput(x, y){

    var fi = false
    dm.pr.strokeStyle = color1
    dm.pr.fillStyle = color2
    dm.pr.font = "20pt bold Calibri"
    
    if (polySet.length == 0){
        dm.pr.beginPath()
        dm.pr.moveTo(x, y)
        polySet.push(new Point(x, y))
    } else {
        if ((Math.abs(x-polySet[0].x)<10)&&(Math.abs(y-polySet[0].y)<10)){
            dm.pr.lineTo(polySet[0].x, polySet[0].y)
            dm.pr.stroke()
            //pr.fill()
            //polySet.pop()
            fi = true
        } else {
            polySet.push(new Point(x, y))
        }
        dm.pr.lineTo(x, y)
        dm.pr.stroke()
    }
    
    if (fi){
        triangulate()
        polySet.splice(0, polySet.length)
    } 
    else{
        dm.pr.fillStyle = color1
        dm.pr.fillText((polySet.length).toString(), x, y) 
    }
    //pr.lineTo(polySet[polySet.length-1].x, polySet[polySet.length-1].y)
}

function calibDraw(){
    dm.ct.beginPath()
    dm.ct.moveTo(dm.pointArray[0][0], dm.pointArray[0][1])
    for (let i = 0; i < dm.pointArray.length-2; i++){
        
        var xy0 = midPoint(dm.pointArray[i+1][0], dm.pointArray[i+1][1], dm.pointArray[i+2][0], dm.pointArray[i+2][1])
        var xy = midPoint(dm.pointArray[i+1][0], dm.pointArray[i+1][1], xy0[0], xy0[1])
        //dm.ct.bezierCurveTo(dm.pointArray[i+1][0], dm.pointArray[i+1][1], dm.pointArray[i+2][0], dm.pointArray[i+2][1], dm.pointArray[i+3][0], dm.pointArray[i+3][1])
        dm.ct.quadraticCurveTo(dm.pointArray[i+1][0], dm.pointArray[i+1][1], xy[0], xy[1])
        dm.ct.stroke()
        dm.ct.moveTo( xy[0], xy[1])
    }
}

function midPoint(x1, y1, x2, y2){
    return [(x1+(x2-x1)/2), (y1+(y2-y1)/2)]
}



function stroke(prevX, prevY, curX, curY){
    dm.ct.globalAlpha = transi/100
    var inc_dist = 0
    for (let i = 1; i <= nlines; i++){
        dm.ct.beginPath()
        dm.ct.moveTo(prevX, prevY+inc_dist);
        dm.ct.lineTo(curX, curY+inc_dist);
        dm.ct.stroke();
        inc_dist = linedistance*i
        dm.ct.globalAlpha -= (transi/100)/nlines
    }
}

function drops(prevX, prevY, curX, curY){
    dm.ct.strokeStyle = "rgba(0,0,0,0)"
    dm.ct.globalAlpha = Math.random()
    dm.ct.beginPath()
    //dm.ct.moveTo(prevX, prevY);
    //dm.ct.arc(rand(prevX-jitter_range, prevX+jitter_range), rand(prevY-jitter_range, prevY+jitter_range), Math.random()*diami, 0, 2*Math.PI, true)
    var eh1 = Math.random()*jitter_range*(Math.random()<0.5?(-1):1)
    var eh2 = Math.random()*jitter_range*(Math.random()<0.5?(-1):1)
    dm.ct.arc(prevX+eh1,prevY+eh2, Math.random()*diami, 0, 2*Math.PI, true)
    dm.ct.fill()
    dm.ct.stroke()
    dm.ct.closePath()
}

function distanceBetweenPoints(prevX, prevY, curX, curY){
    var dx = Math.abs(prevX-curX)
    var dy = Math.abs(prevY-curY)
    return Math.sqrt(dx * dx + dy * dy);
}

function angleBetweenPoints(prevX, prevY, curX, curY){
    return Math.atan2(curX - prevX, curY - prevY);
}

function extractRGB(color){
    var R = parseInt(color.substr(1,2), 16)
    var G = parseInt(color.substr(3,2), 16)
    var B = parseInt(color.substr(5,2), 16)
    return [R, G, B]
}

function airbrush(prevX, prevY, curX, curY){
    var x, y

    var dist = distanceBetweenPoints(prevX, prevY, curX, curY)
    var angle = angleBetweenPoints(prevX, prevY, curX, curY)

    dm.ct.globalAlpha = transi/100
    for (let i = 0; i < dist; i+=5){
        x = prevX + Math.sin(angle)*i
        y = prevY + Math.cos(angle)*i

        var brush_airbrush = dm.ct.createRadialGradient(x, y, 1, x, y, penwi)
        var rgb = extractRGB(color1)
        brush_airbrush.addColorStop(0, setRGBA(rgb[0], rgb[1], rgb[2], 0.125))
        brush_airbrush.addColorStop(0.5, setRGBA(rgb[0], rgb[1], rgb[2], 0.0625))
        brush_airbrush.addColorStop(1, setRGBA(rgb[0], rgb[1], rgb[2], 0))
        dm.ct.fillStyle = brush_airbrush
        dm.ct.fillRect(x-penwi, y-penwi, 2*penwi, 2*penwi)
        dm.ct.globalAlpha = transi/100
    }
}

function watermelon(prevX, prevY, curX, curY){

    var red = "rgb(255, 25, 0)"
    var white = "rgb(255, 255, 255)"
    var green = "rgb(66, 189, 0)"

    var centreX = (curX+prevX)/2
    var centreY = (curY+prevY)/2
    var rad = Math.abs(curY-prevY)/2

    dm.ct.strokeStyle = "rgba(0,0,0,0)"
    dm.ct.lineWidth = 1
    dm.ct.beginPath()
    dm.ct.fillStyle = green
    dm.ct.arc(centreX, centreY, rad, 0, Math.PI)
    dm.ct.fill()
    dm.ct.beginPath()

    dm.ct.fillStyle = white
    dm.ct.arc(centreX, centreY, rad*0.9, 0, Math.PI)
    dm.ct.fill()
    dm.ct.beginPath()

    dm.ct.fillStyle = red
    dm.ct.arc(centreX, centreY, rad*0.8, 0, Math.PI)
    var redgr = dm.ct.createRadialGradient(centreX, centreY, 1, centreX, centreY, rad)
    redgr.addColorStop(0.2, "rgb(255, 25, 0)")
    redgr.addColorStop(0.9, "rgb(255, 255, 255)")
    dm.ct.fillStyle = redgr
    dm.ct.fill()
    dm.ct.stroke()
    var seed = []
    dm.ct.strokeStyle = "rgba(62,43,30,255)"
    dm.ct.beginPath()
    for (let i = 0; i < 20; i++){
        seed = pointsWithinCircle(rad*0.8, centreX, centreY)
        if (seed[1] >= centreY)
            drawStar(seed[0], seed[1], seed[0]+jitter_range*Math.random(), seed[1]+jitter_range*Math.random(), ncuts*2)
    }
}

function isCanvas(x){
    //var val = document.getElementById("sideBar").style.width
    return ((x > sideBarWidth)||(!sbopen))
}

document.getElementById("close_button").addEventListener("click", () => {
    document.getElementById("menu_button").style.opacity = "1";
    sbopen = false
    document.getElementById("sideBar").style.width = "0";
})
document.getElementById("menu_button").addEventListener("click", () => {
    document.getElementById("menu_button").style.opacity = "0";    
    sbopen = true
    document.getElementById("sideBar").style.width = sideBarWidth + "px";
})

document.getElementById("palette_button").addEventListener("click", () =>{document.getElementById("paletteBar").style.width = sideBarWidth + "px"; sbopen = true})
document.getElementById("closePalette").addEventListener("click", () => {document.getElementById("paletteBar").style.width = "0"; sbopen = false})

var palette = document.querySelectorAll(".palette")
palette = Array.from(palette)
palette.forEach(palette_color => {
    palette_color.addEventListener("click", () => {
        color1 = palette_color.dataset.palette
        pen_color.value = palette_color.dataset.palette
    })    
})

document.getElementById("settings_button").addEventListener("click", () => {document.getElementById("settingsBar").style.width = sideBarWidth + "px"; sbopen = true})
document.getElementById("close_settings").addEventListener("click", () => {document.getElementById("settingsBar").style.width = "0"; sbopen = false})

var canvasTemplate = "<div id=\"main\"><canvas id=\"" +  + "\"></canvas></div>"
var layerListTemplate = "<div class=\"layer-preview\" id=\"" +  + "\"></div>"

// SETTINGS HANDLING
/*
var IDs = ["0"]
var curlayer = 0

//LAYER HANDLING
document.getElementById("add-layer").addEventListener("click", ()=>{
    var id = parseInt(IDs[IDs.length-1])
    id++
    IDs.push(id.toString())
    document.getElementById("layers").innerHTML += "<div id=\"main\"><canvas id=\"" + id + "\"></canvas></div>"
    document.getElementById("layer-list").innerHTML += "<div class=\"layer-preview\" data-id=\"" + id + "\">" + id + "</div>"
})

var layerList = document.querySelectorAll(".layer-list")
layerList = Array.from(layerList)
layerList.forEach(layerID => {
    layerID.addEventListener("click", () => {
        var curlayer = parseInt(layerID.dataset.layerList)
    })    
})
*/
// transform drawing tools to objects

let isShown = true;
document.getElementById("showBrushes").addEventListener("click", ()=>{
    if (isShown==true){
        document.getElementById("tools-container").style.height = "0";
        document.getElementById("tools-container").style.opacity = "0"
        isShown=false
    }
    else {
        document.getElementById("tools-container").style.height = "auto";
        document.getElementById("tools-container").style.opacity = "1"
        isShown=true
    }

    document.getElementById("showBrushes").style.transform = 'rotate(180deg);'
})

//ADD CUSTOM USER PALETTE

//<div class="palette" data-palette="#A31919" style="background-color: #A31919;"></div>

document.getElementById("add_to_palette").addEventListener("click", ()=>{
    document.getElementById("custom_palette").innerHTML+= "<div class=\"palette\" data-palette=\"" + color1 + "\" style=\"background-color: " + color1 + ";\"></div>"
    
    var paletteCustom = document.querySelectorAll(".palette")
    paletteCustom = Array.from(paletteCustom)
    paletteCustom.forEach(palette_color => {
    palette_color.addEventListener("click", () => {
        color1 = palette_color.dataset.palette
        pen_color.value = palette_color.dataset.palette
    })    
})

    //тепер додаємо евент лістенер до новоствореного елемента
    //не працює якогось фіга
})

window.addEventListener("beforeunload", ()=>{
    if (!saved)
    if (confirm("You have unsaved changes. Do you wish to save the project?"))
        document.getElementById("save-to-db").click()
        return ""
})

////ДОДАТИ ІМПОРТ ЗОБРАЖЕНЬ

var imageData;
document.getElementById('myFile').onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

    // FileReader support
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = () => showImage(fr);
        fr.readAsDataURL(files[0]);
    }
}

var imgsx = 0
var imgsy = 0

function showImage(fileReader) {
    var img = document.getElementById("myImage");
    img.onload = () => getImageData(img);
    img.src = fileReader.result;
}

function getImageData(img) {
    imgsx = parseInt(document.getElementById("ix").value)
    imgsy = parseInt(document.getElementById("iy").value)
    //dm.ct.filter = "brightness(30%)"
    dm.ct.drawImage(img, imgsx, imgsy);
    //dm.ct.drawImage(img, 0, 0);
    var imageData = dm.ct.getImageData(0, 0, img.width, img.height).data;
    console.log("image data:", imageData);

    //gaussianBlur(imageData, img)
}
/*
function gaussianBlur(imageData, imge){
    var buff = imageData;
    var enumx = 0, enumy = 0;
    /*
    for (let i = 100; i < img.height-100; i++){
        for (let j = 100 ; j < img.width-100; j++){
            let sum = 0;
            for (let k = 0; k < 3; k++) {sum += buff[i-1][k] + buff[i+1][k];}
            sum += buff[i][j+1] + buff[i][j-1];
            
            buff[i][j] = (buff[i][j]+sum)/9;
        }
    }dm.ct.putImageData(buff, canvas.width, canvas.height)
*/
/*
    let pixel = imageData;

    for (let i = 0; i < pixel.length; i += 4) {
        pixel[i] = 255 - pixel[i]
        pixel[i+1] = 255 - pixel[i+1]
        pixel[i+2] = 255 - pixel[i+2]
    }
    dm.ct.drawImage(pixel, 0, 0)

}*/

/* CANVAS FILTERING */

document.getElementById("filter_button").addEventListener("click", () => {
    document.getElementById("filterBar").style.width = sideBarWidth + "px"
})
document.getElementById("closeFilters").addEventListener("click", () => {
    document.getElementById("filterBar").style.width = "0"
})


// initialize the inputs
const filterButtons = ["brightness", "contrast", "saturation", "hue", "blur", "grayscale", "sepia", "opacity"
]
const filterNames = ["brightness", "contrast", "saturate", "hue-rotate", "blur", "grayscale", "sepia", "opacity"
]


/*
const drawingModes = [DRAW,RECT,SCATTER,ELLIPSE,NEON,STAR,
    //FILL,
    BRIDGE,AIRBRUSH,DROPS,STROKES,WATERMELON,PIXELS
]*/

/* ARRAY OF FILTER VALUES */
var filterValues = [100,100,100,0,0,0,0,100] //Array(8).fill(0)

for (let i = 0; i < filterButtons.length; i++){
    document.getElementById(filterButtons[i]).addEventListener("change", ()=>{
        filterValues[i] = document.getElementById(filterButtons[i]).value
        applyFilters()

        let can = dm.ct.getImageData(0, 0, dm.canvas.width, dm.canvas.height);
        dm.ct.putImageData(can, 0, 0)
    })
    document.getElementById(filterButtons[i]).addEventListener("input", ()=>{
        document.getElementById(filterButtons[i] + "-label").innerHTML = document.getElementById(filterButtons[i]).value
    })
}

/* LAYER REFRESHING */

function applyFilters(){

}