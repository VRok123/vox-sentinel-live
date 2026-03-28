/**
 * API Service Hooks for VoxSentinel
 * DO NOT EDIT: Preserving the exact backend logic and payload structures designed for the Python Server.
 */

const API_URL = "https://towards-assists-nomination-liz.trycloudflare.com"; 

/**
 * Upload Audio File for Forensic Scan
 * Payload: { file: File/Blob, user_id: string }
 */
export const analyzeAudio = async (fileBlob, userId) => {
    // Placeholder function matched exactly to the previous script.js
    const formData = new FormData(); 
    formData.append("file", fileBlob, "recording.wav"); 
    formData.append("user_id", userId); 

    try {
        const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server Error");
        return await res.json();
    } catch (error) { 
        throw new Error("Backend Error: " + error.message); 
    }
};

/**
 * Upload Image File for Forensic Scan
 * Payload: { file: File/Blob, user_id: string }
 */
export const analyzeImage = async (file, userId) => {
    const formData = new FormData(); 
    formData.append("file", file); 
    formData.append("user_id", userId);
    try {
        const res = await fetch(`${API_URL}/analyze_image`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server Error");
        return await res.json();
    } catch (error) { 
        throw new Error("Backend Error: " + error.message); 
    }
};

/**
 * Upload Video (MP4) File for Forensic Scan
 * Payload: { file: File/Blob, user_id: string }
 */
export const analyzeVideo = async (file, userId) => {
    const formData = new FormData(); 
    formData.append("file", file); 
    formData.append("user_id", userId);
    try {
        const res = await fetch(`${API_URL}/analyze_video`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server Error");
        return await res.json();
    } catch (error) { 
        throw new Error("Backend Error: " + error.message); 
    }
};

/**
 * Analyze Text snippet
 * Payload: { text: string, user_id: string }
 */
export const analyzeText = async (text, userId) => {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("user_id", userId);
    try {
        const res = await fetch(`${API_URL}/analyze_text`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Server Error");
        return await res.json();
    } catch (error) { 
        throw new Error("Backend Error: " + error.message); 
    }
};
