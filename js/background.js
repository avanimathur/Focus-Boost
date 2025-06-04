let startTime;
let endTime;
let countdownInterval = null;
let countdownState = {
  remainingSeconds: null,
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "startTimer") {
      const now = new Date().getTime();

      // If resuming a stopped timer
      let durationInSeconds;
      if (countdownState.remainingSeconds !== null) {
        durationInSeconds = countdownState.remainingSeconds;
      } else {
        durationInSeconds = message.duration * 60;
      }

      startTime = now;
      endTime = startTime + durationInSeconds * 1000;

      clearInterval(countdownInterval);

      countdownInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const remainingSeconds = Math.round((endTime - currentTime) / 1000);

        if (remainingSeconds <= 0) {
          clearInterval(countdownInterval);
          countdownState.remainingSeconds = null;
          chrome.runtime.sendMessage({ command: "timerFinished" });
        } else {
          countdownState.remainingSeconds = remainingSeconds;
          chrome.runtime.sendMessage({
            command: "updateCountdown",
            remainingSeconds,
          });
        }
      }, 1000);
      } else if (message.command === "stopTimer") {
        clearInterval(countdownInterval);
        const currentTime = new Date().getTime();
        countdownState.remainingSeconds = Math.round((endTime - currentTime) / 1000);
      } else if (message.command === "resetTimer") {
        clearInterval(countdownInterval);
        chrome.storage.sync.get("focusTimeSetting", (data) => {
          const defaultMinutes = parseInt(data.focusTimeSetting || 25, 10);
          countdownState.remainingSeconds = defaultMinutes * 60;

          // Optionally update startTime and endTime if you want to restart countdown immediately
          startTime = new Date().getTime();
          endTime = startTime + countdownState.remainingSeconds * 1000;

          // Send updated countdown to popup
          chrome.runtime.sendMessage({
            command: "updateCountdown",
            remainingSeconds: countdownState.remainingSeconds
          });
        });
      } else if (message.command === "requestCountdownState") {
        sendResponse(countdownState);
      } else {
      // Catch-all for any other messages
      sendResponse({ received: true });
      }
    });
    