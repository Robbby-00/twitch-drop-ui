const { default: axios } = require("axios");
const { readFileSync, createWriteStream, existsSync, unlinkSync, rmSync, dirname } = require("fs");
const unzipper = require("unzipper");
const { spawn } = require("node:child_process");
const { mkdirSync } = require("node:fs");

function getCurrentVersion() {
    try {
        return readFileSync("version", {
            encoding: "utf-8",
        });
    } catch {
        console.log("Failed to read current version");
        return undefined;
    }
}

async function computeGithubResponse(res, currentVersion) {
    if (!("tag_name" in res)) {
        console.log("Bad github response!");
        return false;
    }

    if (currentVersion === undefined || res["tag_name"] !== currentVersion) {
        // Download update
        console.log(`Find new version: ${res["tag_name"]}\nDownloading update...`);

        try {
            const response = await axios({
                url: res["assets"][0]["browser_download_url"],
                method: "GET",
                responseType: "stream",
            });

            if (response.status !== 200) {
                console.log(`Failed to download update! status code: ${res.statusCode}`);
                return false;
            }

            await streamUpdate(response.data.pipe(unzipper.Parse()));
            return true;
        } catch (err) {
            console.log(`Failed to download, Error: ${err.name}`);
            console.error(err);
        }
    } else console.log("Current version is up to date!");

    return false;
}

async function streamUpdate(stream) {
    return new Promise((resolve, reject) => {
        stream.on("entry", (entry) => {
            const path = entry.path;
            const type = entry.type;

            if (type === "File") {
                // Replace files
                if (existsSync(path)) {
                    unlinkSync(path);
                }

                // Create dirs if missing
                const dir = dirname(path);
                if (!existsSync(dir)) {
                    mkdirSync(dir, { recursive: true });
                }

                entry.pipe(createWriteStream(path));
            } else entry.autodrain();
        });

        stream.on("end", () => {
            resolve("end");
        });

        stream.on("finish", () => {
            resolve("finish");
        });

        stream.on("error", (error) => {
            reject(error);
        });
    });
}

async function main() {
    const version = getCurrentVersion();

    try {
        const response = await axios.get("https://api.github.com/repos/Robbby-00/twitch-drop-ui/releases/latest", {
            timeout: 5000,
        });

        if (await computeGithubResponse(response.data, version)) {
            // succesfully update
            console.log("Reinstalling dependencies...");
            rmSync("node_modules", { recursive: true });

            const proc_name = process.platform === "win32" ? "npm.cmd" : "npm";
            const npm = spawn(proc_name, ["install"], { shell: true });

            await new Promise((resolve) => {
                npm.on("close", (code) => {
                    if (code === 0) {
                        console.log("Succesfully updated");
                    } else console.log("Something goes wrong!");

                    resolve();
                });
            });
        }
    } catch (err) {
        console.log("Failed to retrive latest release!");
    }
}

const autoUpdate = process.env.AUTO_UPDATE ?? true;

if (autoUpdate) {
    main();
}
