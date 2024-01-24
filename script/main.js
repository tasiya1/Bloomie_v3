
// DRAWING STATUSES
let is_drawing = false
let fill_or_no = false
let flat = false
let contour = true
let jitter = false
let round = true

// VALUES
let prevX = null //let vs let
let prevY = null

let color1 = "#000000"
let color2 = "#f9f8f5"

let r, g, b
let penwi = 5
let polySet = []

sideBarWidth = 250

function dgid(id){
    return document.getElementById(id)
}

function dcel(tag, parent){
    let el = document.createElement(tag)
    parent.appendChild(el)
    return el
}

function setRGB(r, g, b){
    return `rgb(${r},${g},${b})`
}

function setRGBA(r, g, b, a){
    return `rgba(${r},${g},${b},${a})`
}

function setHexRGBA(color, a){
    let c = extractRGB(color)
    return `rgba(${c.r},${c.g},${c.b},${a})`

}

function getHSL(r, g, b){
    let hue = 0
    let max = Math.max(r, g, b)
    let min = Math.min(r, g, b)
    let amplisuda = max - min

    if (max == r) hue = (g - b) / amplisuda
    else if (max == g) hue = 2.0 + (b - r) / amplisuda
    else hue = 4.0 + (r - g) / amplisuda
    hue *= 60

    if (hue < 0) {
        hue += 360;
        if (hue < 0)
        console.warn("color is weird...")
    }

    let sum = max + min;

    let lightness = sum / 2

    if (amplisuda === 0) {
        return { h: 0, s: 0, l: lightness }
    }

    let saturation = amplisuda / (1 - Math.abs(2 * lightness - 1))

    return {h: hue, s: saturation * 100, l: lightness}
}

function extractRGB(color){
    var R = parseInt(color.substr(1,2), 16)
    var G = parseInt(color.substr(3,2), 16)
    var B = parseInt(color.substr(5,2), 16)

    return {r: R, g: G, b: B}
}


class DrawingTool {
    constructor (dm, title){
        this.dm = dm
        //this.onDraw = onDrawFunction
        this.width = 5
        this.color = "#000000"
        this.minorColor = "#ffffff"
        this.title = title
        this.setToolUI(this.title)
        this.setIputUI()
    }

    onDown() {}

    onDraw(){}

    onUp() {}

    afterSelf() {
        this.dm.pr.clearRect(0, 0, this.dm.preview.width, this.dm.preview.height);
    }

    updateTool(){
        this.dm.ct.globalAlpha = 1
        this.dm.ct.strokeStyle = this.color = this.dm.primarColor
        this.dm.ct.lineWidth = this.width
    }

    dynamicDraw(){

    }

    setStartingHue(){
        let clr = extractRGB(this.color)
        this.hsl = getHSL(clr.r, clr.g, clr.b)
        this.hue = this.hsl.h
        let max = this.hue + 10
        let min = this.hue - 10
        if (max > 255) max = max - 255
        if (min < 0) min = 255 + min
        this.hueMax = max
        this.hueMin = min
    }

    setToolUI(title) {
        let container = dgid("tools-container")
        let tool = document.createElement("div")
        tool.classList.add("tool")
        tool.id = title + "-button"
        tool.dataset.name = title
        tool.innerHTML += `<div class="tool-body">
        <div title="`+ title +`"><img src="icons/` + title.toLowerCase() +`.png" class="icon"></div>
        <p>` + title +`</p>
        </div><div class="tool-additional"></div>`
        container.appendChild(tool)

        tool.addEventListener("click", (ev) => {
            if (ev.target.parentNode.className !== "tool-additional"){
                //if (this.dm.currentTool != this) this.dm.currentTool.afterSelf()
                this.dm.currentTool = this
                document.querySelector(".selected-tool").classList.remove("selected-tool")
                this.dm.selectedButton = tool
                this.dm.selectedButton.classList.add("selected-tool")
                this.setIputUI()

            }
        })
    }

    setIputUI() {
        /*
        let c = document.createElement("div")
        //c.style.display = "none"
        let ws = document.createElement('input'); ws.type='range'; ws.id=this.title+'-width'; ws.min='0'; ws.max='200'; ws.value=this.width.toString();
        let l = document.createElement("label")
        l.for = ws.id; l.innerText = ws.value
        ws.append(l)
        c.appendChild(ws)
        dgid("tools-properties").appendChild(c)
        */
    }
}

