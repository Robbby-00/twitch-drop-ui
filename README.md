# Twitch Drop UI

This bot is designed to run continuously to farm reward on Twitch. Its primary features include:

-   **Tracking Twitch Campaigns**: Automatically collects Twitch Drops for selected games or specific campaign.
-   **Channel Points Farming**: Accumulates channel points from your favorite streamers effortlessly.

The bot is **lightweight and efficient**, avoiding the use of _Selenium or similar services_ to watch streams, resulting in virtually zero bandwidth usage. Puppeteer is utilized only once every 16 hours to securely authenticate and obtain Twitch's integrity token.

### How it Works

This bot can watch streams **simultaneously** (_but only one at a time due to Twitch's drop restrictions_). The bot requests only stream metadata, making it **lightweight and efficient**. This is sufficient to earn channel points or claim drops.

For **Twitch Drop Campaigns**, you can choose to manually add specific campaigns you want to claim rewards from. Alternatively, you can set a tracked game, or enable automatic claiming for all campaigns linked to your account. When a tracked game is configured, the bot will automatically watch and claim rewards from all campaigns associated with that game.

As for **channel points**, the bot acts as a simple AFK farmer, watching a specific stream to accumulate points.

## Enviroments

The data can be provided either through the **.env** file in the root folder or via system environment variables.

| Variable        | Description                                          | Default Value | Required |
| --------------- | ---------------------------------------------------- | ------------- | -------- |
| `ACCESS_TOKEN`  | **_Twitch OAuth Token_**                             | `None`        | ✅       |
| `WEB_PORT`      | Port to access **web app**                           | `3000`        | ❌       |
| `API_PORT`      | Port to access **api**                               | `17472`       | ❌       |
| `STORAGE_DIR`   | Path where the app data was stored                   | `./data`      | ❌       |
| `CHROME_BINARY` | Path to **chrome binary** _(Only when not detected)_ | `Auto Detect` | ❌       |
| `AUTO_UPDATE`   | Automatic check **update** on startup                | `true`        | ❌       |

### DEBUG

| Variable        | Description                            | Default Value | Required |
| --------------- | -------------------------------------- | ------------- | -------- |
| `HEADLESS`      | Hide browser                           | `true`        | ❌       |
| `STEALTH_MODE`  | Apply countermeasures against anti-bot | `true`        | ❌       |
| `BLOCK_TRACKER` | Block tracker                          | `true`        | ❌       |
| `BROWSER_TEST`  | Used to test setting browser           | `false`       | ❌       |

## Requirements

-   [Node.JS](https://nodejs.org/en/download) 20 or higher

> [!WARNING]  
> If you are using a **Virtual Machine**, can have problem with integrity token (currently tested on windows machine on Hyper-V), as Twitch has anti-bot measures that prevent its use without proper hardware.

## Installation

The installation process is very simple:

1. **Download** the latest release from the repository
2. **Extract** the downloaded archive
3. **Rename** the `default.env` file to `.env`
4. **Open** the `.env` file and modify the **ACCESS_TOKEN** key with your own token.

### Windows:

5. **Run** `start.bat`

### Linux:

5. **Execute** `chmod +x start.sh` to set start.sh as executable
6. **Run** `./start.sh`

# Pictures

![ChannelPoint](https://github.com/user-attachments/assets/f096ffd4-f16a-4602-97cf-37bd9dfcf104)
![CampaignDrop](https://github.com/user-attachments/assets/b9ad4a37-dd54-4612-8bd1-445a44f4561d)
![TrackingGame](https://github.com/user-attachments/assets/815ca630-8046-42be-85ea-1c852720d4f8)

# Goals

-   ❌ Public a **docker version**
-   ✅ Implement **setting** into UI
-   ❌ Create a **recording** section
-   ❌ Create a **statistic** section

> [!IMPORTANT]  
> Due to **Twitch's Anti-Bot** measures, this bot works correctly on physical machines. However, it may not function properly on virtual machines in certain cases.

> [!NOTE]  
> If anyone can create a **Docker** version, please contact me by submitting a pull request. The current obstacle is **Kasada** (Twitch's anti-bot system), which prevents the bot from obtaining the integrity token.
