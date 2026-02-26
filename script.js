/* --- CONFIGURATION --- */
const API_URL = "https://efficient-stack-station-northeast.trycloudflare.com"; 

/* --- DOM ELEMENTS --- */
const recordBtn = document.getElementById("recordBtn");
const btnText = document.getElementById("btnText");
const statusText = document.getElementById("status-text");
const canvas = document.getElementById("audio-visualizer");
const canvasCtx = canvas.getContext("2d");
const resultSection = document.getElementById("result-section");
const themeBtn = document.getElementById("theme-btn");

// Mode Switcher Buttons
const modeAudioBtn = document.getElementById("mode-audio");
const modeTextBtn = document.getElementById("mode-text");
const modeImageBtn = document.getElementById("mode-image");
const modeVideoBtn = document.getElementById("mode-video");

// Sections
const audioSection = document.getElementById("audio-section");
const textSection = document.getElementById("text-section");
const imageSection = document.getElementById("image-section");
const videoSection = document.getElementById("video-section");

// Text Elements
const textInput = document.getElementById("text-input");
const analyzeTextBtn = document.getElementById("analyzeTextBtn");
const textStatusText = document.getElementById("text-status-text");

// Image Elements
const imageUploadInput = document.getElementById("imageUploadInput");
const imageDropArea = document.getElementById("image-drop-area");
const imageStatusText = document.getElementById("image-status-text");

// Video Elements
const videoUploadInput = document.getElementById("videoUploadInput");
const videoDropArea = document.getElementById("video-drop-area");
const videoStatusText = document.getElementById("video-status-text");

// Evidence Containers
const evidenceTitle = document.getElementById("evidence-title");
const audioEvidenceContainer = document.getElementById("audio-evidence-container");
const textEvidenceContainer = document.getElementById("text-evidence-container");
const imageEvidenceContainer = document.getElementById("image-evidence-container");

// Content Placeholders
const evidenceText = document.getElementById("evidence-text");
const specImg = document.getElementById("spectrogram-img");
const analyzedImagePreview = document.getElementById("analyzed-image-preview");

// Login Elements
const loginOverlay = document.getElementById("login-overlay");
const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("username-input");

// General Uploads
const downloadBtn = document.getElementById("download-report");
const fileInput = document.getElementById("fileUpload");
const uploadBtn = document.getElementById("uploadBtn");
const forensicList = document.getElementById("forensic-list");

/* --- STATE VARIABLES --- */
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioContext;
let analyser;
let source;
let currentUser = "Unknown_Agent";
let lastResultData = null; 
let currentMode = "AUDIO"; 

/* --- 1. THEME TOGGLE --- */
themeBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    document.body.setAttribute("data-theme", currentTheme === "light" ? "dark" : "light");
    themeBtn.textContent = currentTheme === "light" ? "🌗" : "☀️";
});

/* --- 2. LOGIN LOGIC --- */
loginBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (name.length > 2) {
        currentUser = name;
        loginOverlay.classList.add("hidden-modal");
        statusText.textContent = `Welcome, Agent ${currentUser}. System Ready.`;
    } else {
        alert("Please enter a valid Agent ID.");
    }
});

/* --- 3. MODE SWITCHING --- */
function resetTabs() {
    [modeAudioBtn, modeTextBtn, modeImageBtn, modeVideoBtn].forEach(btn => {
        btn.style.background = "transparent";
        btn.style.color = "var(--text-color)";
    });
    audioSection.style.display = "none";
    textSection.style.display = "none";
    imageSection.style.display = "none";
    videoSection.style.display = "none";
    resultSection.classList.add("hidden");
}

modeAudioBtn.addEventListener("click", () => {
    resetTabs();
    currentMode = "AUDIO";
    modeAudioBtn.style.background = "var(--accent-color)";
    modeAudioBtn.style.color = "#000";
    audioSection.style.display = "block";
});

modeTextBtn.addEventListener("click", () => {
    resetTabs();
    currentMode = "TEXT";
    modeTextBtn.style.background = "var(--accent-color)";
    modeTextBtn.style.color = "#000";
    textSection.style.display = "block";
});

