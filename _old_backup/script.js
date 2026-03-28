/* --- CONFIGURATION --- */
const API_URL = "https://towards-assists-nomination-liz.trycloudflare.com"; // Keep your active URL here

/* --- DOM ELEMENTS --- */
const recordBtn = document.getElementById("recordBtn");
const btnText = document.getElementById("btnText");
const statusText = document.getElementById("status-text");
const canvas = document.getElementById("audio-visualizer");
const canvasCtx = canvas.getContext("2d");
const resultSection = document.getElementById("result-section");
const themeBtn = document.getElementById("theme-btn");

// Nav Switchers
const navScannerBtn = document.getElementById("nav-scanner");
const navArchBtn = document.getElementById("nav-arch");
const viewScanner = document.getElementById("view-scanner");
const viewArch = document.getElementById("view-arch");

// Mode Switcher Buttons
const modeBtns = {
    "AUDIO": document.getElementById("mode-audio"),
    "TEXT": document.getElementById("mode-text"),
    "IMAGE": document.getElementById("mode-image"),
    "VIDEO": document.getElementById("mode-video")
};
const sections = {
    "AUDIO": document.getElementById("audio-section"),
    "TEXT": document.getElementById("text-section"),
    "IMAGE": document.getElementById("image-section"),
    "VIDEO": document.getElementById("video-section")
};

// Text Elements
const textInput = document.getElementById("text-input");
const analyzeTextBtn = document.getElementById("analyzeTextBtn");
const textStatusText = document.getElementById("text-status-text");

// Drag & Drop Elements
const imageDropArea = document.getElementById("image-drop-area");
const imageUploadInput = document.getElementById("imageUploadInput");
const imageStatusText = document.getElementById("image-status-text");

const videoDropArea = document.getElementById("video-drop-area");
const videoUploadInput = document.getElementById("videoUploadInput");
const videoStatusText = document.getElementById("video-status-text");

// Result Elements
const forensicList = document.getElementById("forensic-list");
const confidenceText = document.getElementById("confidence-text");
const confidenceFill = document.getElementById("confidence-fill");

let currentUser = "Unknown_Agent";
let lastResultData = null; 
let currentMode = "AUDIO"; 
let isRecording = false;
let mediaRecorder, audioChunks = [], audioContext, analyser;

/* --- UI: THEME & LOGIN --- */
themeBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    document.body.setAttribute("data-theme", currentTheme === "light" ? "dark" : "light");
    themeBtn.textContent = currentTheme === "light" ? "🌗" : "☀️";
});

document.getElementById("login-btn").addEventListener("click", () => {
    const name = document.getElementById("username-input").value.trim();
    if (name.length > 2) {
        currentUser = name;
        document.getElementById("login-overlay").classList.add("hidden");
        statusText.textContent = `Welcome, Agent ${currentUser}. System Ready.`;
    } else {
        alert("Please enter a valid Agent ID.");
    }
});

/* --- UI: NAVIGATION SWITCHING --- */
navScannerBtn.addEventListener("click", () => switchView("SCANNER"));
navArchBtn.addEventListener("click", () => switchView("ARCH"));

function switchView(view) {
    if (view === "SCANNER") {
        navScannerBtn.classList.add("active");
        navArchBtn.classList.remove("active");
        viewScanner.classList.remove("hidden");
        viewScanner.classList.add("fade-in");
        viewArch.classList.add("hidden");
    } else {
        navArchBtn.classList.add("active");
        navScannerBtn.classList.remove("active");
        viewArch.classList.remove("hidden");
        viewArch.classList.add("fade-in");
        viewScanner.classList.add("hidden");
    }
}

/* --- UI: MODE SWITCHING (Animated) --- */
Object.keys(modeBtns).forEach(key => {
    modeBtns[key].addEventListener("click", () => {
        // Reset all
        Object.values(modeBtns).forEach(btn => btn.classList.remove("active"));
        Object.values(sections).forEach(sec => sec.classList.add("hidden"));
        resultSection.classList.add("hidden");

        // Activate target
        modeBtns[key].classList.add("active");
        sections[key].classList.remove("hidden");
        
        // Force reflow for animation restart
        void sections[key].offsetWidth; 
        sections[key].classList.add("fade-in");
        currentMode = key;
    });
});