class Pen extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.prevTime = 0
        this.title = "Pen"

        dgid(this.title + "-button").classList.add("selected-tool")
    }

    onDraw() {
        this.dm.ct.beginPath();   
        this.dm.ct.moveTo(this.dm.prevX, this.dm.prevY)
        this.dm.ct.lineTo(this.dm.curX, this.dm.curY)
        this.dm.ct.stroke(); 
    }

}

class Scatter extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.dotSize = 2
        this.density = 10
        this.splashDiameter = 70
        this.mean = 10
        this.isFlat = true
    }

    updateTool(){
        this.dm.ct.lineWidth = this.dotSize
        this.dm.ct.strokeStyle = this.color = this.dm.primarColor
    }

    onDraw() {
        var p = []
        for (let i = 0; i < this.splashDiameter; i++) {
            if (this.isFlat)
                p = this.dm.pointsWithinCircle(this.splashDiameter, this.dm.curX, this.dm.curY, this.isFlat)
            else p = this.dm.gaussianDistribution(this.mean, this.splashDiameter)
            //p.x = this.dm.curX - (Math.random()>0.5?p.x:-p.x)
            //p.y = this.dm.curY - (Math.random()>0.5?p.y:-p.y)
            this.dm.ct.beginPath()
            this.dm.ct.moveTo(p.x, p.y)
            this.dm.ct.lineTo(p.x, p.y)
            this.dm.ct.stroke()
        }
    }
}

class Eraser extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
    }

    onDraw() {
        let pathPoints = this.dm.generatePathPoints(5)
        for (let p of pathPoints){
            //this.dm.ct.clearRect(p.x-this.width, p.y-this.width, 2*this.width, 2*this.width)
            this.dm.ct.globalCompositeOperation = "destination-out"
            this.dm.ct.beginPath()
            this.dm.ct.arc(p.x, p.y, this.width, 0, 2 * Math.PI)
            this.dm.ct.fill()
            //this.dm.ct.fillStyle = "rgba(255, 255, 255, 0.1)"
        }

        this.dm.ct.globalCompositeOperation = "source-over"
        this.dm.ct.fillStyle = this.minorColor
    }
}

class Bridge extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.width = 0.5
        this.connectivity_range = 300
        this.bridge_density = 2
        this.lineOpacity = 0.9
        this.bridgesOpacity = 0.4
        this.line_offset = 0
        this.point_recentness = 20
    }

    onDraw() {
        let i
        if (this.dm.pointArray.length >= (this.point_recentness + 1))
            i = this.dm.pointArray.length - this.point_recentness - 1
        else i = 0
        for (; i < this.dm.pointArray.length; i++){
            this.dm.ct.strokeStyle = setHexRGBA(this.color, this.lineOpacity)
            this.dm.ct.beginPath()
            this.dm.ct.moveTo(this.dm.prevX, this.dm.prevY)
            this.dm.ct.lineTo(this.dm.curX, this.dm.curY)
            this.dm.ct.stroke()
            this.dm.ct.closePath()
    
            let dx = this.dm.pointArray[i][0]-this.dm.curX
            let dy = this.dm.pointArray[i][1]-this.dm.curY
            let d = dx * dx + dy * dy;
            if ((d < this.connectivity_range*this.connectivity_range) && (i % this.bridge_density == 0)){
                this.dm.ct.strokeStyle = setHexRGBA(this.color, this.bridgesOpacity)
                let odx = dx*(this.line_offset/10)
                let ody = dy*(this.line_offset/10)
                this.dm.ct.beginPath()
                this.dm.ct.moveTo((this.dm.curX > this.dm.pointArray[i][0])?(this.dm.curX+odx):(this.dm.curX-odx), (this.dm.curY > this.dm.pointArray[i][1])?(this.dm.curY+ody):(this.dm.curY-ody))
                this.dm.ct.lineTo((this.dm.curX > this.dm.pointArray[i][0])?(this.dm.pointArray[i][0]-odx):(this.dm.pointArray[i][0]+ody), (this.dm.curY > this.dm.pointArray[i][1])?(this.dm.pointArray[i][1]-ody):(this.dm.pointArray[i][1]+ody))
                this.dm.ct.stroke();
                this.dm.ct.closePath()
            }
        } 
    }

}

