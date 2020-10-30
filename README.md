<br />
<p align="center">

<h3 align="center">AUTODEPLOY</h3>

<p align="center">
a docker image listening for commit changes and automatic deploy to server.
</a>
<br />
</p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [About the Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Environment Variable](#available-environment-variable)
- [Volume](#volume)
- [Contributing](#contributing)
- [License](#license)

<!-- ABOUT THE PROJECT -->

## About The Project

Have you tired of SSH to your server and run deployment command?
Did you make a small project and need test on the server quickly but you don't want to setup continuous integration?
Have you tired of managing SSH key?
Well, this thing might make it easy for you.

<!-- GETTING STARTED -->

## Getting Started

To get start you need to have some Docker knowledge.
If you want to modify this repository. you need JavaScript and Node.js.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

### Installation

```
docker run -it -d \
	--name="github-autodeploy" \
	--restart="always"
	-e GITHUB_USERNAME="" \
	-e GITHUB_KEY="" \
	-e GITHUB_REPOSITORY="wuttinanhi/test-compose" \
	-e GITHUB_BRANCH="test" \
	-e DEPLOY_DIRECTORY="//autodeploy-repo" \
	-e REFRESH_RATE=30000 \
	-v /var/run/docker.sock:/var/run/docker.sock \
	-v /auto-deploy:/repo \
	wuttinanhi/autodeploy:latest
```

<!-- AVAILABLE ENVIRONMENT VARIABLE -->

## Available Environment Variable:

`GITHUB_USERNAME` (Optional)
Your GitHub username.

`GITHUB_KEY` (Optional)
Your GitHub Personal Access Token.
You can get it at https://github.com/settings/tokens **repo scope are needed**.

`GITHUB_REPOSITORY` (Required)
Repository to listening for change.
Example value: `wuttinanhi/test-compose`

`GITHUB_BRANCH` (Required)
Branch to listening for change.
Example value: `test` `production`

`DEPLOY_DIRECTORY` (Optional)
Directory path for store downloaded repository.
Default value: `repo`
Example value: `//autodeploy-repo`

`REFRESH_RATE` (Optional)
Wait for amount of milliseconds to see changes again.
Default value: `15000`
Example value: `30000` (wait for 30 seconds) `60000` (wait 1 minute)

<!-- VOLUME -->

## Volume:

**(REQUIRED)** Socket path are needed for contact docker daemon.

- For Windows:
  `//var/run/docker.sock:/var/run/docker.sock`

- For Linux:
  `/var/run/docker.sock:/var/run/docker.sock`

**(Optional)** Volume for store downloaded repository.
*Environment variable `DEPLOY_DIRECTORY` and mounted path need to be the **same**.
*Example value:\*

- Relative path:
  - `DEPLOY_DIRECTORY=repo`
  - `/auto-deploy:/nodejs/repo`
- Absolute path:
  - `DEPLOY_DIRECTORY=//autodeploy-repo`
  - `/auto-deploy:/autodeploy-repo`

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.
