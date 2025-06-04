const startButton = document.getElementById("start-timer");
const stopButton = document.getElementById("stop-timer");
const resetButton = document.getElementById("reset-timer");
const timerDisplay = document.getElementById("timer-display");
const timerSlider = document.getElementById("timer-slider");
const countdownDisplay = document.getElementById("countdown-display");

// Update timer display and save focus time to storage
timerSlider.addEventListener("input", () => {
  const focusTime = timerSlider.value;
  timerDisplay.textContent = `${focusTime}:00`;

  // Store the focus time setting
  chrome.storage.sync.set({ focusTimeSetting: focusTime });
});

// Retrieve the saved focus time on load
chrome.storage.sync.get("focusTimeSetting", (data) => {
  if (data.focusTimeSetting) {
    const focusTime = data.focusTimeSetting;
    timerSlider.value = focusTime;
    timerDisplay.textContent = `${focusTime}:00`;
  }
});

// Start timer
startButton.addEventListener("click", () => {
  const duration = parseInt(timerSlider.value, 10);
  chrome.runtime.sendMessage({ command: "startTimer", duration });
});

// Stop timer
stopButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "stopTimer" });
});

// Reset timer
resetButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "resetTimer" });
});

// Request current countdown state when popup opens
chrome.runtime.sendMessage({ command: "requestCountdownState" }, (response) => {
  if (response && typeof response.remainingSeconds === "number") {
    updateCountdownDisplay(response.remainingSeconds);
  }
});

// Unified message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.command) return;

  switch (message.command) {
    case "updateCountdown":
      updateCountdownDisplay(message.remainingSeconds);
      break;

    case "timerFinished":
      showCompletionNotification();
      break;

    default:
      break;
  }
});

function updateCountdownDisplay(remainingSeconds) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  countdownDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function showCompletionNotification() {
  chrome.notifications.create({
    type: "basic",
    title: "Simple Focus Mode",
    message: "Focus Time Finished!",
    iconUrl: "../icons/icon16.png",
  });

  const audio = new Audio(chrome.runtime.getURL("./clock_alarm.mp3"));
  audio.play().catch((err) => console.warn("Failed to play audio:", err));
}
