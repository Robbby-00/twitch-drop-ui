# Twitch Drop UI

This bot is designed to run continuously to farm reward on Twitch. Its primary features include:

-   **Tracking Twitch Campaigns**: Automatically collects Twitch Drops for selected games or specific campaign.
-   **Channel Points Farming**: Accumulates channel points from your favorite streamers effortlessly.

The bot is **lightweight and efficient**, avoiding the use of _Selenium or similar services_ to watch streams, resulting in virtually zero bandwidth usage. Puppeteer is utilized only once every 16 hours to securely authenticate and obtain Twitch's integrity token.

### How it Works

This bot can watch streams **simultaneously** (_but only one at a time due to Twitch's drop restrictions_). The bot requests only stream metadata, making it **lightweight and efficient**. This is sufficient to earn channel points or claim drops.

For **Twitch Drop Campaigns**, you can manually add the campaigns you want rewards from, or you can set a tracked game. When a tracked game is configured, the bot will automatically watch all campaigns related to that game.

As for **channel points**, the bot acts as a simple AFK farmer, watching a specific stream to accumulate points.

### Enviroments

The data can be provided either through the **.env** file in the root folder or via system environment variables.

| Variable        | Description                                          | Default Value | Required |
| --------------- | ---------------------------------------------------- | ------------- | -------- |
| `ACCESS_TOKEN`  | **_Twitch OAuth Token_**                             | `None`        | ✅       |
| `WEB_PORT`      | Port to access **web app**                           | `3000`        | ❌       |
| `API_PORT`      | Port to access **api**                               | `17472`       | ❌       |
| `STORAGE_DIR`   | Path where the app data was stored                   | `./data`      | ❌       |
| `CHROME_BINARY` | Path to **chrome binary** _(Only when not detected)_ | `Auto Detect` | ❌       |

### Requirements

-   [Node.JS](https://nodejs.org/en/download) 20 or higher
-   [Chrome](https://www.google.com/intl/it_it/chrome/)

> [!WARNING]  
> If you are using a **Virtual Machine**, you must have a _VGA_ or a _dedicated GPU_, as Twitch has anti-bot measures that prevent its use without proper hardware.

## Installation

## Picture

## Goals

-   Public a **docker version**
-   Implement **setting** into UI
-   Create a **recording** section
-   Create a **statistic** section

> [!NOTE]  
> If anyone can create a **Docker** version, please contact me by submitting a pull request. The current obstacle is **Kasada** (Twitch's anti-bot system), which prevents the bot from obtaining the integrity token.