class Airbrush extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.width = 30
    }

    onDraw() {
        let x, y

        let dist = this.distanceBetweenPoints(this.dm.prevX, this.dm.prevY, this.dm.curX, this.dm.curY)
        let angle = this.angleBetweenPoints(this.dm.prevX, this.dm.prevY, this.dm.curX, this.dm.curY)
    
        for (let i = 0; i < dist; i+=5){
            x = this.dm.prevX + Math.sin(angle)*i
            y = this.dm.prevY + Math.cos(angle)*i
    
            let brush_airbrush = dm.ct.createRadialGradient(x, y, 1, x, y, this.width)
            brush_airbrush.addColorStop(0, setHexRGBA(this.color, 0.125))
            brush_airbrush.addColorStop(0.5, setHexRGBA(this.color, 0.0625))
            brush_airbrush.addColorStop(1, setHexRGBA(this.color, 0))
            this.dm.ct.fillStyle = brush_airbrush
            this.dm.ct.fillRect(x-this.width, y-this.width, 2*this.width, 2*this.width)
        }
    }

    distanceBetweenPoints(prevX, prevY, curX, curY){
        let dx = Math.abs(prevX-curX)
        let dy = Math.abs(prevY-curY)
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    angleBetweenPoints(prevX, prevY, curX, curY){
        return Math.atan2(curX - prevX, curY - prevY);
    }

    updateTool(){
        this.color = this.dm.primarColor
        this.dm.ct.strokeStyle = "rgba(0,0,0,0)"
        this.dm.ct.lineWidth = this.width
    }
}

class Drops extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.size = 10
        this.transparency = 0.5
        this.opacity_jitter = 0.5
        this.jitter_range = 30
        this.density = 3

        //this.dm.ct.fillStyle = setRGB(0,0,0)//"black"
    }

    onDraw() {
        let opacity = this.opacity_jitter * Math.random()
        for (let i = 0; i < this.density; i++){
            opacity = 1 - this.opacity_jitter + this.opacity_jitter * Math.random() 
            this.dm.ct.fillStyle = setHexRGBA(this.color, opacity)//setRGBA(rgb[0], rgb[1], rgb[2], opacity)
            this.dm.ct.beginPath()
            let eh1 = Math.random()*this.jitter_range*(Math.random()<0.5?(-1):1)
            let eh2 = Math.random()*this.jitter_range*(Math.random()<0.5?(-1):1)
            this.dm.ct.arc(this.dm.prevX+eh1,this.dm.prevY+eh2, Math.random()*this.size, 0, 2*Math.PI, true)
            this.dm.ct.fill()
            this.dm.ct.stroke()
            this.dm.ct.closePath()
        }  
    }

    updateTool(){
        this.dm.ct.strokeStyle = "rgba(0,0,0,0)"
        this.color = this.dm.primarColor
        this.dm.ct.fillStyle = setHexRGBA(this.color, this.transparency)
    }
}

class Strokes extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.linedistance = 5
        this.nlines = 5
        this.width = 1
    }

    onDraw() {
        this.dm.ct.strokeStyle = this.color
        var inc_dist = 0
        let transparency = 1
        for (let i = 1; i <= this.nlines; i++){
            this.dm.ct.beginPath()
            this.dm.ct.moveTo(this.dm.prevX, this.dm.prevY+inc_dist);
            this.dm.ct.lineTo(this.dm.curX, this.dm.curY+inc_dist);
            this.dm.ct.stroke();
            inc_dist = this.linedistance*i
            this.dm.ct.strokeStyle = setHexRGBA(this.color, transparency)
            transparency -= 1/this.nlines
        }
    }
    
    updateTool(){
        this.dm.ct.strokeStyle = this.color = this.dm.primarColor
        this.dm.ct.lineWidth = this.width
    }
}

class Pixels extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
    }

    onDraw() {
    }
}

class Waterbrush extends DrawingTool {
    constructor(dm, title) {
        super(dm, title)
        this.width = 20

        this.wetness = 5
        this.jitter = 5
        this.density = 5
        this.leakingThreshold = 0.2
    }

