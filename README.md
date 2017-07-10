# release-package
Command-line tool to publish approved Unity packages to the production registry

## Pre-requisites

Publishing is done through the `npm` command line tool:
- Download and install the current LTS version of [NodeJS](https://nodejs.org/en/download/) for your platform (this includes `npm`)

## Installation

* Clone this GitHub repository
* From the `release-package` directory, install the script with:
```bash
$ npm install && npm link
```
* Then you can run it using:
```bash
$ release-unity-package
```
