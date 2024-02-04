class State{
    constructor(number, canvas, imageData){
        this.number = number
        this.canvas = canvas
        this.imageData = imageData
    }
}

class CanvasStateController{
    constructor(dm){
        this.dm = dm
        this.maxUndoCount = 50
        //this.states = []
        this.undoStack = []
        this.redoStack = []
        this.counter = 0
        this.currentState = null
        
        this.initUI()
    }
    saveState(){
        let state = new State(this.counter, this.dm.canvas, this.dm.ct.getImageData(0, 0, this.dm.canvas.width, this.dm.canvas.height))
        this.keepStackBounds()
        this.undoStack.push(state)
        this.counter++
        this.currentState = state
        //console.log(state)
        this.redoStack.splice(0, this.redoStack.length)

        this.tellButtonIsOrNotAvailable("redo", false)
        this.tellButtonIsOrNotAvailable("undo", true)
    }
    undo(){
        if (this.undoStack.length > 1){
            let s = this.undoStack.pop()       
            this.redoStack.push(s)
            s = this.undoStack[this.undoStack.length-1]
            this.setState(s)

            this.tellButtonIsOrNotAvailable("redo", true)
            if (this.undoStack.length == 1)
                this.tellButtonIsOrNotAvailable("undo", false)
        }
    }
    redo(){
        if (this.redoStack.length > 0){
            let s = this.redoStack.pop();
            this.setState(s);
            this.undoStack.push(s);

            this.tellButtonIsOrNotAvailable("undo", true)
            if (this.redoStack.length < 1)
                this.tellButtonIsOrNotAvailable("redo", false)
        }
    }
    setState(state) {
        let layerId = state.canvas.id

        if (this.dm.layers[layerId]) {
            let ct = this.dm.layers[layerId].ct
            ct.putImageData(state.imageData, 0, 0)
            //console.log("state number " + state.number)
        }
    }
    keepStackBounds(){
        if (this.undoStack.length > this.maxUndoCount)
            this.undoStack.shift()
    }
    initUI(){
        this.tellButtonIsOrNotAvailable("undo", false)
        this.tellButtonIsOrNotAvailable("redo", false)
    }
    tellButtonIsOrNotAvailable(type, availability){
        if (availability)
            document.getElementById(type + "Button").classList.remove("unavailable")
        else document.getElementById(type + "Button").classList.add("unavailable")
    }
}