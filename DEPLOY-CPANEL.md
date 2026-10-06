# First-time setup on cPanel

This is the same setup as Rynet. It's a Node application, so it runs through
**Setup Node.js App**, not `public_html`. The database is a single SQLite file, `changan.db`, in
the app folder.

> cPanel's PostgreSQL is version 10, which Payload 3 does not support, and Payload cannot use
> MySQL or MariaDB. That is why it uses SQLite, which is fine at this size.

## 1. GitHub

- Set the repository variable **`SITE_URL`** to the live address, for example
  `https://changansilverton.co.za`. It is baked into the build.
- Merge to `main`. The **Build deploy branch** workflow publishes the `deploy` branch.

## 2. Create the Node application

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | 22 |
| Application mode | Production |
| Application root | `changan` |
| Application URL | your domain |
| Application startup file | `server.cjs` |

## 3. Environment variables

Add these on the same screen:

```
NODE_ENV=production
DATABASE_URI=file:./changan.db
PAYLOAD_SECRET=<long random string, never change after go-live>
NEXT_PUBLIC_SERVER_URL=https://changansilverton.co.za
SMTP_HOST=<mail.yourdomain>   SMTP_PORT=587   SMTP_USER=<mailbox>   SMTP_PASS=<password>
EMAIL_FROM=noreply@changansilverton.co.za
LEADS_TO=stavros@changansilverton.co.za
```

## 4. Connect the repository

cPanel → **Git Version Control** → **Create**, and clone this repository to
`~/repositories/changan`. Then, on its **Pull or Deploy** tab:

1. **Update from Remote**
2. **Deploy HEAD Commit**

That runs `scripts/cpanel-deploy.sh`. It fetches the `deploy` branch and installs it into
`~/changan`, without needing a particular branch checked out. Once it has run, open the Node app's
virtual environment (the command is shown on the Node App screen) and run:

```bash
cd ~/changan && npm install --omit=dev
```

`--omit=dev` matters: it skips the build tools and Playwright. Then click **Restart**. The first
start creates `changan.db` from the committed migrations.

## 5. First content

The live database starts empty. Either sign in at `/admin` and create the first user, or seed it
once from the virtual environment:

```bash
cd ~/changan && NODE_ENV=production npx tsx src/seed/index.ts
```

Then change the admin password and replace the sample stock with real cars.

## After that

Every merge to `main` builds automatically. To install a build, either click the two buttons
again, or add this cron job (every 5 minutes; it exits immediately when nothing has changed):

```
*/5 * * * * /bin/bash $HOME/repositories/changan/scripts/cpanel-deploy.sh >> $HOME/deploy-changan.log 2>&1
```

For fully automatic installs over SSH, add the `HOST_SSH_KEY`, `HOST_SSH_HOST` and
`HOST_SSH_USER` repository secrets. Rynet's DEPLOY-GIT.md explains the same steps.

## Backups

The whole site is `changan.db` plus the `media/` folder. `scripts/backup.sh` copies both into
dated folders. Run it from a daily cron job:

```
15 2 * * * /bin/bash $HOME/changan/scripts/backup.sh >> $HOME/backup-changan.log 2>&1
```

## Troubleshooting

- **502 or it won't start**: read `~/changan/stderr.log`. It's almost always a missing
  `PAYLOAD_SECRET`, or the app folder isn't writable.
- **"Could not link runtime packages"**: `npm install --omit=dev` did not finish. Run it again,
  then Restart.
- **Admin editor is blank (a CSP error about eval)**: `next.config.ts` did not deploy. Redeploy.
- **Images 404 after upload**: `media/` is missing or not writable (give it 755).
