const CHANNEL_NAME = "bl-dashboard-sync";

export const createSyncChannel = (onMessage) => {
  if (typeof window === "undefined" || !window.BroadcastChannel) return null;

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => {
    onMessage(event.data);
  };

  return {
    postMessage: (msg) => channel.postMessage(msg),
    close: () => channel.close(),
  };
};
