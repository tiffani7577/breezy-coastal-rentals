import fs from "node:fs/promises";
import path from "node:path";
import {
  createDefaultPageContent,
  DRAFT_CONTENT_PATH,
  LIVE_CONTENT_PATH,
  parsePageContent,
  type PageContent,
} from "../shared/pageContent";

const GITHUB_REPO = process.env.GITHUB_REPO ?? "tiffani7577/breezy-coastal-rentals";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";

function getLocalPath(filePath: string): string {
  return path.resolve(process.cwd(), filePath);
}

function serializeContent(content: PageContent): string {
  return JSON.stringify(
    { ...content, updatedAt: new Date().toISOString() },
    null,
    2
  );
}

async function readLocalFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(getLocalPath(filePath), "utf-8");
  } catch {
    return null;
  }
}

async function writeLocalFile(filePath: string, body: string): Promise<void> {
  const fullPath = getLocalPath(filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, body, "utf-8");
}

type GitHubFileResult = { content: string; sha?: string };

async function readGitHubFile(filePath: string): Promise<GitHubFileResult | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Could not read ${filePath} from GitHub. Please try again. (${text.slice(0, 120)})`);
  }

  const data = (await res.json()) as { content?: string; sha?: string };
  if (!data.content) return null;
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

async function writeGitHubFile(
  filePath: string,
  body: string,
  message: string,
  sha?: string
): Promise<{ commitUrl: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GitHub is not connected yet. Ask your developer to add GITHUB_TOKEN in Vercel settings."
    );
  }

  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(body, "utf-8").toString("base64"),
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Could not save to GitHub. Please try again. (${text.slice(0, 160)})`);
  }

  const data = (await res.json()) as { commit?: { html_url?: string } };
  return { commitUrl: data.commit?.html_url ?? `https://github.com/${GITHUB_REPO}` };
}

async function readFileContent(filePath: string): Promise<GitHubFileResult | null> {
  const fromGitHub = await readGitHubFile(filePath);
  if (fromGitHub) return fromGitHub;
  const local = await readLocalFile(filePath);
  if (local) return { content: local };
  return null;
}

async function writeFileContent(
  filePath: string,
  body: string,
  message: string,
  sha?: string
): Promise<{ commitUrl?: string; savedLocally: boolean }> {
  if (process.env.GITHUB_TOKEN) {
    const result = await writeGitHubFile(filePath, body, message, sha);
    await writeLocalFile(filePath, body).catch(() => undefined);
    return { commitUrl: result.commitUrl, savedLocally: false };
  }

  await writeLocalFile(filePath, body);
  return { savedLocally: true };
}

export async function loadLivePageContent(): Promise<PageContent> {
  const file = await readFileContent(LIVE_CONTENT_PATH);
  if (!file?.content) return createDefaultPageContent();
  try {
    return parsePageContent(file.content);
  } catch {
    return createDefaultPageContent();
  }
}

export async function loadDraftPageContent(): Promise<PageContent> {
  const draft = await readFileContent(DRAFT_CONTENT_PATH);
  if (draft?.content) {
    try {
      return parsePageContent(draft.content);
    } catch {
      /* fall through */
    }
  }
  return loadLivePageContent();
}

export async function saveDraftPageContent(content: PageContent): Promise<{
  commitUrl?: string;
  savedLocally: boolean;
}> {
  const body = serializeContent(content);
  const existing = await readFileContent(DRAFT_CONTENT_PATH);
  return writeFileContent(
    DRAFT_CONTENT_PATH,
    body,
    "Save page editor draft",
    existing?.sha
  );
}

export async function deployPageContent(content: PageContent): Promise<{
  commitUrl?: string;
  savedLocally: boolean;
}> {
  const body = serializeContent(content);
  const liveExisting = await readFileContent(LIVE_CONTENT_PATH);
  const draftExisting = await readFileContent(DRAFT_CONTENT_PATH);

  if (process.env.GITHUB_TOKEN) {
    const liveResult = await writeGitHubFile(
      LIVE_CONTENT_PATH,
      body,
      "Publish homepage content from Page Editor",
      liveExisting?.sha
    );
    await writeGitHubFile(
      DRAFT_CONTENT_PATH,
      body,
      "Sync draft with published homepage content",
      draftExisting?.sha
    ).catch(() => undefined);
    await writeLocalFile(LIVE_CONTENT_PATH, body).catch(() => undefined);
    await writeLocalFile(DRAFT_CONTENT_PATH, body).catch(() => undefined);
    return { commitUrl: liveResult.commitUrl, savedLocally: false };
  }

  await writeLocalFile(LIVE_CONTENT_PATH, body);
  await writeLocalFile(DRAFT_CONTENT_PATH, body);
  return { savedLocally: true };
}

export async function ensureContentFilesExist(): Promise<void> {
  const live = await readLocalFile(LIVE_CONTENT_PATH);
  if (!live) {
    const defaults = serializeContent(createDefaultPageContent());
    await writeLocalFile(LIVE_CONTENT_PATH, defaults);
    await writeLocalFile(DRAFT_CONTENT_PATH, defaults);
  }
}
