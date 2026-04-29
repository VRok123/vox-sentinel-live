/* --- CONFIGURATION --- */
const API_URL = "https://downloading-fin-bool-for.trycloudflare.com"; // Keep your active URL here

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
const imageLaser = document.getElementById("image-laser");

const videoDropArea = document.getElementById("video-drop-area");
const videoUploadInput = document.getElementById("videoUploadInput");
const videoStatusText = document.getElementById("video-status-text");
const videoLaser = document.getElementById("video-laser");

// Result Elements
const forensicList = document.getElementById("forensic-list");
const confidenceText = document.getElementById("confidence-text");
const confidenceFill = document.getElementById("confidence-fill");
const verdictDisplay = document.getElementById("verdict-display");

let currentUser = "Unknown_Agent";
let lastResultData = null; 
let currentMode = "AUDIO"; 

// Audio Recording Variables
let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let source;
let animationId;

/* --- UI: THEME & LOGIN TERMINAL SEQUENCE --- */
themeBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    document.body.setAttribute("data-theme", currentTheme === "light" ? "dark" : "light");
    themeBtn.textContent = currentTheme === "light" ? "🌗" : "☀️";
});

document.getElementById("login-btn").addEventListener("click", async () => {
    const name = document.getElementById("username-input").value.trim();
    if (name.length > 2) {
        currentUser = name;
        
        // Hide inputs, show terminal
        document.getElementById("username-input").classList.add("hidden");
        document.getElementById("login-btn").classList.add("hidden");
        document.getElementById("login-desc").classList.add("hidden");
        
        const terminal = document.getElementById("terminal-output");
        terminal.classList.remove("hidden");
        terminal.innerHTML = "";
        
        const lines = [
            "> Initializing Secure Connection...",
            `> Authenticating Agent: ${name}...`,
            "> Bypassing Biometric Lock...",
            "> Establishing AWS Quantum Tunnel (us-east-1)...",
            "> ACCESS GRANTED."
        ];
        
        for (let i = 0; i < lines.length; i++) {
            await new Promise(r => setTimeout(r, 400));
            terminal.innerHTML += `<div class="terminal-line">${lines[i]}</div>`;
        }
        
        await new Promise(r => setTimeout(r, 800));
        document.getElementById("login-overlay").style.opacity = "0";
        setTimeout(() => document.getElementById("login-overlay").classList.add("hidden"), 500);
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
        Object.values(modeBtns).forEach(btn => btn.classList.remove("active"));
        Object.values(sections).forEach(sec => sec.classList.add("hidden"));
        resultSection.classList.add("hidden");

        modeBtns[key].classList.add("active");
        sections[key].classList.remove("hidden");
        
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


/* --- AUDIO: LIVE MICROPHONE & VISUALIZER --- */
recordBtn.addEventListener("click", toggleRecording);

async function toggleRecording() {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startVisualizer(stream);
            
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                uploadAudio(audioBlob);
                audioChunks = [];
            };
            
            mediaRecorder.start();
            isRecording = true;
            btnText.textContent = "🛑 STOP & ANALYZE";
            recordBtn.style.borderColor = "var(--danger-color)";
            recordBtn.style.color = "var(--danger-color)";
            statusText.textContent = "Recording Live Audio...";
            
        } catch (err) {
            alert("Microphone access denied. Please allow microphone permissions.");
        }
    } else {
        mediaRecorder.stop();
        stopVisualizer();
        isRecording = false;
        btnText.textContent = "INITIATE MIC SCAN";
        recordBtn.style.borderColor = "var(--accent-color)";
        recordBtn.style.color = "var(--accent-color)";
    }
}

function startVisualizer(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for(let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            
            // Cyberpunk Glow Effect
            canvasCtx.fillStyle = `rgb(0, ${242 - (barHeight/2)}, 255)`; 
            canvasCtx.shadowBlur = 10;
            canvasCtx.shadowColor = "rgba(0, 242, 255, 0.8)";
            
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 2;
        }
    }
    draw();
}

