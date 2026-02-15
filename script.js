/* --- CONFIGURATION --- */
const API_URL = "https://newark-canyon-dollars-earlier.trycloudflare.com/analyze"; 

/* --- DOM ELEMENTS --- */
const recordBtn = document.getElementById("recordBtn");
const btnText = document.getElementById("btnText");
const statusText = document.getElementById("status-text");
const canvas = document.getElementById("audio-visualizer");
const canvasCtx = canvas.getContext("2d");
const resultSection = document.getElementById("result-section");
const themeBtn = document.getElementById("theme-btn");

// Login Elements (These were missing before!)
const loginOverlay = document.getElementById("login-overlay");
const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("username-input");

// Download Element (This was missing before!)
const downloadBtn = document.getElementById("download-report");

/* --- STATE VARIABLES --- */
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioContext;
let analyser;
let source;
let currentUser = "Unknown_Agent"; // Default
let lastResultData = null; 

/* --- 1. THEME TOGGLE --- */
themeBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    if (currentTheme === "light") {
        document.body.setAttribute("data-theme", "dark");
        themeBtn.textContent = "🌗";
    } else {
        document.body.setAttribute("data-theme", "light");
        themeBtn.textContent = "☀️";
    }
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

/* --- 3. RECORDING LOGIC --- */
recordBtn.addEventListener("click", async () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
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

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

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
        
    } catch (err) {
        alert("Microphone access denied! Please allow permission.");
        console.error(err);
    }
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
    btnText.textContent = "PROCESSING...";
    recordBtn.style.borderColor = "#00f2ff"; 
}
/* --- FILE UPLOAD LOGIC (NEW) --- */
const fileInput = document.getElementById("fileUpload");
const uploadBtn = document.getElementById("uploadBtn");

// 1. Link the "Upload" button to the hidden file input
uploadBtn.addEventListener("click", () => {
    fileInput.click();
});

// 2. Listen for when a file is selected
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        // reuse the existing upload function!
        uploadAudio(file);
    }
});
/* --- 4. SEND TO AWS (THE FIX FOR 422 ERROR) --- */
async function uploadAudio(blob) {
    statusText.textContent = `Uploading to AWS as ${currentUser}...`;
    
    const formData = new FormData();
    formData.append("file", blob, "recording.wav");
    
    // THIS IS THE KEY FIX: Sending the User ID!
    formData.append("user_id", currentUser); 

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server Error: " + response.status);

        const data = await response.json();
        lastResultData = data; 
        displayResults(data);

    } catch (error) {
        console.error("Error:", error);
        statusText.textContent = "Connection Failed. Check Console.";
        btnText.textContent = "RETRY SCAN";
    }
}

/* --- 5. DISPLAY RESULTS --- */
function displayResults(data) {
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: 'smooth' });

    const verdictBox = document.getElementById("verdict-display");
    const confidenceText = document.getElementById("confidence-text");
    const confidenceFill = document.getElementById("confidence-fill");
    const specImg = document.getElementById("spectrogram-img");
    const scanId = document.getElementById("scan-id");
    const scanTime = document.getElementById("scan-time");

    verdictBox.textContent = data.verdict; 
    
    if (data.verdict === "FAKE") {
        verdictBox.style.color = "#ff3b3b"; 
        confidenceFill.style.backgroundColor = "#ff3b3b";
    } else {
        verdictBox.style.color = "#00ff9d"; 
        confidenceFill.style.backgroundColor = "#00ff9d";
    }

    confidenceText.textContent = data.confidence + "%";
    confidenceFill.style.width = data.confidence + "%";
    
    specImg.src = data.image_url; 
    
    scanId.textContent = data.scan_id.substring(0, 8) + "..."; 
    scanTime.textContent = new Date().toLocaleTimeString();

    btnText.textContent = "START NEW SCAN";
    statusText.textContent = "Analysis Complete. Data logged.";
}

/* --- 6. VISUALIZER --- */
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
            barHeight = dataArray[i] / 2;
            canvasCtx.fillStyle = `rgb(0, ${barHeight + 100}, 255)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    draw();
}

/* --- 7. DOWNLOAD PDF --- */
if(downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
        if (!lastResultData) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 40, 100); 
        doc.text("VOXSENTINEL | FORENSIC REPORT", 20, 20);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Verdict: ${lastResultData.verdict}`, 20, 40);
        
        if (lastResultData.verdict === "FAKE") {
            doc.setFillColor(255, 0, 0); 
            doc.rect(18, 45, 170, 2, "F"); 
        } else {
            doc.setFillColor(0, 255, 0); 
            doc.rect(18, 45, 170, 2, "F");
        }

        doc.setFont("courier", "normal");
        doc.setFontSize(12);
        let y = 60;
        doc.text(`Scan ID:      ${lastResultData.scan_id}`, 20, y); y += 10;
        doc.text(`Agent ID:     ${currentUser}`, 20, y); y += 10;
        doc.text(`Confidence:   ${lastResultData.confidence}%`, 20, y); y += 10;
        doc.text(`Timestamp:    ${new Date().toLocaleString()}`, 20, y); y += 20;

        doc.setTextColor(0, 0, 255);
        doc.textWithLink("Click to View Audio Evidence", 20, y, { url: lastResultData.audio_url }); y += 10;
        doc.textWithLink("Click to View Spectral Image", 20, y, { url: lastResultData.image_url });

        doc.save(`VoxSentinel_Report_${lastResultData.scan_id.substring(0,8)}.pdf`);
    });
}