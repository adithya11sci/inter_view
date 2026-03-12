import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import axios from 'axios';
import { promises as fs } from "fs";
import path from "path";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  try {
    // List available Edge TTS voices
    const voices = [
      { name: "en-US-AvaNeural", language: "English (US)", gender: "Female" },
      { name: "en-US-EmmaNeural", language: "English (US)", gender: "Female" },
      { name: "en-US-JennyNeural", language: "English (US)", gender: "Female" },
      { name: "en-GB-SoniaNeural", language: "English (UK)", gender: "Female" },
      { name: "en-US-GuyNeural", language: "English (US)", gender: "Male" },
      { name: "en-US-ChristopherNeural", language: "English (US)", gender: "Male" }
    ];
    res.send(voices);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch voices" });
  }
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command Failed: ${command}`);
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) console.warn(`Command Stderr: ${stderr}`);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const mp3FileName = `audios/message_${message}.mp3`;
  const wavFileName = `audios/message_${message}.wav`;
  const jsonFileName = `audios/message_${message}.json`;

  try {
    // Check if the MP3 file exists
    await fs.access(mp3FileName);
    console.log(`Converting ${mp3FileName} to WAV`);
    await execCommand(`ffmpeg -y -i ${mp3FileName} ${wavFileName}`);
    console.log(`Conversion done`);

    // Check for Rhubarb binary (Windows or Mac)
    const rhubarbPathWindows = path.join(process.cwd(), "bin", "rhubarb", "Rhubarb-Lip-Sync-1.14.0-Windows", "rhubarb.exe");
    const rhubarbPathMac = path.join(process.cwd(), "bin", "Rhubarb-Lip-Sync-1.13.0-macOS", "rhubarb");
    let rhubarbExecutable = rhubarbPathWindows;

    try {
      await fs.access(rhubarbPathWindows);
      rhubarbExecutable = rhubarbPathWindows;
    } catch {
      try {
        await fs.access(rhubarbPathMac);
        rhubarbExecutable = rhubarbPathMac;
      } catch {
        // Fallback to searching in PATH if not found in bin
        try {
          await execCommand("rhubarb --version");
          rhubarbExecutable = "rhubarb";
        } catch {
          console.warn("Rhubarb binary not found. Using basic lip sync.");
          // Create basic lip sync based on audio duration
          const basicLipsync = await createBasicLipsync(mp3FileName);
          await fs.writeFile(jsonFileName, JSON.stringify(basicLipsync));
          return;
        }
      }
    }

    await execCommand(`"${rhubarbExecutable}" -f json -o "${jsonFileName}" "${wavFileName}" -r phonetic`);
    console.log(`Lip sync done`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Audio file not found: ${mp3FileName}`);
      return { error: "Audio file not generated" };
    } else {
      console.error("Error in lipSyncMessage:", error);
      // Ensure a file exists preventing frontend crash
      try { await fs.writeFile(jsonFileName, JSON.stringify({ mouthCues: [] })); } catch { }
    }
  }
};

// Create basic lip sync when Rhubarb is not available
const createBasicLipsync = async (audioFile) => {
  try {
    // Get audio duration using ffprobe
    const output = await execCommand(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`);
    const duration = parseFloat(output.trim()) || 3;
    
    // Create simple alternating mouth movements
    const mouthCues = [];
    const phonemes = ['A', 'B', 'C', 'D', 'E', 'F'];
    const segmentDuration = 0.1; // 100ms per phoneme
    
    for (let i = 0; i < duration; i += segmentDuration) {
      mouthCues.push({
        start: i,
        end: Math.min(i + segmentDuration, duration),
        value: phonemes[Math.floor(Math.random() * phonemes.length)]
      });
    }
    
    return { mouthCues };
  } catch (error) {
    console.error("Error creating basic lipsync:", error);
    return { mouthCues: [] };
  }
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hello. I am Sona, your professional interview assistant. I am ready to assist you.",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "Please ask me a question or let's start a mock interview session.",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "smile",
          animation: "Talking_2",
        },
      ],
    });
    return;
  }
  // edge-tts doesn't require an API key, so we can proceed directly to generation

  // Send request to FastAPI server
  let responseData;
  try {
    const response = await axios.post('http://127.0.0.1:8000/generate', { prompt: userMessage });
    responseData = response.data.text;
  } catch (apiError) {
    console.error("FastAPI Error:", apiError.message);
    res.status(500).send({ error: "LLM Backend connection failed" });
    return;
  }

  console.log("DEBUG: Raw Response from LLM:", responseData);

  try {
    // Sanitize LLM response by removing potential non-JSON noise if any remained
    let jsonString = responseData.trim();

    // Robust JSON extraction
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    let messages;
    try {
      messages = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("DEBUG: JSON Parse failed for string:", jsonString);
      console.error("Original response was:", responseData);

      // Fallback: Create a professional message if parsing fails
      messages = {
        messages: [
          {
            text: "I apologize, but I encountered a technical issue processing your request. Could you please rephrase your question?",
            facialExpression: "sad",
            animation: "Talking_0"
          }
        ]
      };
    }

    if (messages.messages) {
      messages = messages.messages;
    } else if (Array.isArray(messages)) {
      // already an array
    } else {
      // unexpected format, wrap it
      messages = [messages];
    }

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      // ensure basic fields exist
      if (!message.text) message.text = "...";
      if (!message.facialExpression) message.facialExpression = "default";
      if (!message.animation) message.animation = "Idle";

      // generate audio file
      const fileName = `audios/message_${i}.mp3`;
      const textInput = message.text;

      console.log(`[${i}] Text to Speech requested: "${textInput.substring(0, 20)}..."`);

      try {
        await fs.unlink(fileName);
      } catch (e) { }

      try {
        // Using edge-tts CLI for Text to Speech
        // Professional voice: en-US-AvaNeural (or en-US-EmmaNeural, en-GB-SoniaNeural)
        const voice = "en-US-AvaNeural";
        const rate = "+10%"; // Faster speech for quicker response
        await execCommand(`edge-tts --text "${textInput.replace(/"/g, '\\"')}" --voice ${voice} --rate ${rate} --write-media ${fileName}`);
        console.log(`[${i}] Audio generated via edge-tts.`);

        // Generate lipsync immediately after audio
        await lipSyncMessage(i);
      } catch (voiceError) {
        console.error(`[${i}] edge-tts Error:`, voiceError.message);
        // Create empty lipsync on error
        try {
          await fs.writeFile(`audios/message_${i}.json`, JSON.stringify({ mouthCues: [] }));
        } catch (e) {}
      }

      try {
        message.audio = await audioFileToBase64(fileName);
      } catch (e) {
        console.warn(`[${i}] Audio file missing/failed, handling gracefully.`);
        // We might want a silent fallback audio if it's strictly required by frontend
        message.audio = "";
      }

      try {
        message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      } catch (e) {
        message.lipsync = { mouthCues: [] };
      }
    }

    res.send({ messages });
  } catch (error) {
    console.error("Error processing response:", error);
    res.status(500).send({ error: "Failed to process AI response" });
  }

});

const readJsonTranscript = async (file) => {
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON transcript from ${file}:`, error);
    throw error;
  }
};

const audioFileToBase64 = async (file) => {
  try {
    const data = await fs.readFile(file);
    console.log(`Read file ${file} successfully.`);
    return data.toString("base64");
  } catch (error) {
    console.error(`Error reading audio file ${file}:`, error);
    throw error;
  }
};

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});