    onDraw(){
        this.dm.ct.beginPath();   
        this.dm.ct.moveTo(this.dm.prevX, this.dm.prevY)
        this.dm.ct.lineTo(this.dm.curX, this.dm.curY)
        this.dm.ct.stroke();
        this.dm.ct.closePath()

        let p = this.dm.generatePathPoints(1)

        if (this.dm.distanceBetweenPoints() > this.density)
            if (this.leakingThreshold < Math.random()){
                let leakagePoint = p[Math.floor(Math.random() * p.length)]
                console.log(leakagePoint)
                new Leak(this, leakagePoint.x, leakagePoint.y)
            }

    }

    updateTool(){
        this.dm.ct.lineWidth = this.width
        this.dm.ct.strokeStyle = this.color = this.dm.primarColor
    }
}

class Leak {
    constructor(wb, x, y){
        this.wb = wb
        this.x = x
        this.lastY = y
        this.y = y
        this.surfaceRoughness = 5
        this.color = this.wb.color
        this.width = this.wb.width * Math.random()
        this.timeOffset = 200 * Math.random() //ms
        this.distanceInterval = 10 //px 
        this.timeInterval = 100 //ms
        this.lastsFor = 3000 * Math.random() //ms
        this.isRunning = false
        this.intervalId = null

        this.startRunning()
    }

    startRunning() {
        setTimeout(() => {
            this.isRunning = true;
            this.intervalId = setInterval(() => this.run(), this.timeInterval)
    
            setTimeout(() => {
                this.stopRunning();
            }, this.lastsFor);
        }, this.timeOffset);
    }

    run(){
        dm.ct.strokeStyle = this.color
        dm.ct.beginPath()
        this.width *= Math.exp(-0.1)
        dm.ct.lineWidth = this.width
        dm.ct.moveTo(this.x, this.lastY)
        this.lastY += this.distanceInterval * Math.random()
        this.x += (Math.random()-0.5) * this.surfaceRoughness
        dm.ct.lineTo(this.x, this.lastY)
        dm.ct.stroke()
        dm.ct.closePath()
        dm.ct.lineWidth = this.wb.width
        dm.ct.strokeStyle = dm.currentTool.color //віддаємо контексту його попередній колір, шоб фарби ну, не тойво
    }

    stopRunning(){
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.intervalId)
        }
    }
}

class ClipTool extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.detailedUI()
        this.path = new Path2D();
    }

    onDown(){
        //this.dm.ct.save()
    }

    onDraw() {
        //this.dm.pr.beginPath()
        this.path.lineTo(this.dm.curX, this.dm.curY);
        //this.dm.pr.stroke(this.path);
        //this.dm.pr.closePath()
        this.dm.pr.beginPath()
        this.dm.pr.ellipse(this.dm.curX, this.dm.curY, 2, 2, 0, 0, 2 * Math.PI)
        this.dm.pr.fill()
        this.dm.pr.closePath()
        if (Date.now() % 2 == 0)
            this.dm.pr.fillStyle = "#000000"
        else this.dm.pr.fillStyle = "#FFFFFF"
    }

    onUp() {
        this.dm.ct.clip(this.path);
        this.dm.currentTool = this.dm.drawingTools["Pen"];
        this.dm.ct.strokeStyle = this.color;
        this.path = new Path2D(); // Очищення шляху
    }

    updateTool() {
        this.dm.ct.strokeStyle = this.color;
        this.dm.pr.strokeStyle = "#FFFFFF" //setRGB(255, 0, 0);
    }

    detailedUI(){
        let b = dgid(this.title + "-button").querySelector(".tool-additional")
        b.innerHTML += `<p id="reset-clip" style="    position: absolute;
        right: 0px;
        top: 50%;
        transform: translateY(-50%);
        background-color: #555555;
        padding: 5px;
        z-index: 10;">Reset</p>`
        dgid("reset-clip").addEventListener("click", () => {
            this.dm.pr.clearRect(0, 0, this.dm.preview.width, this.dm.preview.height);
            this.dm.clearSelectionArea()
        })
    }
}

