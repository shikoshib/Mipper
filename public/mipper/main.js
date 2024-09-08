const overlayContainer = document.querySelector(".overlay-container");
overlayContainer.classList.add("offscreen");

const userPreview = document.querySelector(".user-preview");
const userOverlay = document.querySelector(".user-overlay");
const langOption = document.querySelector(".lang-option");
const langDropdown = document.querySelector(".lang-dropdown");
const langOptions = document.querySelectorAll(".lang-dropdown overlay-option");

let dropdownShown = false;
let langDropdownShown = false;

userPreview.addEventListener("click", () => {
    if (!dropdownShown) {
        userOverlay.style.pointerEvents = "all";
        userOverlay.style.userSelect = "text";
        overlayContainer.classList.remove("offscreen");
        userOverlay.style.opacity = 1;
        dropdownShown = true;
    } else {
        userOverlay.style.pointerEvents = "none";
        userOverlay.style.userSelect = "none";
        overlayContainer.classList.add("offscreen");
        userOverlay.style.opacity = 0;
        if (langDropdownShown) {
            langDropdown.style.pointerEvents = "none";
            langDropdown.style.userSelect = "none";
            langDropdown.style.opacity = 0;
            langDropdownShown = false;
        }
        dropdownShown = false;
    }
})

langOption.addEventListener("click", () => {
    if (!langDropdownShown) {
        langDropdown.style.pointerEvents = "all";
        langDropdown.style.userSelect = "text";
        langDropdown.style.opacity = 1;
        langDropdownShown = true;
    } else {
        langDropdown.style.pointerEvents = "none";
        langDropdown.style.userSelect = "none";
        langDropdown.style.opacity = 0;
        langDropdownShown = false;
    }
})

for (const option of langOptions) {
    option.addEventListener("click", () => {
        console.log(option.id)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 100);
        document.cookie = `ml=${option.id}; expires=${expirationDate.toUTCString()}; path=/`;
        location.reload();
    })
}