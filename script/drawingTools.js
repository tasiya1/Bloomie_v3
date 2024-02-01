class DrawingTool {
    constructor (dm, title){
        this.dm = dm
        //this.onDraw = onDrawFunction
        this.width = 5
        this.color = "#000000"
        this.minorColor = "#ffffff"
        this.title = title
        this.setToolUI(this.title)
    }

    onDown() {}

    onDraw(){}

    onUp() {}

    afterSelf() {
        this.dm.pr.clearRect(0, 0, this.dm.preview.width, this.dm.preview.height);
    }

    updateTool(){
        this.dm.pr.globalAlpha = 1
        this.dm.pr.strokeStyle = this.color = this.dm.primarColor
        this.dm.pr.lineWidth = this.width
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
        <div title="`+ title +`"><img src="icons/` + title.toLowerCase() +`.png" class="icon switchable"></div>
        <p>` + title +`</p>
        </div><div class="tool-additional"></div>`
        container.appendChild(tool)

        let propertyContainer = document.createElement('div')
        propertyContainer.id = this.title + "-property"
        dgid("tools-properties").appendChild(propertyContainer)

        tool.addEventListener("click", (ev) => {
            if (ev.target.parentNode.className !== "tool-additional"){
                //if (this.dm.currentTool != this) this.dm.currentTool.afterSelf()
                this.dm.currentTool = this
                document.querySelector(".selected-tool").classList.remove("selected-tool")
                document.querySelector(".selected-tool-property").classList.remove("selected-tool-property")

                this.dm.selectedButton = tool
                this.dm.selectedButton.classList.add("selected-tool")
                dgid(this.title + "-property").classList.add("selected-tool-property")

            }
        })
    }

    setInputUI(toolType) {
        let container = dgid(this.title + "-property")
        container.classList.add('tool-properties-container')
        let title = dcel("h4", container)
        title.innerHTML = toolType.constructor.name

        Object.entries(toolType).forEach(([key, value]) => {
            let penWidthCircle = dgid("displayPenWidth")
            let ct = dgid("pen-width-container")
            if (typeof value === 'number') {
                let innerContainer = dcel("div", container)
                innerContainer.classList = "slider-field"
                let slider = document.createElement('input')
                slider.type = 'range'; 
                
                if (Number.isInteger(value)) {
                    slider.min = 1; slider.max = 100; slider.step = 1
                } else {
                    slider.min = 0.05; slider.max = 1; slider.step = 0.05
                }

                slider.style.width = "50%"
                slider.value = value

                slider.classList.add("slider")
    
                let label = document.createElement('label')
                label.textContent = key
                container.appendChild(innerContainer)
                innerContainer.appendChild(label)
                innerContainer.appendChild(slider)
                let val = dcel("label", innerContainer)
                val.innerHTML = slider.value

                slider.addEventListener('input', function() {
                    toolType[key] = parseFloat(this.value)
                    val.innerHTML = this.value.toString()
                    if (key == "width"){
                        ct.style.display = "flex"
                        penWidthCircle.style.width = val.innerHTML + "px"
                        penWidthCircle.style.height = val.innerHTML + "px"
                    }
                });

                slider.addEventListener("mouseup", () => {
                    ct.style.display = "none"
                })

            }
        });
        dgid('tools-properties').appendChild(container)
    }
}

class Pen extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);

        dgid("Pen-button").classList.add("selected-tool")
        dgid(this.title + "-property").classList.add("selected-tool-property")
    }

    onDraw() {
        this.dm.pr.beginPath();   
        this.dm.pr.moveTo(this.dm.prevX, this.dm.prevY)
        this.dm.pr.lineTo(this.dm.curX, this.dm.curY)
        this.dm.pr.stroke(); 
    }

}

class Scatter extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.width = 70
        this.dotSize = 2
        this.density = 10
        this.mean = 10
        this.isFlat = true
    }

    updateTool(){
        this.dm.pr.lineWidth = this.dotSize
        this.dm.pr.strokeStyle = this.color = this.dm.primarColor
    }

    onDraw() {
        var p = []
        for (let i = 0; i < this.density; i++) {
            if (this.isFlat)
                p = this.dm.pointsWithinCircle(this.width, this.dm.curX, this.dm.curY, this.isFlat)
            else p = this.dm.gaussianDistribution(this.mean, this.width)
            //p.x = this.dm.curX - (Math.random()>0.5?p.x:-p.x)
            //p.y = this.dm.curY - (Math.random()>0.5?p.y:-p.y)
            this.dm.pr.beginPath()
            this.dm.pr.moveTo(p.x, p.y)
            this.dm.pr.lineTo(p.x, p.y)
            this.dm.pr.stroke()
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
            //this.dm.pr.clearRect(p.x-this.width, p.y-this.width, 2*this.width, 2*this.width)
            this.dm.ct.globalCompositeOperation = "destination-out"
            this.dm.ct.beginPath()
            this.dm.ct.arc(p.x, p.y, this.width, 0, 2 * Math.PI)
            this.dm.ct.fill()
            //this.dm.pr.fillStyle = "rgba(255, 255, 255, 0.1)"
        }

        this.dm.ct.globalCompositeOperation = "source-over"
        this.dm.ct.fillStyle = this.minorColor
    }
}

class Bridge extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.width = 1
        this.connectivity_range = 100
        this.bridge_density = 2
        this.lineOpacity = 0.9
        this.bridgesOpacity = 0.4
        this.line_offset = 0
        this.point_recentness = 300
    }

    onDraw() {
        let i
        if (this.dm.pointArray.length >= (this.point_recentness + 1))
            i = this.dm.pointArray.length - this.point_recentness - 1
        else i = 0
        for (; i < this.dm.pointArray.length; i++){
            this.dm.pr.strokeStyle = setHexRGBA(this.color, this.lineOpacity)
            this.dm.pr.beginPath()
            this.dm.pr.moveTo(this.dm.prevX, this.dm.prevY)
            this.dm.pr.lineTo(this.dm.curX, this.dm.curY)
            this.dm.pr.stroke()
            this.dm.pr.closePath()
    
            let dx = this.dm.pointArray[i].x-this.dm.curX
            let dy = this.dm.pointArray[i].y-this.dm.curY
            let d = dx * dx + dy * dy;
            if ((d < this.connectivity_range*this.connectivity_range) && (i % this.bridge_density == 0)){
                this.dm.pr.strokeStyle = setHexRGBA(this.color, this.bridgesOpacity)
                let odx = dx*(this.line_offset/10)
                let ody = dy*(this.line_offset/10)
                this.dm.pr.beginPath()
                this.dm.pr.moveTo((this.dm.curX > this.dm.pointArray[i].x)?(this.dm.curX+odx):(this.dm.curX-odx), (this.dm.curY > this.dm.pointArray[i].y)?(this.dm.curY+ody):(this.dm.curY-ody))
                this.dm.pr.lineTo((this.dm.curX > this.dm.pointArray[i].x)?(this.dm.pointArray[i].x-odx):(this.dm.pointArray[i].x+ody), (this.dm.curY > this.dm.pointArray[i].y)?(this.dm.pointArray[i].y-ody):(this.dm.pointArray[i].y+ody))
                this.dm.pr.stroke();
                this.dm.pr.closePath()
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
    
            let brush_airbrush = dm.pr.createRadialGradient(x, y, 1, x, y, this.width)
            brush_airbrush.addColorStop(0, setHexRGBA(this.color, 0.125))
            brush_airbrush.addColorStop(0.5, setHexRGBA(this.color, 0.0625))
            brush_airbrush.addColorStop(1, setHexRGBA(this.color, 0))
            this.dm.pr.fillStyle = brush_airbrush
            this.dm.pr.fillRect(x-this.width, y-this.width, 2*this.width, 2*this.width)
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
        this.dm.pr.strokeStyle = "rgba(0,0,0,0)"
        this.dm.pr.lineWidth = this.width
    }
}

class Drops extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.width = 40
        this.dotSize = 10
        this.transparency = 0.5
        this.opacity_jitter = 0.5
        this.density = 3

        //this.dm.pr.fillStyle = setRGB(0,0,0)//"black"
    }

    onDraw() {
        let opacity = this.opacity_jitter * Math.random()
        for (let i = 0; i < this.density; i++){
            opacity = 1 - this.opacity_jitter + this.opacity_jitter * Math.random() 
            this.dm.pr.fillStyle = setHexRGBA(this.color, opacity)//setRGBA(rgb[0], rgb[1], rgb[2], opacity)
            this.dm.pr.beginPath()
            let eh1 = Math.random()*this.width*(Math.random()<0.5?(-1):1)
            let eh2 = Math.random()*this.width*(Math.random()<0.5?(-1):1)
            this.dm.pr.arc(this.dm.prevX+eh1,this.dm.prevY+eh2, Math.random()*this.dotSize, 0, 2*Math.PI, true)
            this.dm.pr.fill()
            this.dm.pr.stroke()
            this.dm.pr.closePath()
        }  
    }

    updateTool(){
        this.dm.pr.strokeStyle = "rgba(0,0,0,0)"
        this.color = this.dm.primarColor
        this.dm.pr.fillStyle = setHexRGBA(this.color, this.transparency)
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
        this.dm.pr.strokeStyle = this.color
        var inc_dist = 0
        let transparency = 1
        for (let i = 1; i <= this.nlines; i++){
            this.dm.pr.beginPath()
            this.dm.pr.moveTo(this.dm.prevX, this.dm.prevY+inc_dist);
            this.dm.pr.lineTo(this.dm.curX, this.dm.curY+inc_dist);
            this.dm.pr.stroke();
            inc_dist = this.linedistance*i
            this.dm.pr.strokeStyle = setHexRGBA(this.color, transparency)
            transparency -= 1/this.nlines
        }
    }
    
    updateTool(){
        this.dm.pr.strokeStyle = this.color = this.dm.primarColor
        this.dm.pr.lineWidth = this.width
    }
}

class Pixels extends DrawingTool {
    constructor(dm, title) {
        super(dm, title);
        this.width = 5
    }

    onDraw() {
        this.dm.pr.beginPath()
        this.dm.pr.fillRect(Math.floor(this.dm.curX/this.width)*this.width, Math.floor(this.dm.curY/this.width)*this.width, this.width, this.width)
        this.dm.pr.stroke()
    }

    updateTool(){
        this.dm.pr.fillStyle = this.dm.primarColor
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
        this.dm.pr.beginPath();   
        this.dm.pr.moveTo(this.dm.prevX, this.dm.prevY)
        this.dm.pr.lineTo(this.dm.curX, this.dm.curY)
        this.dm.pr.stroke();
        this.dm.pr.closePath()

        let p = this.dm.generatePathPoints(1)

        if (this.dm.distanceBetweenPoints() > this.density)
            if (this.leakingThreshold < Math.random()){
                let leakagePoint = p[Math.floor(Math.random() * p.length)]
                console.log(leakagePoint)
                new Leak(this, leakagePoint.x, leakagePoint.y)
            }

    }

    updateTool(){
        this.dm.pr.lineWidth = this.width
        this.dm.pr.strokeStyle = this.color = this.dm.primarColor
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
        dm.pr.strokeStyle = this.color
        dm.pr.beginPath()
        this.width *= Math.exp(-0.1)
        dm.pr.lineWidth = this.width
        dm.pr.moveTo(this.x, this.lastY)
        this.lastY += this.distanceInterval * Math.random()
        this.x += (Math.random()-0.5) * this.surfaceRoughness
        dm.pr.lineTo(this.x, this.lastY)
        dm.pr.stroke()
        dm.pr.closePath()
        dm.pr.lineWidth = this.wb.width
        dm.pr.strokeStyle = dm.currentTool.color //віддаємо контексту його попередній колір, шоб фарби ну, не тойво
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
        //this.dm.pr.save()
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
        this.dm.pr.clip(this.path);
        this.dm.currentTool = this.dm.drawingTools["Pen"];
        this.dm.pr.strokeStyle = this.color;
        this.path = new Path2D(); // Очищення шляху
    }

    updateTool() {
        this.dm.pr.strokeStyle = this.color;
        this.dm.pr.strokeStyle = "#FFFFFF" //setRGB(255, 0, 0);
    }

    detailedUI(){
        /*
        let b = dgid(this.title + "-button").querySelector(".tool-additional")
        b.innerHTML += `<p id="reset-clip" style="    position: absolute;
        right: 0px;
        top: 50%;
        transform: translateY(-50%);
        background-color: #555555;
        padding: 5px;
        z-index: 10;">Reset</p>`
        */
        dgid("reset-clip").addEventListener("click", () => {
            this.dm.pr.clearRect(0, 0, this.dm.preview.width, this.dm.preview.height);
            this.dm.clearSelectionArea()
        })
    }
}
