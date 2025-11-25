import { readdir, readFile } from "fs/promises";
import { join } from "path";

let cachedChannels = null;

async function loadAllChannels() {
  if (cachedChannels) {
    return cachedChannels;
  }

  const channels = new Map();
  const channelDirs = await readdir(join(exportDir, "Messages"), { withFileTypes: true });
  for (const channelDir of channelDirs) {
    if (!channelDir.isDirectory()) continue; // index.json
    const channel = JSON.parse(await readFile(join(exportDir, channelDir.name, "channel.json")));
    channels.set(channel.id, { dir: channelDir.name, channel });
  }

  cachedChannels = channels;
  return channels;
}

export async function getAllGuildIdsFromExport(exportDir) {
  const guildIds = new Set();
  const channels = await loadAllChannels();

  for (const [, { channel }] of channels) {
    if (channel.guild) guildIds.add(channel.guild.id);
  }

  return [...guildIds];
}

export async function getAllDmIdsFromExport(exportDir) {
  const dmIds = [];

  const channels = await loadAllChannels();
  for (const [, { channel }] of channels) {
    if (channel.type === "DM") dmIds.push(channel.id);
  }

  return dmIds;
}

export async function getAllMessagesFromExport(exportDir, channelId) {
  const channels = await loadAllChannels();
  const channel = channels.get(channelId);
  const messages = JSON.parse(await readFile(join(exportDir, channel.dir, "Messages.json")));
}
