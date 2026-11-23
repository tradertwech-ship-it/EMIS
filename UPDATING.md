# How to update EMIS ONLINE ACADEMY (replace ONE file)

The whole website's behaviour, look and pictures live in a single file at the top of your repository: **`app.js`**.
The page files (`index.html`, `dashboard.html` …), the `api/` folder, `vercel.json` and the `.sql` files normally stay as they are.

## To install an update
1. You receive a new **`app.js`**.
2. On github.com open your repository → **Add file → Upload files** → drag the new `app.js` in (same name replaces the old one) → **Commit changes**.
3. Vercel redeploys by itself in about a minute. Reload the site (on a phone, close and reopen it).
4. Check **Admin → Settings → App version** shows the new version number.

## Things an update may also need (you will be told)
- **A new database table/column:** Supabase → SQL Editor, paste the small `.sql` file you are given, Run.
- **A new key:** Vercel → Settings → Environment Variables, then Redeploy.
- **A new page:** you will get one extra `.html` file to upload next to the others.

## Safety
- If an update misbehaves, in GitHub open `app.js` → History and restore the previous version (or in Vercel → Deployments → the older one → Promote to Production). Your database is never touched by replacing `app.js`.
- Keep a copy of every `app.js` you are sent, named by its version.