function stopVisualizer() {
    if (animationId) cancelAnimationFrame(animationId);
    if (source) source.disconnect();
    if (audioContext) audioContext.close();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}


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
    imageLaser.classList.remove("hidden"); // Start Laser
    const formData = new FormData(); formData.append("file", file); formData.append("user_id", currentUser);
    try {
        const res = await fetch(`${API_URL}/analyze_image`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error); // Safety Check
        lastResultData = data; lastResultData.type = "IMAGE"; displayResults(data);
    } catch (error) { alert("Backend Error: " + error.message); }
    imageStatusText.textContent = "Ready for input...";
    imageLaser.classList.add("hidden"); // Stop Laser
}

async function uploadVideo(file) {
    if (file.size > 15 * 1024 * 1024) return alert("File too large! Max 15MB for demo.");
    videoStatusText.textContent = "Extracting Frames & Audio... This takes a moment.";
    videoLaser.classList.remove("hidden"); // Start Laser
    const formData = new FormData(); formData.append("file", file); formData.append("user_id", currentUser);
    try {
        const res = await fetch(`${API_URL}/analyze_video`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error); // Safety Check
        lastResultData = data; lastResultData.type = "VIDEO"; displayResults(data);
    } catch (error) { alert("Backend Error: " + error.message); }
    videoStatusText.textContent = "Ready for input...";
    videoLaser.classList.add("hidden"); // Stop Laser
}

async function uploadAudio(blob) {
    statusText.textContent = `Uploading to AWS Neural Engine...`;
    const formData = new FormData(); formData.append("file", blob, "recording.wav"); formData.append("user_id", currentUser); 
    try {
        const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error); // Safety Check
        lastResultData = data; lastResultData.type = "AUDIO"; displayResults(data);
    } catch (error) { alert("Backend Error: " + error.message); }
    statusText.textContent = "Ready for input...";
}

/* --- ANIMATED RESULTS DISPLAY --- */
function displayResults(data) {
    resultSection.classList.remove("hidden");
    resultSection.classList.add("fade-in");
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const scanId = document.getElementById("scan-id");

    // Verdict styling & Glitch Logic
    verdictDisplay.textContent = data.verdict; 
    verdictDisplay.setAttribute('data-text', data.verdict); // For glitch effect
    
    if (data.verdict === "FAKE") {
        verdictDisplay.style.color = "var(--danger-color)";
        confidenceFill.style.backgroundColor = "var(--danger-color)";
        verdictDisplay.classList.add("glitch");
    } else {
        verdictDisplay.style.color = data.verdict === "SUSPICIOUS" ? "orange" : "var(--success-color)";
        confidenceFill.style.backgroundColor = data.verdict === "SUSPICIOUS" ? "orange" : "var(--success-color)";
        verdictDisplay.classList.remove("glitch");
    }
    
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

    // Staggered Decryption Forensics List
    forensicList.innerHTML = ""; 
    if (data.forensics && Array.isArray(data.forensics)) {
        data.forensics.forEach((ind, index) => {
            const li = document.createElement("li");
            li.className = "forensic-item";
            
            if (ind.includes("✅")) li.style.borderColor = "var(--success-color)";
            else if (ind.includes("⚠️")) li.style.borderColor = "var(--danger-color)";
            else li.style.borderColor = "var(--accent-color)";
            
            li.style.animationDelay = `${index * 0.15}s`; 
            forensicList.appendChild(li);
            
            // Trigger the hacker decryption effect
            decryptText(li, ind, index * 150);
        });
    }
}

// Hacker Decryption Effect Helper
function decryptText(element, finalString, delay) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+";
    let iterations = 0;
    const maxIterations = 10;
    
    setTimeout(() => {
        const interval = setInterval(() => {
            element.textContent = finalString.split('').map((char, index) => {
                if(index < iterations * (finalString.length / maxIterations)) {
                    return finalString[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            
            if(iterations >= maxIterations){
                clearInterval(interval);
                element.textContent = finalString; // Ensure exact final string
            }
            iterations++;
        }, 30);
    }, delay);
}

// Fixed Animation helper for Floating Point numbers
function animateValue(id, start, end, duration) {
    let startTimestamp = null;
    const obj = document.getElementById(id);
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        let currentVal = (progress * (end - start) + start).toFixed(2);
        obj.innerHTML = currentVal + "%";
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
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