class Layer{
    constructor(order, activeLayer){
        this.order = order
        
        this.canvas = document.createElement("canvas")
        this.canvas.id = order
        this.canvas.style.opacity = "1"
        if (activeLayer != null)
            activeLayer.insertAdjacentElement("afterend", this.canvas)
        else dgid("layers").insertBefore(this.canvas, dgid("preview"));
        this.canvas.width = window.innerWidth - 400
        this.canvas.height = window.innerHeight - 200

        this.ct = this.canvas.getContext("2d", {willReadFrequently:true})
    }
}

class DrawingMachine {
    constructor(){
        this.baseId = Date.now()
        let bg =  dcel("canvas", dgid("layers"))
        bg.classList = "canvas-background"
        bg.style.position = "absolute"
        bg.style.zIndex = 5

        let w = window.innerWidth - 400
        let h = window.innerHeight - 200
        bg.width = w
        bg.height = h

        dgid('layers').innerHTML += `<canvas id="` + this.baseId +`" "></canvas>
        <canvas id="preview"></canvas>`

        this.canvas = dgid(this.baseId)
        this.preview = dgid("preview")

        this.currentTool = null
        this.currentLayerId = this.baseId
        this.canvas.style.zIndex = 10
        this.preview.style.zIndex = 120
        this.selectedButton = null
        this.drawingTools = []
        this.drawingMode = null
        this.prevX = this.prevY = this.curX = this.curY = 0
        this.transi = 50
        this.primarColor = "#000000"
        this.minorColor = "#ffffff"

        this.colorChanging = true//false
        this.colorVectorInc = true
        this.is_drawing = false
        this.sortable = null

        this.canvas.height = h
        this.canvas.width = w
        this.canvas.style.opacity = "1"

        this.preview.height = h
        this.preview.width = w

        var groundRect = this.canvas.getBoundingClientRect();
        this.marginX = groundRect.left + window.scrollX;
        this.marginY = groundRect.top + window.scrollY;

        this.ct = this.canvas.getContext("2d", { willReadFrequently: true });
        this.pr = this.preview.getContext("2d");
        this.ct.save()

        this.layers = {layer1: {id:this.baseId, canvas: this.canvas, ct: this.ct}}
        this.pointArray = []

        this.addLayerButton({order: this.baseId, zIndex: 10, canvas: this.canvas, ct: this.ct})

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.initGUI()
    }

    initGUI(){
        this.initCanvas();
        this.initDrawingTools()
        this.initToolButtons()
        this.initCustomPalette()
        this.initDownloader()
    }

