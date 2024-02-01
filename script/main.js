let color1 = "#000000"
let color2 = "#f9f8f5"

t = []

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

class Layer{
    constructor(order, activeLayer){
        this.order = order
        
        this.canvas = document.createElement("canvas")
        this.canvas.id = order
        this.canvas.style.opacity = "1"
        this.opacity = 1
        if (activeLayer != null)
            activeLayer.insertAdjacentElement("afterend", this.canvas)
        else dgid("layers").insertBefore(this.canvas, dgid("preview"));
        this.canvas.width = window.innerWidth - 400
        this.canvas.height = window.innerHeight - 200
        this.canvas.style.opacity = this.opacity.toString()
        this.ct = this.canvas.getContext("2d", {willReadFrequently:true})
        this.ct.save();
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
        //this.currentLayerId = this.baseId
        this.canvas.style.zIndex = 10
        this.preview.style.zIndex = 120
        this.selectedButton = null
        this.drawingTools = []
        this.drawingMode = null
        this.prevX = this.prevY = this.curX = this.curY = 0
        this.transi = 50
        this.primarColor = "#000000"
        this.minorColor = "#ffffff"
        this.smooth = true
        this.smoothFactor = 0.2

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
        this.pr.save()

        this.layers = {layer1: {id:this.baseId, canvas: this.canvas, ct: this.ct, opacity: 1}}
        this.pointArray = []

        this.addLayerButton({order: this.baseId, zIndex: 10, canvas: this.canvas, ct: this.ct, opacity: 1})

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
        this.pr.fillStyle = "#f9f8f5";
        //this.pr.fillRect(0, 0, window.innerWidth, window.innerHeight);

        dgid("canvas-size-window").style.visibility = "hidden";

        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);

        window.addEventListener("touchstart", this.onTouchStart);
        window.addEventListener("touchmove", this.onTouchMove, { passive: false });
        window.addEventListener("touchend", this.onTouchEnd);

        this.pr.lineWidth = 1;
        this.pr.lineCap = "round";
        this.pr.lineJoin = "miter";
        this.pr.strokeStyle = color1;
        this.pr.fillStyle = color2;
        this.pr.lineJoin = "miter";