modeImageBtn.addEventListener("click", () => {
    resetTabs();
    currentMode = "IMAGE";
    modeImageBtn.style.background = "var(--accent-color)";
    modeImageBtn.style.color = "#000";
    imageSection.style.display = "block";
});

modeVideoBtn.addEventListener("click", () => {
    resetTabs();
    currentMode = "VIDEO";
    modeVideoBtn.style.background = "var(--accent-color)";
    modeVideoBtn.style.color = "#000";
    videoSection.style.display = "block";
});

/* --- 4. RECORDING LOGIC --- */
recordBtn.addEventListener("click", async () => {
    if (!isRecording) startRecording(); else stopRecording();
});

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        visualize(); 
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            uploadAudio(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorder.start();
        isRecording = true;
        btnText.textContent = "STOP RECORDING";
        statusText.textContent = "Listening...";
        recordBtn.style.borderColor = "#ff3b3b"; 
    } catch (err) { alert("Microphone access denied! Please allow permissions."); }
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
    btnText.textContent = "PROCESSING...";
    recordBtn.style.borderColor = "#00f2ff"; 
}

/* --- 5. UPLOAD HANDLERS --- */
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => { if (e.target.files[0]) uploadAudio(e.target.files[0]); });

imageDropArea.addEventListener("click", () => imageUploadInput.click());
imageUploadInput.addEventListener("change", (e) => { if (e.target.files[0]) uploadImage(e.target.files[0]); });

videoDropArea.addEventListener("click", () => videoUploadInput.click());
videoUploadInput.addEventListener("change", (e) => { if (e.target.files[0]) uploadVideo(e.target.files[0]); });

/* --- 6. API CALLS (Error Proof) --- */
async function uploadAudio(blob) {
    statusText.textContent = `Uploading to AWS...`;
    const formData = new FormData();
    formData.append("file", blob, "recording.wav");
    formData.append("user_id", currentUser); 
    try {
        const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server Error");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        lastResultData = data; lastResultData.type = "AUDIO"; displayResults(data);
    } catch (error) { 
        alert("Backend Error: " + error.message); 
        statusText.textContent = "Connection Failed."; 
    }
}

analyzeTextBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (text.length < 10) return alert("Enter more text.");
    textStatusText.textContent = "Analyzing patterns...";
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
        textStatusText.textContent = "Failed."; 
    }
});

