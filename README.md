<div align="center">

<img src="snap/gui/puter.png" alt="Puter logo" width="128" />

# Puter

**The internet computer, self-hosted**

[![puter](https://snapcraft.io/puter/badge.svg)](https://snapcraft.io/puter)
[![Base: core26](https://img.shields.io/badge/Base-core26-2C8C3C?logo=canonical&logoColor=white)](https://snapcraft.io/core26)
![Confinement: strict](https://img.shields.io/badge/Confinement-strict-2C8C3C)
[![Maintainer: sidaliteir](https://img.shields.io/badge/Maintainer-sidaliteir-2C8C3C?logo=snapcraft&logoColor=white)](https://snapcraft.io/publisher/sidaliteir)
![Architectures: amd64 and arm64](https://img.shields.io/badge/Architectures-amd64%20%7C%20arm64-2C8C3C?logo=linux&logoColor=white)

[Getting Started](#getting-started) · [Configure](#configure) · [Limitations](#limitations) · [Build](#build) · [Support](#support) · [License](#license)

Unofficial snap packaging for [Puter](https://github.com/heyputer/puter), a self-hosted desktop environment in the browser with cloud storage, apps and website hosting.

</div>

---

## Getting Started

<a href="https://snapcraft.io/puter"><img alt="Get it from the Snap Store" src="https://snapcraft.io/en/dark/install.svg" width="180"></a>

```bash
sudo snap install puter
sudo snap logs puter -n=all | grep "password for admin"
```

Open [http://puter.localhost:4100](http://puter.localhost:4100) and sign in as `admin` with the password from the log. It is printed on every start until you change it in Settings.

The service starts automatically and listens on this machine only. It uses upstream's built-in storage: the SQLite database, the key-value store and all uploaded files live in `/var/snap/puter/common/volatile/runtime`; no other service is needed.

## Configure

| Option | Accepted value | Default |
| --- | --- | --- |
| `port` | Integer from `1` to `65535` | `4100` |
| `host` | IP address or host name to listen on | `127.0.0.1` |
| `domain` | Host name the server is reached at | `puter.localhost` |
| `protocol` | `http` or `https`, as seen by the browser | `http` |
| `pub-port` | Integer from `1` to `65535`, as seen by the browser | Unset (same as `port`) |

```bash
sudo snap set puter host=0.0.0.0 domain=puter.example.com
sudo snap get puter
```

Changes restart an enabled or running service.

Puter routes by subdomain: the API is served at `api.<domain>`, and hosted sites and apps at `site.<domain>` and `app.<domain>`. `*.localhost` names resolve to this machine in browsers, so the default works locally. To reach Puter from other devices, set `host=0.0.0.0` and a `domain` with a wildcard DNS record (`*.<domain>`) pointing to this computer, then open `http://<domain>:4100`.

Behind a reverse proxy that terminates TLS, keep the `Host` header, set `protocol=https` and `pub-port=443`, and set `trust_proxy` to the number of proxies in `/var/snap/puter/common/config.json`.

Other upstream settings, such as email (SMTP), sign-up rules, OIDC or AI providers, go in `/var/snap/puter/common/config.json` (see upstream's [config.template.jsonc](https://github.com/heyputer/puter/blob/main/config.template.jsonc)). Run `sudo snap restart puter` after editing it. The snap options above take precedence over the same keys in this file.

The session and URL signing secrets are generated at install in `/var/snap/puter/common/secrets.json`.

## Limitations

- Only upstream's built-in storage is set up. MariaDB, Valkey, DynamoDB or an external S3 server must be run separately and configured in `config.json`.
- The built-in S3 emulator listens on `127.0.0.1:4566`. Uploads that the browser sends straight to it, such as Dev Center deploys, work only from this machine; change `s3.localConfig.port` in `config.json` if that port is taken.
- The inbound SMTP receiver and the local Ollama provider are not included.
- Serverless workers cannot be deployed: as in upstream's Docker image, their runtime preamble is not built.
- Remote access also requires the chosen port to be allowed by your firewall.

## Build

```bash
git clone https://github.com/sidalit/puter-snap.git
cd puter-snap
sudo snap install snapcraft --classic
snapcraft pack
```

## Support

- **Installation or snap issues:** [open a packaging issue](https://github.com/sidalit/puter-snap/issues).
- **Application bugs:** [report them upstream](https://github.com/heyputer/puter/issues).

## License

Snap packaging: [MIT](https://github.com/sidalit/puter-snap/blob/main/LICENSE).
