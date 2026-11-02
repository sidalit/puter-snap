// Write the config Puter reads (PUTER_CONFIG_PATH), merged in this order:
//   1. snap defaults for a self-hosted install, with the generated secrets
//   2. $SNAP_COMMON/config.json, for any other upstream setting
//   3. the `snap set puter ...` options
// Run with `init` from the install hook to only create the secrets and the
// empty config.json.
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const common = process.env.SNAP_COMMON;
const secretsPath = `${common}/secrets.json`;
const userPath = `${common}/config.json`;

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const merge = (base, over) => {
    const out = { ...base };
    for (const [k, v] of Object.entries(over)) {
        out[k] = isObject(v) && isObject(out[k]) ? merge(out[k], v) : v;
    }
    return out;
};
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

if (!existsSync(secretsPath)) {
    const secret = () => randomBytes(64).toString('hex');
    const secrets = { jwt_secret_v2: secret(), url_signature_secret: secret() };
    writeFileSync(secretsPath, `${JSON.stringify(secrets, null, 4)}\n`, { mode: 0o600 });
}
if (!existsSync(userPath)) {
    writeFileSync(userPath, '{}\n', { mode: 0o600 });
}
if (process.argv[2] === 'init') process.exit(0);

let user;
try {
    user = readJson(userPath);
} catch (e) {
    console.error(`${userPath} is not valid JSON: ${e.message}`);
    process.exit(1);
}
if (!isObject(user)) {
    console.error(`${userPath} must contain a JSON object`);
    process.exit(1);
}

const defaults = {
    // Serve the pre-built bundles; never open a browser or run the dev watcher.
    env: 'prod',
    no_browser_launch: true,
    no_devwatch: true,
    // No local Ollama is bundled; skip the probe that fails on every boot.
    providers: { ollama: { enabled: false } },
    // A self-hosted install has no paid plans to gate on.
    meteringEnforcement: { subscriptions: false },
    // The in-process S3 emulator only needs to be reachable from this machine.
    s3: { localConfig: { host: '127.0.0.1' } },
    ...readJson(secretsPath),
};

const { PUTER_PORT: port, PUTER_PUB_PORT: pubPort, PUTER_DOMAIN: domain, PUTER_PROTOCOL: protocol } =
    process.env;
const options = {
    port: Number(port),
    pub_port: Number(pubPort || port),
    protocol,
    domain,
    static_hosting_domain: `site.${domain}`,
    static_hosting_domain_alt: `host.${domain}`,
    private_app_hosting_domain: `app.${domain}`,
    private_app_hosting_domain_alt: `dev.${domain}`,
};

const config = merge(merge(defaults, user), options);
writeFileSync(process.argv[2], `${JSON.stringify(config, null, 4)}\n`, { mode: 0o600 });