async function uploadImage(file) {
    imageStatusText.textContent = "Scanning Metadata & Visual Artifacts...";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", currentUser);
    try {
        const res = await fetch(`${API_URL}/analyze_image`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server Error");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        lastResultData = data; lastResultData.type = "IMAGE"; 
        displayResults(data);
    } catch (error) { 
        alert("Backend Error: " + error.message); 
        imageStatusText.textContent = "Failed."; 
    }
}

async function uploadVideo(file) {
    if (file.size > 15 * 1024 * 1024) return alert("File too large! Max 15MB for demo.");
    videoStatusText.textContent = "Extracting Frames & Audio... This takes a moment.";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", currentUser);
    try {
        const res = await fetch(`${API_URL}/analyze_video`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server Error");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        lastResultData = data; lastResultData.type = "VIDEO"; 
        displayResults(data);
    } catch (error) { 
        alert("Backend Error: " + error.message); 
        videoStatusText.textContent = "Analysis Failed."; 
    }
}

/* --- 7. DISPLAY RESULTS --- */
function displayResults(data) {
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: 'smooth' });

    const verdictBox = document.getElementById("verdict-display");
    const confidenceText = document.getElementById("confidence-text");
    const confidenceFill = document.getElementById("confidence-fill");
    const scanId = document.getElementById("scan-id");

    verdictBox.textContent = data.verdict; 
    const color = data.verdict === "FAKE" ? "#ff3b3b" : "#00ff9d";
    verdictBox.style.color = color;
    confidenceFill.style.backgroundColor = color;
    confidenceText.textContent = data.confidence + "%";
    confidenceFill.style.width = data.confidence + "%";
    scanId.textContent = (data.scan_id || "UNK").substring(0, 8) + "...";

    // Toggle Evidence Containers
    audioEvidenceContainer.style.display = "none";
    textEvidenceContainer.style.display = "none";
    imageEvidenceContainer.style.display = "none";

    if (lastResultData.type === "AUDIO") {
        evidenceTitle.textContent = "Spectral Evidence";
        audioEvidenceContainer.style.display = "block";
        specImg.src = data.image_url; 
        statusText.textContent = "Analysis Complete.";
    } else if (lastResultData.type === "TEXT") {
        evidenceTitle.textContent = "Content Analysis";
        textEvidenceContainer.style.display = "block";
        evidenceText.textContent = `"${lastResultData.contentSnippet}"`;
        textStatusText.textContent = "Analysis Complete.";
    } else if (lastResultData.type === "IMAGE") {
        evidenceTitle.textContent = "Visual Analysis";
        imageEvidenceContainer.style.display = "block";
        analyzedImagePreview.src = data.image_url; 
        imageStatusText.textContent = "Analysis Complete.";
    } else if (lastResultData.type === "VIDEO") {
        evidenceTitle.textContent = "Visual Analysis";
        imageEvidenceContainer.style.display = "block";
        analyzedImagePreview.src = data.image_url; 
        videoStatusText.textContent = "Analysis Complete.";
    }

    // Forensics
    forensicList.innerHTML = ""; 
    if (data.forensics && Array.isArray(data.forensics)) {
        data.forensics.forEach(ind => {
            const li = document.createElement("li");
            li.textContent = ind;
            li.style.color = ind.includes("✅") ? "#00ff9d" : "#ff3b3b";
            li.style.marginBottom = "8px";
            forensicList.appendChild(li);
        });
    }
}

/* --- 8. VISUALIZER --- */
function visualize() {
    if (!isRecording) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        if (!isRecording) return;
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.fillStyle = '#0a0f1c'; 
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            let barHeight = dataArray[i] / 2;
            canvasCtx.fillStyle = `rgb(0, ${barHeight + 100}, 255)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    draw();
}

/* --- 9. PDF REPORT (Universal) --- */
if(downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
        if (!lastResultData) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(0, 40, 100); 
        doc.text("VOXSENTINEL | FORENSIC REPORT", 20, 20);

        doc.setFontSize(16); doc.setTextColor(0, 0, 0);
        doc.text(`Verdict: ${lastResultData.verdict}`, 20, 40);
        
        const color = lastResultData.verdict === "FAKE" ? [255, 0, 0] : [0, 255, 0];
        doc.setFillColor(...color); doc.rect(18, 45, 170, 2, "F"); 

        doc.setFont("helvetica", "normal"); doc.setFontSize(12); let y = 60;
        doc.text(`Scan ID:      ${lastResultData.scan_id || 'N/A'}`, 20, y); y += 10;
        doc.text(`Type:         ${lastResultData.type}`, 20, y); y += 10;
        doc.text(`Confidence:   ${lastResultData.confidence}%`, 20, y); y += 10;
        doc.text(`Timestamp:    ${new Date().toLocaleString()}`, 20, y); y += 20;

        doc.setFont("helvetica", "bold"); doc.text("Forensic Indicators:", 20, y); y += 10;
        doc.setFont("helvetica", "normal");
        
        if (lastResultData.forensics) {
            lastResultData.forensics.forEach(line => {
                const cleanLine = "- " + line.replace(/[^\x00-\x7F]/g, ""); 
                doc.text(cleanLine, 20, y); y += 10; 
            });
        }
        y += 10;

        // Evidence Link
        doc.setTextColor(0, 0, 255);
        if (lastResultData.image_url) {
            doc.textWithLink("View Visual Evidence (AWS S3)", 20, y, { url: lastResultData.image_url });
        }
        
        doc.save(`VoxSentinel_Report.pdf`);
    });
}
