# file-worker

File storage service, based on cloudflare worker

## Usage

1. You can post, update, delete your paste directly on the website (such as [shz.al](https://shz.al)). 

2. It also provides a convenient HTTP API to use. See [API reference](doc/api.md) for details. You can easily call API via command line (using `curl` or similar tools). 

3. [pb](/scripts) is a bash script to make it easier to use on command line.

## Limitations

1. If deployed on Cloudflare Worker free-tier plan, the service allows at most 100,000 reads and 1000 writes, 1000 deletes per day. 
2. Due to the size limit of Cloudflare KV storage, the size of each paste is bounded under 25 MB. 

## Deploy

You are free to deploy the pastebin on your own domain if you host your domain on Cloudflare. 

1. Install `node` and `yarn`.

2. Create a KV namespace on Cloudflare workers dashboard, remember its ID.

3. Clone the repository and enter the directory.

4. Modify entries in `wrangler.toml`. Its comments will tell you how.

5. Login to Cloudflare and deploy with the following steps:

```console
$ yarn install
$ yarn wrangler login
$ yarn deploy
```

6. Enjoy!

## Auth

If you want a private deployment (only you can upload paste, but everyone can read the paste), add the following entry to your `wrangler.toml`.

```toml
[vars.BASIC_AUTH]
user1 = "passwd1"
user2 = "passwd2"
```

Now every access to POST request, and every access to static pages, requires an HTTP basic auth with the user-password pair listed above. For example:

```console
$ curl example-pb.com
HTTP basic auth is required

$ curl -Fc=@/path/to/file example-pb.com
HTTP basic auth is required

$ curl -u admin1:wrong-passwd -Fc=@/path/to/file example-pb.com
Error 401: incorrect passwd for basic auth

$ curl -u admin1:this-is-passwd-1 -Fc=@/path/to/file example-pb.com
{
  "url": "https://example-pb.com/YCDX",
  "suggestUrl": null,
  "admin": "https://example-pb.com/YCDX:Sij23HwbMjeZwKznY3K5trG8",
  "isPrivate": false
}
```

## Administration
Delete a paste:
```console
$ yarn delete-paste <name-of-paste>
```

List pastes:
```console
$ yarn wrangler kv:key list --binding PB > kv_list.json
```

## Development

Run a local simulator:
```console
$ yarn dev
```

Run tests:
```console
$ yarn test
```

Run tests with coverage report:
```console
$ yarn coverage
```

# Salute

Based on [pastebin-worker](https://github.com/SharzyL/pastebin-worker) modification