/* --- UI: DRAG & DROP LOGIC --- */
function setupDragDrop(dropArea, inputElement, uploadFunction) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('drag-over'), false);
    });

    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) uploadFunction(file);
    });
    
    dropArea.addEventListener("click", () => inputElement.click());
    inputElement.addEventListener("change", (e) => { if (e.target.files[0]) uploadFunction(e.target.files[0]); });
}

setupDragDrop(imageDropArea, imageUploadInput, uploadImage);
setupDragDrop(videoDropArea, videoUploadInput, uploadVideo);

document.getElementById("uploadBtn").addEventListener("click", () => document.getElementById("fileUpload").click());
document.getElementById("fileUpload").addEventListener("change", (e) => { if (e.target.files[0]) uploadAudio(e.target.files[0]); });

/* --- BACKEND COMMUNICATION --- */
analyzeTextBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (text.length < 10) return alert("Enter more text.");
    textStatusText.textContent = "Analyzing patterns...";
    analyzeTextBtn.textContent = "PROCESSING...";
    
    const formData = new FormData();
    formData.append("text", text);
    formData.append("user_id", currentUser);
    
    try {
        const res = await fetch(`${API_URL}/analyze_text`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server Error");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        lastResultData = data; lastResultData.type = "TEXT"; lastResultData.contentSnippet = text.substring(0,200)+"...";
        displayResults(data);
    } catch (error) { 
        alert("Backend Error: " + error.message); 
    } finally {
        textStatusText.textContent = "Ready for input...";
        analyzeTextBtn.textContent = "ANALYZE TEXT";
    }
});

async function uploadImage(file) {
    imageStatusText.textContent = "Scanning Metadata & Visual Artifacts...";
    const formData = new FormData(); formData.append("file", file); formData.append("user_id", currentUser);
    try {
        const res = await fetch(`${API_URL}/analyze_image`, { method: "POST", body: formData });
        const data = await res.json();
        lastResultData = data; lastResultData.type = "IMAGE"; displayResults(data);
    } catch (error) { alert("Backend Error: " + error.message); }
    imageStatusText.textContent = "Ready for input...";
}

async function uploadVideo(file) {
    if (file.size > 15 * 1024 * 1024) return alert("File too large! Max 15MB for demo.");
    videoStatusText.textContent = "Extracting Frames & Audio... This takes a moment.";
    const formData = new FormData(); formData.append("file", file); formData.append("user_id", currentUser);
    try {
        const res = await fetch(`${API_URL}/analyze_video`, { method: "POST", body: formData });
        const data = await res.json();
        lastResultData = data; lastResultData.type = "VIDEO"; displayResults(data);
    } catch (error) { alert("Backend Error: " + error.message); }
    videoStatusText.textContent = "Ready for input...";
}

async function uploadAudio(blob) {
    statusText.textContent = `Uploading to AWS...`;
    const formData = new FormData(); formData.append("file", blob, "recording.wav"); formData.append("user_id", currentUser); 
    try {
        const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });
        const data = await res.json();
        lastResultData = data; lastResultData.type = "AUDIO"; displayResults(data);
    } catch (error) { alert("Backend Error: " + error.message); }
    statusText.textContent = "Ready for input...";
}

