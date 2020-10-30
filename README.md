<h3  align="center">AUTODEPLOY</h3>
<p align="center">
a docker image listening for commit changes and automatic deploy to server.
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

`GITHUB_USERNAME` (Optional)<br/>
Your GitHub username.
<br/><br/>

`GITHUB_KEY` (Optional)<br/>
Your GitHub Personal Access Token.<br/>
You can get it at [https://github.com/settings/tokens](https://github.com/settings/tokens) **repo scope are needed**.
<br/><br/>

`GITHUB_REPOSITORY` (Required)<br/>
Repository to listening for change.<br/>
Example value: `wuttinanhi/test-compose`
<br/><br/>

`GITHUB_BRANCH` (Required)<br/>
Branch to listening for change.<br/>
Example value: `test` `production`
<br/><br/>

`DEPLOY_DIRECTORY` (Optional)<br/>
Directory path for store downloaded repository.<br/>
Default value: `repo`<br/>
Example value: `//autodeploy-repo`<br/>
<br/><br/>

`REFRESH_RATE` (Optional)<br/>
Wait for amount of milliseconds to see changes again.<br/>
Default value: `15000`<br/>
Example value: `30000` (wait for 30 seconds) `60000` (wait 1 minute)
<br/><br/>


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
