let pParent = document.getElementById("standard-palettes")

class Palette{
    constructor(title, colors){
        this.title = title
        this.colors = colors
        this.appendPalette()
    }
    
    appendPalette(){
        let h = document.createElement("h4")
        h.innerText = this.title
        pParent.appendChild(h)

        let p = document.createElement("div")
        p.classList.add("palette-cell-container")

        for (let c of this.colors){
            p.innerHTML += "<div class=\"palette\" data-palette=\"" + c + "\" style=\"background-color: " + c +"\"></div>"
        }
        pParent.appendChild(p)
    }
}

new Palette("Autumn",   ["#A31919", "#CC2222", "#FF4400", "#FFBF00", "#C4691F", "#DA5A64", "#F7BC9A", "#D79072"])
new Palette("Cream",    ["#FFC6EC", "#C6E0FF", "#FFF5E3", "#FBD9CB", "#C1C8FF", "#8AC6D1", "#EE9797", "#FFD800"])
new Palette("Ocean",    ["#3B67AE", "#00AEFF", "#28E5FF", "#00FFFF", "#16357B", "#2188A1", "#49A9C9", "#8AD1B7"])
new Palette("Forest",   ["#D0D270", "#598F54", "#7DB666", "#F8FF7F", "#646640", "#7C6E35", "#B6A666", "#AAB208"])
new Palette("Spring Garden", ["#FFF5E3", "#CD4536", "#BC9678", "#FFCBA2", "#8AC6D1", "#E69618", "#FFE9B2", "#ECE874", "#EE9797", "#6DA3DD", "#889B5E", "#C9B984"])
new Palette("Winter",   ["#D5D4CE", "#EEEEEE", "#FFFFFF", "#F9E4E9", "#AAC4CF", "#D3F1FB", "#B2AFA9", "#D7D1C4", "#91A0A5", "#60807C", "#80745A", "#52514E"])

let palette = document.querySelectorAll(".palette")
        palette = Array.from(palette)
        palette.forEach(palette_color => {
            palette_color.addEventListener("click", (event) => {
                dm.primarColor = palette_color.dataset.palette
                document.getElementById("color-input").value = palette_color.dataset.palette
            })    
        })