/* --- ANIMATED RESULTS DISPLAY --- */
function displayResults(data) {
    resultSection.classList.remove("hidden");
    resultSection.classList.add("fade-in");
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const verdictBox = document.getElementById("verdict-display");
    const scanId = document.getElementById("scan-id");

    // Verdict styling
    verdictBox.textContent = data.verdict; 
    const color = data.verdict === "FAKE" ? "var(--danger-color)" : (data.verdict === "SUSPICIOUS" ? "orange" : "var(--success-color)");
    verdictBox.style.color = color;
    confidenceFill.style.backgroundColor = color;
    
    // Smooth, Float-Safe Counter Animation
    const numericConfidence = parseFloat(data.confidence) || 0;
    animateValue("confidence-text", 0, numericConfidence, 1500);
    setTimeout(() => { confidenceFill.style.width = numericConfidence + "%"; }, 100);

    scanId.textContent = (data.scan_id || "UNK").substring(0, 8) + "...";

    // Evidence routing
    document.getElementById("audio-evidence-container").style.display = "none";
    document.getElementById("text-evidence-container").style.display = "none";
    document.getElementById("image-evidence-container").style.display = "none";

    if (lastResultData.type === "AUDIO") {
        document.getElementById("evidence-title").textContent = "Spectral Evidence";
        document.getElementById("audio-evidence-container").style.display = "block";
        document.getElementById("spectrogram-img").src = data.image_url; 
    } else if (lastResultData.type === "TEXT") {
        document.getElementById("evidence-title").textContent = "Content Analysis";
        document.getElementById("text-evidence-container").style.display = "block";
        document.getElementById("evidence-text").textContent = `"${lastResultData.contentSnippet}"`;
    } else {
        document.getElementById("evidence-title").textContent = "Visual Analysis";
        document.getElementById("image-evidence-container").style.display = "block";
        document.getElementById("analyzed-image-preview").src = data.image_url; 
    }

    // Staggered Forensics List
    forensicList.innerHTML = ""; 
    if (data.forensics && Array.isArray(data.forensics)) {
        data.forensics.forEach((ind, index) => {
            const li = document.createElement("li");
            li.textContent = ind;
            li.className = "forensic-item";
            li.style.borderColor = ind.includes("✅") ? "var(--success-color)" : "var(--danger-color)";
            li.style.animationDelay = `${index * 0.15}s`; // Stagger effect
            forensicList.appendChild(li);
        });
    }
}

// Fixed Animation helper for Floating Point numbers
function animateValue(id, start, end, duration) {
    let startTimestamp = null;
    const obj = document.getElementById(id);
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Calculate the current value based on progress and format to 2 decimals
        let currentVal = (progress * (end - start) + start).toFixed(2);
        obj.innerHTML = currentVal + "%";
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Ensure the exact final float value is displayed at the very end
            obj.innerHTML = end.toFixed(2) + "%";
        }
    };
    window.requestAnimationFrame(step);
}

/* --- PDF LOGIC (Unchanged) --- */
if(document.getElementById("download-report")) {
    document.getElementById("download-report").addEventListener("click", async () => {
        if (!lastResultData) return;
        const { jsPDF } = window.jspdf; const doc = new jsPDF();
        doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(0, 40, 100); 
        doc.text("VOXSENTINEL | FORENSIC REPORT", 20, 20);
        doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.text(`Verdict: ${lastResultData.verdict}`, 20, 40);
        const color = lastResultData.verdict === "FAKE" ? [255, 0, 0] : [0, 255, 0];
        doc.setFillColor(...color); doc.rect(18, 45, 170, 2, "F"); 
        doc.setFont("helvetica", "normal"); doc.setFontSize(12); let y = 60;
        doc.text(`Scan ID:      ${lastResultData.scan_id || 'N/A'}`, 20, y); y += 10;
        doc.text(`Type:         ${lastResultData.type}`, 20, y); y += 10;
        doc.text(`Confidence:   ${lastResultData.confidence}%`, 20, y); y += 10;
        doc.text(`Timestamp:    ${new Date().toLocaleString()}`, 20, y); y += 20;
        doc.setFont("helvetica", "bold"); doc.text("Forensic Indicators:", 20, y); y += 10;
        doc.setFont("helvetica", "normal");
        if (lastResultData.forensics) { lastResultData.forensics.forEach(line => { doc.text("- " + line.replace(/[^\x00-\x7F]/g, ""), 20, y); y += 10; }); }
        if (lastResultData.image_url) { y += 10; doc.setTextColor(0, 0, 255); doc.textWithLink("View Visual Evidence", 20, y, { url: lastResultData.image_url }); }
        doc.save(`VoxSentinel_Report.pdf`);
    });
}