        window.addEventListener('resize', () => {this.refreshCanvasPosition()});
    }

    clearSelectionArea(){
        this.pr.restore()
        this.pr.resetTransform()
        this.pr.save()
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
        this.pointArray = []
        if (ev.target.nodeName.toLowerCase() === 'canvas')
            this.is_drawing = true
        //updatePen()
        this.pr.lineCap = "round"
        this.pr.globalAlpha = 1
        this.pr.strokeStyle = this.primarColor
        this.currentTool.updateTool()
        this.currentTool.setStartingHue()
        this.pr.beginPath() // to prevent changing the properties of finished objects
        this.pr.beginPath()

        this.pointArray.splice(0, this.pointArray.length)

        this.prevX = ev.clientX - this.marginX
        this.prevY = ev.clientY - this.marginY
    }

    toolOn(ev){

        if (this.is_drawing && ev.target.nodeName.toLowerCase() != 'canvas'){
            this.closeSidebar()
            this.closeLayerBar()
        }


        this.curX = ev.clientX - this.marginX
        this.curY = ev.clientY - this.marginY
    
        this.pointArray.push({x: this.curX, y: this.curY})

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
        this.pointArray.push({x: this.curX, y: this.curY})
        if (this.smooth && this.currentTool.title != "Waterbrush" && this.currentTool.title != "Bridge"){
            this.clearPreviewCanvas()
            this.replayStroke()            
        }
        this.previewCanvasToMainCanvas()

        this.is_drawing = false
        this.endX = ev.clientX
        this.endY = ev.clientY
        //this.pr.closePath()
        //this.pr.closePath()
        this.currentTool.onUp()
        
        dgid("thumbnail-" + this.canvas.id).src = this.canvas.toDataURL()
    }

    clearPreviewCanvas(){
        this.pr.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    previewCanvasToMainCanvas(){
        let img = new Image()
        img.onload = () => {
            this.ct.drawImage(img, 0, 0)
            this.clearPreviewCanvas()
        }
        img.src = this.preview.toDataURL("image/png")
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

        for (const toolKey in this.drawingTools) {
            const tool = this.drawingTools[toolKey];
            tool.setInputUI(tool);
            t.push(tool)
        }
        
        this.currentTool = this.drawingTools["Pen"]
        this.selectedButton = dgid("Pen-button")
    }

    setColor(color){
        this.primarColor = color
    }

    initToolButtons(){
        dgid("clear").addEventListener("click", ()=> { this.ct.clearRect(0, 0, this.canvas.width, this.canvas.height) })

        dgid("color-input").addEventListener("input", (event) => {this.primarColor = event.target.value})

        dgid("palette_button").addEventListener("click", () =>{this.switchFoldingOfElement("paletteBar", "nav")})

        //key reader
        document.body.addEventListener('keydown', (ev) => {this.manageKeys(ev)});
        dgid("showBrushes").addEventListener("click", ()=>{this.switchFoldingOfElement("tools-section", "section")})

        //layer management
        dgid("add-layer").addEventListener("click", () => {this.addNewLayer()})
        this.sortable = new Sortable(dgid("layer-list"), {/* handle: ".drag-button", */animation: 350, chosenClass: "layer-chosen", dragClass: "layer-drag",
        swapThreshold: 1, direction: 'vertical', reversed: false, onUpdate: this.supportLayerOrder})

        dgid("layers-icon").onclick = () => {this.switchFoldingOfElement("layer-bar", "bar")}
        dgid("tips_button").onclick = () => { this.switchFoldingOfElement("tips-bar", "nav") }
        let partyClosers = Array.from(document.querySelectorAll(".close-button"))
        partyClosers.forEach((button) => { button.onclick = () => {button.parentNode.classList.add("closed")} })

        dgid("menu_button").addEventListener("click", () => { this.switchFoldingOfElement("sideBar", "nav")})
        dgid("settings_button").addEventListener("click", () => {this.switchFoldingOfElement("settingsBar", "nav")})
        let smoothCheckbox = dgid("smoothCheckbox")
        this.smooth = smoothCheckbox.checked
        smoothCheckbox.addEventListener("click", () => {this.smooth = smoothCheckbox.checked})

        dgid("smoothFactorInput").addEventListener("input", (ev) => {
            this.smoothFactor = parseFloat(ev.target.value)
        })

        //layer properties
        dgid("layerOpacityInput").addEventListener("input", (ev) => {
            let o = ev.target.value
            this.layers[this.canvas.id].opacity = parseFloat(o)
            this.canvas.style.opacity = o
            dgid("layerOpacityLabel").innerText = o
            dgid("thumbnail-" + this.canvas.id).style.opacity = o
        })
    }

    switchFoldingOfElement(id, foldingType){
        let elClass = dgid(id).classList
        switch (foldingType) {
            case "nav":
                elClass.contains("closed") ? elClass.remove("closed") : elClass.add("closed")
                break;
            default:
                elClass.contains("folded") ? elClass.remove("folded") : elClass.add("folded")
                break;
        }
    }

    supportLayerOrder(ev){
        let updatedLayers = null
        if (ev != null) updatedLayers =  Array.from(ev.from.children);
        else updatedLayers = Array.from(dgid("layer-list").children)

        let i = updatedLayers.length - 1
        for (let l of updatedLayers){
            dgid(l.dataset.id).style.zIndex = i + 10
            i--
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
                dgid("color-input").value = palette_color.dataset.palette
            })    
        })
        })
    }

    initDownloader(){   
        dgid("save").addEventListener("click", () => {this.downloadImage()})
    }

    manageKeys(e){
        if (e.key == "Escape") {this.closeSidebar(); this.closeLayerBar()}
        else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.downloadImage()
        }
        else if (e.key == "m") {this.switchFoldingOfElement("sideBar", "nav")}
        else if (e.key == "p") {this.switchFoldingOfElement("paletteBar", "nav")}
        else if (e.key == "s") {this.switchFoldingOfElement("settingsBar", "nav")}
        else if (e.key == "l") {this.switchFoldingOfElement("layer-bar", "bar")}
        else if (e.key == "q") {this.switchFoldingOfElement("tips-bar", "nav")}

    }

    downloadImage(){
        let canvas_image = document.createElement("a")
        canvas_image.href = this.renderImage()//this.canvas.toDataURL("imag/jpg")
        canvas_image.download = "My Blooming sketch"
        canvas_image.click()
    }

    closeSidebar(){document.querySelectorAll(".nav").forEach(element => {element.classList.add("closed")})}
    closeLayerBar(){dgid("layer-bar").classList.add("folded")}

    getCurrentTool(){
        //this.drawingMode
    }

    setCurrentTool(title){

    }

    addNewLayer(){
        let prevId = this.canvas.id
        let l = new Layer(Date.now().toString(), this.canvas)
        //l.canvas.style.opacity = "1"
        l.canvas.width = this.canvas.width; l.canvas.height = this.canvas.height
        this.ct = l.canvas.getContext("2d", { willReadFrequently: true })
        
        this.canvas = l.canvas
        this.ct = this.canvas.getContext("2d")
        this.addLayerButton(l, prevId)
    }

    addLayerButton(l, prevId){
        let thumbnail = this.canvas.toDataURL();
        let layerInfo = document.createElement("li")

        let left = document.createElement("div"); left.classList = "left"
        let right = document.createElement("div"); right.classList = "right"

        let vmist = document.createElement("textarea")
        vmist.classList = "layer-title"
        if (dgid("layer-" + this.canvas.id) != null)
            dgid("layer-" + this.canvas.id).classList.remove("selected")

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
        let curLayerButton = dgid("layer-" + prevId)
        if (curLayerButton != null)
            //dgid("layer-" + this.canvas.id).insertAdjacentElement("beforeend", layerInfo)
            dgid("layer-list").insertBefore(layerInfo, curLayerButton);

        else dgid("layer-list").appendChild(layerInfo)

        let visi = this.createButton(right, "visibility", l.order, 20, 20)
        visi.classList.add("switchable")
        visi.addEventListener("click", () => {
            if (parseInt(dgid(visi.dataset.id).style.opacity) == 1){
                dgid(visi.dataset.id).style.opacity = "0"
                visi.querySelector("img").src = "icons/" + "unvisibility" + ".png"
            } else {
                dgid(visi.dataset.id).style.opacity = "1"
                visi.querySelector("img").src = "icons/" + "visibility" + ".png"
            }
        })

        let opt = this.createButton(right, "options", l.order, 20, 20)
        opt.classList.add("layer-option-button", "small-button")
        let hov = dcel("div", right)
        hov.classList.add("hoverable", "switchable")

        let sec = dcel("div", hov); sec.classList.add("section")

        let rembo = this.createButton(sec, "delete", l.order, 20, 20, () => {this.switchLayer(rembo.dataset.id)}, "Remove layer")
        rembo.classList.add("layer-option-button", "option")

        let merge = this.createButton(sec, "merge", l.order, 20, 20, () => {this.mergeLayers(rembo.dataset.id)}, "Merge with bottom layer")
        merge.classList.add("layer-option-button", "option")


        this.selectLayer(l.order)

        this.supportLayerOrder(null)

        layerInfo.onclick = () => {
            if (dgid(layerInfo.dataset.id) == null) return
            this.setLayer(layerInfo.dataset.id)
        }
    }

    switchLayer(id){
        if (dgid("layer-list").children.length <= 1)
            return

        dgid(id).remove()
        dgid("layer-" + id).remove()
        
        let closestLayer = null
        let closestDifference = Infinity
        for (let layer of dgid("layers").children) {
            let difference = Math.abs(parseInt(layer.style.zIndex) - parseInt(this.canvas.style.zIndex))
            if (difference < closestDifference && layer.id != this.canvas.id) {
                closestDifference = difference
                closestLayer = layer
            }
        }
        this.setLayer(closestLayer.id)
    }

    setLayer(id){
        this.canvas = this.layers[id].canvas
        this.ct = this.layers[id].ct

        console.log(this.canvas.id + " " + this.canvas.style.zIndex)
        this.selectLayer(id)
    }

    selectLayer(id){
        let cur = dgid(id)
        Array.from(document.querySelectorAll(".layer-button")).forEach((el) => {el.classList.remove("selected")})
        dgid("layer-" + id).classList.add("selected")

        let o = cur.style.opacity
        this.layers[this.canvas.id].opacity = parseFloat(o)
        this.canvas.style.opacity = o
        dgid("layerOpacityInput").value = o
        dgid("layerOpacityLabel").innerText = o
    }

    mergeLayers(id){
        let order = this.canvas.style.zIndex
        let layerImageData = this.canvas
        this.switchLayer(id)
        this.ct.drawImage(layerImageData, 0, 0)
    }

    createButton(parent, name, datasetId, w, h, onClickFunction, sideLabel){
        let b = document.createElement("div")
        let img = document.createElement("img")
        img.src = "icons/" + name + ".png"
        img.width = w
        img.h = h
        b.appendChild(img)
        b.id = name + "-button-" + datasetId
        b.dataset.id = datasetId
        parent.appendChild(b)
        b.classList.add("button-label")

        if (sideLabel != null){
            let p = dcel("p", b)
            p.innerText = sideLabel
        }

        b.onclick = onClickFunction
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
            sheetContext.globalAlpha = parseFloat(c.style.opacity)
            sheetContext.drawImage(c, 0, 0)
            sheetContext.globalAlpha = 1
        }
        let image = sheet.toDataURL("image/png")
        sheet.remove()
        return image;
    }

    replayStroke(){
        let points = this.smoothPath()
        this.prevX = points[0].x; this.prevY = points[0].y;
        for (let p of points) {
            this.curX = p.x; this.curY = p.y;
            this.currentTool.onDraw()
            this.prevX = p.x; this.prevY = p.y;
        }
    }

    smoothPath(){
        let points = this.pointArray;
        if (points.length < 3) {
            return points
        }

        let smoothedPoints = [{x: this.pointArray[0].x, y: this.pointArray[0].y}]

        for (let i = 1; i < points.length - 1; i++) {
            let xc = (points[i].x + points[i + 1].x) / 2
            let yc = (points[i].y + points[i + 1].y) / 2

            let xcp = (points[i - 1].x + points[i].x) / 2
            let ycp = (points[i - 1].y + points[i].y) / 2

            smoothedPoints.push({
                x: xcp + (xc - xcp) * this.smoothFactor,
                y: ycp + (yc - ycp) * this.smoothFactor
            })
            smoothedPoints.push({ x: xc, y: yc })
        }
        smoothedPoints.push(points[points.length - 1])

        return smoothedPoints
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
