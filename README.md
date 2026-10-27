# Hugo-Book Starter

This is a template repository to bootstrap your documentation site with Hugo-Book theme. It contains minimal configured from the start hugo site.

1. To use this repository create a new repository from this template
2. Run `git clone --recurse-submodules --shallow-submodules https://github.com/CollegesChat/CollegesChat.github.io`
3. Enter newly created directory `cd CollegesChat.github.io`
4. Run hugo `hugo server`

And you are ready to write docs!

## Browser Requirements

- Chrome >= 112

- Firefox >= 117

- Safari >= 16.5

## Environment variables

This project reads the following environment variables (standard Hugo variables such as `HUGO_BASEURL` are still respected):

| Variable | Description | Default | Example |
| --- | --- | --- | --- |
| `HUGO_OLD_SITE_URL` | When set, the sidebar renders a "return to old version" link pointing to the same page path on the old site. Keeps the legacy site reachable during migration. | unset — link is hidden | `https://old.example.com` |
| `HUGO_COPYRIGHT` | Overrides the footer copyright line without editing `hugo.yaml`. `local_preview.sh` exports it from `scripts/copyright_line.sh`; CI injects the same value into the `copyright: "$copyright"` placeholder via `sed`. | falls back to `hugo.yaml` `copyright` placeholder | output of `scripts/copyright_line.sh` |
| `CF_PAGES_URL` | Auto-injected by Cloudflare Pages at build time. When present, `scripts/build_hugo.sh` passes it to Hugo as `baseURL` (`hugo -b`); on GitHub Pages it is absent and the `baseURL` from `hugo.yaml` is used. | unset on GitHub Pages / auto-set on Cloudflare Pages | `https://<project>.pages.dev` |
