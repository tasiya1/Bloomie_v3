class Theme{
    constructor(title, type, main, highlight, fontColor, fontFace, accent, voidColor){
        this.title = title
        this.type = type
        this.main = main
        this.highlight = highlight
        this.fontColor = fontColor
        this.fontFace = fontFace
        this.accent = accent
        this.voidColor = voidColor

        this.initGUI()
    }

    initGUI(){
        let themeCell = document.createElement("div")
        themeCell.classList = "theme-cell"
        themeCell.style.backgroundColor = this.main
        themeCell.id = this.title
        themeCell.innerHTML = `
            <h3 class="theme-title"  style="font-family: ` + this.fontFace + `; color: ` + this.fontColor + `;">` + this.title + `</h3>
            <div style="display: flex; flex-direction: row;">
                <div class="highlight-color-cell" style="background-color: ` + this.highlight + `;"><img src="icons/brush.png" class="theme-brush"></div>
                <div class="accent-color-cell" style="background-color: ` + this.accent + `;"></div>
            </div>
        `
        themeCell.onclick = () => {this.setTheme()}
        document.getElementById("themesContainer").appendChild(themeCell)
    }
    setTheme(){
        const root = document.documentElement;
        root.style.setProperty('--theme-title', this.title);
        root.style.setProperty('--theme-type', this.type);
        root.style.setProperty('--main-color', this.main);
        root.style.setProperty('--highlight-color', this.highlight);
        root.style.setProperty('--font-color', this.fontColor);
        root.style.setProperty('--font-face', this.fontFace);
        root.style.setProperty('--accent-color', this.accent);
        root.style.setProperty('--void-color', this.voidColor);
        
        if (this.type == "light"){
            root.style.setProperty('--theme-icons-mod', "invert(0)");
        } else root.style.setProperty('--theme-icons-mod', "invert(1)");

    }
}

let base = new Theme("Sakura", "light", "#f1c5c5b5", "#ff9e9eb5", "#434343", "Overpass, Verdana", "#ffe5e5", "#434343")
new Theme("Print", "light", "#f5f5f5de", "#b5b5b5ab", "#0c3b21", "Corbel", "#383838", "#434343")
new Theme("Book Shelf", "light", "#fbe5d5", "#ffa13d70", "#442813", "Tahoma", "#fff8f0", "#434343")
new Theme("Mint", "light", "#d5fbeade", "#00a38073", "#0c3b21", "Verdana", "#f0fff8", "#434343")
new Theme("Vampire", "dark", "#181818f5", "#8e072f3b", "#b90014", "Candara", "#8a8a8a", "#434343")
new Theme("Deep", "dark", "#141414e6", "#3dd2f0b5", "#f2f2f2", "Overpass, Candara", "#8fecff", "#434343")
new Theme("Neon", "dark", "#080808d6", "#0023bd38", "#00ff00", "Consolas", "#00ff00", "#434343")
new Theme("Sun Bright", "light", "#ffaf00cc", "#ff1a0685", "#eaeaea", "Century Gothic", "#434343", "#434343")

base.setTheme()