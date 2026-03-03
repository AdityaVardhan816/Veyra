import { UserRole } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

type DevUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  image: string | null;
};

const globalStore = globalThis as unknown as { devAuthUsers?: Map<string, DevUser> };
const devAuthStorePath = path.join(process.cwd(), ".dev-auth-users.json");

function loadUsersFromDisk() {
  try {
    if (!fs.existsSync(devAuthStorePath)) {
      return new Map<string, DevUser>();
    }

    const raw = fs.readFileSync(devAuthStorePath, "utf8");
    const parsed = JSON.parse(raw) as DevUser[];
    return new Map(parsed.map((user) => [user.email, user]));
  } catch {
    return new Map<string, DevUser>();
  }
}

function saveUsersToDisk(users: Map<string, DevUser>) {
  try {
    fs.writeFileSync(devAuthStorePath, JSON.stringify([...users.values()], null, 2), "utf8");
  } catch {
    // ignore persistence errors in local dev fallback
  }
}

if (!globalStore.devAuthUsers) {
  globalStore.devAuthUsers = loadUsersFromDisk();
}

const usersByEmail = globalStore.devAuthUsers;

export function findDevUserByEmail(email: string) {
  return usersByEmail.get(email.toLowerCase().trim()) ?? null;
}

export function findDevUserByEmailOrUsername(email: string, username: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim().toLowerCase();

  for (const user of usersByEmail.values()) {
    if (user.email === normalizedEmail || user.username.toLowerCase() === normalizedUsername) {
      return user;
    }
  }

  return null;
}

export function createDevUser(input: { email: string; username: string; passwordHash: string }) {
  const user: DevUser = {
    id: crypto.randomUUID(),
    email: input.email.toLowerCase().trim(),
    username: input.username.trim(),
    name: input.username.trim(),
    passwordHash: input.passwordHash,
    role: UserRole.USER,
    image: null,
  };

  usersByEmail.set(user.email, user);
  saveUsersToDisk(usersByEmail);
  return user;
}
