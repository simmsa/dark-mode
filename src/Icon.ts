class Icon {
  public static turnOn() {
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-on-19.png",
        38: "img/dark-mode-on-38.png",
      },
    });
  }

  public static turnOff() {
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-off-19.png",
        38: "img/dark-mode-off-38.png",
      },
    });
  }
}

export default Icon;