    initCanvas(){
        /*
        let x = parseInt(dgid("size-x").value);
        let y = parseInt(dgid("size-y").value);

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
        //this.ct.fillRect(0, 0, window.innerWidth, window.innerHeight);

        dgid("canvas-size-window").style.visibility = "hidden";

        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);

        window.addEventListener("touchstart", this.onTouchStart);
        window.addEventListener("touchmove", this.onTouchMove, { passive: false });
        window.addEventListener("touchend", this.onTouchEnd);

        this.ct.lineWidth = 1;
        this.ct.lineCap = "round";
        this.ct.lineJoin = "miter";
        this.ct.strokeStyle = color1;
        this.ct.fillStyle = color2;
        this.pr.lineJoin = "miter";

        window.addEventListener('resize', () => {this.refreshCanvasPosition()});
    }

    clearSelectionArea(){
        this.ct.restore()
        this.ct.resetTransform()
        this.ct.save()
    }

    refreshCanvasPosition(){
        var groundRect = this.canvas.getBoundingClientRect();
        this.marginX = groundRect.left + window.scrollX;
        this.marginY = groundRect.top + window.scrollY;
    }

    onTouchStart(ev){ this.toolDown(ev.touches[0]) }
    onTouchMove(ev){ ev.preventDefault(); this.toolOn(ev.touches[0]) }
    onTouchEnd(ev){ this.toolUp(ev.touches[0]) }

    onMouseDown(ev){ this.toolDown(ev) }
    onMouseMove(ev){ this.toolOn(ev) }
    onMouseUp(ev){ this.toolUp(ev) }

    toolDown(ev){

        if (ev.target.nodeName.toLowerCase() === 'canvas')
            this.is_drawing = true
        //updatePen()
        this.ct.lineCap = "round"
        this.ct.globalAlpha = 1
        this.ct.strokeStyle = this.primarColor
        this.currentTool.updateTool()
        this.currentTool.setStartingHue()
        this.ct.beginPath() // to prevent changing the properties of finished objects
        this.pr.beginPath()

        this.pointArray.splice(0, this.pointArray.length)

        this.prevX = ev.clientX - this.marginX
        this.prevY = ev.clientY - this.marginY
    }

    toolOn(ev){

        if (this.is_drawing && ev.target.nodeName.toLowerCase() != 'canvas')
            this.closeSidebar()

        this.curX = ev.clientX - this.marginX
        this.curY = ev.clientY - this.marginY
    
        this.pointArray.push([this.curX, this.curY])

        if (this.prevX == null || this.prevY == null){
            this.prevX = ev.clientX
            this.prevY = ev.clientY
            //return
        }
    
        if (this.is_drawing){
            //this.currentTool.dynamicDraw();
            this.currentTool.onDraw(ev);
        }

        this.prevX = this.curX
        this.prevY = this.curY
    }

    toolUp(ev){
        this.is_drawing = false
        this.endX = ev.clientX
        this.endY = ev.clientY
        //this.ct.closePath()
        //this.pr.closePath()
        this.currentTool.onUp()
        dgid("thumbnail-" + this.currentLayerId).src = this.canvas.toDataURL()
    }

    initDrawingTools(){
        this.drawingTools = {
            'Pen': new Pen(this, "Pen"),
            'Bridge': new Bridge(this, "Bridge"),
            'Scatter': new Scatter(this, "Scatter"),
            'Eraser': new Eraser(this, "Eraser"),
            'Airbrush': new Airbrush(this, "Airbrush"),
            'Drops': new Drops(this, "Drops"),
            'Strokes': new Strokes(this, "Strokes"),
            'Pixels': new Pixels(this, "Pixels"),
            'Waterbrush': new Waterbrush(this, "Waterbrush"),
            'Clip': new ClipTool(this, "Clip")
        }

        this.currentTool = this.drawingTools["Pen"]
        this.selectedButton = dgid("Pen-button")
    }

    initToolButtons(){
        //clear button
        dgid("clear").addEventListener("click", ()=> {
            this.ct.clearRect(0, 0, this.canvas.width, this.canvas.height)
        })
        //primary color button
        dgid("color-1").addEventListener("input", (event) => {this.primarColor = event.target.value})
        //minor color button
        dgid("color-2").addEventListener("input", (event) => {this.minorColor = event.target.value})
        //color palettes
        dgid("palette_button").addEventListener("click", () =>{dgid("paletteBar").style.width = sideBarWidth + "px";})
        dgid("closePalette").addEventListener("click", () => {dgid("paletteBar").style.width = "0";})

        //key reader
        document.body.addEventListener('keydown', (ev) => {this.manageKeys(ev)});
        dgid("showBrushes").addEventListener("click", ()=>{this.switchFoldingOfElement("tools-section")})

        //layer management
        dgid("add-layer").addEventListener("click", () => {this.addNewLayer()})
        this.sortable = new Sortable(dgid("layer-list"), {/* handle: ".drag-button", */animation: 350, chosenClass: "layer-chosen", dragClass: "layer-drag",
        swapThreshold: 1, direction: 'vertical', reversed: false, onUpdate: this.supportLayerOrder})

        dgid("layers-icon").onclick = () => {this.switchFoldingOfElement("layer-bar")}

    }

    switchFoldingOfElement(id){
        dgid(id).classList.contains("folded")?
            dgid(id).classList.remove("folded")  :
            dgid(id).classList.add("folded")
    }

    supportLayerOrder(ev){
        let updatedLayers = null
        if (ev != null) updatedLayers =  Array.from(ev.from.children);
        else updatedLayers = Array.from(dgid("layer-list").children)
        //updatedLayers.shift()
        //updatedLayers.pop()

        for (let i = 0; i < updatedLayers.length; i++){
            let l = updatedLayers[i]
            dgid(l.dataset.id).style.zIndex = i + 10
        }
        console.log("Updated layers:", updatedLayers);
    
    }

    initCustomPalette(){
        dgid("add_to_palette").addEventListener("click", ()=>{
            dgid("custom_palette").innerHTML+= "<div class=\"palette\" data-palette=\"" + this.primarColor + "\" style=\"background-color: " + this.primarColor + ";\"></div>"
            
            let paletteCustom = document.querySelectorAll(".palette")
            paletteCustom = Array.from(paletteCustom)

            paletteCustom.forEach(palette_color => {
            palette_color.addEventListener("click", () => {
                this.primarColor = palette_color.dataset.palette
                dgid("color-1").value = palette_color.dataset.palette
            })    
        })
        })
    }

    initDownloader(){   
        dgid("save").addEventListener("click", () => {
            let canvas_image = document.createElement("a")
            canvas_image.href = this.renderImage()//this.canvas.toDataURL("imag/jpg")
            canvas_image.download = "My Blooming sketch"
            canvas_image.click()
        })
    }

    manageKeys(e){
        if (e.key == "Escape") {this.closeSidebar()}

        if (e.key == "m") {this.openMenu()}
        if (e.key == "p") {this.openPaletteBar()}
        if (e.key == "s") {this.openSettingsBar()}
        if (e.key == "l") {this.switchFoldingOfElement("layer-bar")}
    }

    openMenu(){dgid("sideBar").style.width = sideBarWidth + "px"}
    openPaletteBar(){dgid("paletteBar").style.width = sideBarWidth + "px"}
    openSettingsBar(){dgid("settingsBar").style.width = sideBarWidth + "px"}
    closeSidebar(){document.querySelectorAll(".nav").forEach(element => {element.style.width = "0"})}


    getCurrentTool(){
        //this.drawingMode
    }

    setCurrentTool(title){

    }

    addNewLayer(){
        let l = new Layer(Date.now().toString(), this.canvas)
        //l.canvas.style.opacity = "1"
        l.canvas.width = this.canvas.width; l.canvas.height = this.canvas.height
        this.ct = l.canvas.getContext("2d", { willReadFrequently: true })
        
        this.canvas = l.canvas
        this.ct = this.canvas.getContext("2d")
        this.addLayerButton(l)

    }

    addLayerButton(l){
        let thumbnail = this.canvas.toDataURL();
        let layerInfo = document.createElement("li")

        let left = document.createElement("div"); left.classList = "left"
        let right = document.createElement("div"); right.classList = "right"

        let vmist = document.createElement("textarea")
        vmist.classList = "layer-title"
        if (dgid("layer-" + this.currentLayerId) != null)
            dgid("layer-" + this.currentLayerId).classList.remove("selected")

        layerInfo.classList = "layer-button"
        vmist.value = "layer-" + l.order

        let zIndex = parseInt(this.canvas.style.zIndex)

        layerInfo.dataset.id = l.order
        layerInfo.id = "layer-" + l.order
        layerInfo.dataset.zIndex = l.zIndex
        vmist.dataset.id = l.order
        this.layers[l.order] = {id: l.order, zIndex: 0, canvas: l.canvas, ct: l.ct}
        this.layers[l.order].canvas.style.zIndex = l.zIndex

        this.canvas = this.layers[l.order].canvas
        this.canvas.style.zIndex = l.zIndex
        this.ct = this.layers[l.order].ct
        let th = document.createElement("img")
        th.classList = "layer-thumbnail"
        th.src = thumbnail
        th.id = "thumbnail-" + l.order

        left.appendChild(th)
        left.appendChild(vmist)
        layerInfo.appendChild(left)
        layerInfo.appendChild(right)

        if (dgid("layer-" + this.currentLayerId) != null)
            dgid("layer-" + this.currentLayerId).insertAdjacentElement("afterend", layerInfo)
        else dgid("layer-list").appendChild(layerInfo)

        let rembo = this.createButton(right, "delete", l.order, 20, 20)
        rembo.classList.add("delete-button")
        rembo.addEventListener("click", (ev) => {
            dgid(rembo.dataset.id).remove()
            dgid("layer-" + rembo.dataset.id).remove()
        })

        let visi = this.createButton(right, "visibility", l.order, 20, 20)
        visi.addEventListener("click", () => {
            if (parseInt(dgid(visi.dataset.id).style.opacity) == 1){
                dgid(visi.dataset.id).style.opacity = "0"
                visi.querySelector("img").src = "icons/" + "unvisibility" + ".png"
            } else {
                dgid(visi.dataset.id).style.opacity = "1"
                visi.querySelector("img").src = "icons/" + "visibility" + ".png"
            }
        })

        this.currentLayerId = l.order
        dgid("layer-" + this.currentLayerId).classList.add("selected")

        this.supportLayerOrder(null)

        layerInfo.onclick = () => {

            if (dgid("layer-" + this.currentLayerId) != null)
                dgid("layer-" + this.currentLayerId).classList.remove("selected")
            
            this.currentLayerId = layerInfo.dataset.id
            this.ct = this.layers[layerInfo.dataset.id].ct
            this.canvas = this.layers[layerInfo.dataset.id].canvas
            dgid("layer-" + this.currentLayerId).classList.add("selected")

        }
    }

    shiftLayers(){

    }

    createButton(parent, name, datasetId, w, h){
        let b = document.createElement("div")
        let img = document.createElement("img")
        img.src = "icons/" + name + ".png"
        img.width = w
        img.h = h
        b.appendChild(img)
        b.id = name + "-button-" + datasetId
        b.dataset.id = datasetId
        parent.appendChild(b)
        return b
    }

    renderImage(){
        let sheet = document.createElement("canvas")
        sheet.width = this.canvas.width; sheet.height = this.canvas.height
        let sheetContext = sheet.getContext("2d")
        sheetContext.clearRect(0, 0, sheet.width, sheet.height)
        let canvases = Array.from(document.querySelectorAll("canvas"))
        canvases.sort((a, b) => {
            const zIndexA = parseInt(a.style.zIndex); const zIndexB = parseInt(b.style.zIndex);
            return zIndexA - zIndexB;
        });
    
        for (let c of canvases) {
            //console.log(c.id + " " + c.style.zIndex)
            if (parseInt(c.style.opacity) == 1)
                sheetContext.drawImage(c, 0, 0)
        }
        let image = sheet.toDataURL("image/png")
        sheet.remove()
        return image;
    }

    gaussianDistribution(mean, standardDeviation){
        let u1 = Math.random()
        let u2 = Math.random()
        let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        let z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

        let radiusSample = mean + z0 * standardDeviation;
        let angle = 2 * Math.PI * Math.random()

        let x = radiusSample * Math.cos(angle)
        let y = radiusSample * Math.sin(angle)

        return { x: x, y: y }
    }

    generatePathPoints(freq){
        let X, Y
        let pathPoints = []
        let dist = this.distanceBetweenPoints(this.prevX, this.prevY, this.curX, this.curY)
        let angle = this.angleBetweenPoints(this.prevX, this.prevY, this.curX, this.curY)
    
        for (let i = 0; i < dist; i+=freq){
            X = this.prevX + Math.sin(angle)*i
            Y = this.prevY + Math.cos(angle)*i
            pathPoints.push({x: X, y: Y})
        }
        return pathPoints
    }

    pointsWithinCircle(d, x, y, isFlat){
        let lx, ly    
        var a = Math.random()
        var b = Math.random()
    
        if (isFlat && b < a){
            let temp = a
            a = b
            b = temp
        }
        lx = b*d*Math.cos(2*Math.PI*(a/b))+x
        ly = b*d*Math.sin(2*Math.PI*(a/b))+y
    
        return {x: lx, y: ly}
    }

    distanceBetweenPoints(){
        let dx = Math.abs(this.prevX-this.curX)
        let dy = Math.abs(this.prevY-this.curY)
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    angleBetweenPoints(){
        return Math.atan2(this.curX - this.prevX, this.curY - this.prevY);
    }


}

let dm = new DrawingMachine()

dgid("startCanvas").style.visibility = "hidden"//.addEventListener("click", () => { dm = new DrawingMachine(); });

dgid("close_button").addEventListener("click", () => { dgid("sideBar").style.width = "0"; })
dgid("menu_button").addEventListener("click", () => { dgid("sideBar").style.width = sideBarWidth + "px"; })

dgid("settings_button").addEventListener("click", () => {dgid("settingsBar").style.width = sideBarWidth + "px";})
dgid("close_settings").addEventListener("click", () => {dgid("settingsBar").style.width = "0";})