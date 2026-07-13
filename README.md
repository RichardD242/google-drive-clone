
# GDC

GDC or Google Drive Clone is a online storage tool where you can store manage and share files like google drive

## Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Appwrites**
- **TailswindCSS**
- **Shadcn**

## Dev

1. Install dependencies

```bash
npm install
```

2. Create an Appwrite project at [cloud.appwrite.io](https://cloud.appwrite.io) and set up:

| Resource | Needs |
|---|---|
| `users` collection | `Fullname`, `email`, `avatar`, `accountid` |
| `files` collection | `name`, `url`, `type`, `extension`, `size`, `bucketField`, `accountid`, `users`, `owner` (`manyToOne` relationship → `users`) |
| Storage bucket | `read("any")` permission |
| API key | read/write access to database and storage |

3. Create a `.env.local` file in the project root with:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://<region>.cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="project id"
NEXT_PUBLIC_APPWRITE_PROJECT_NAME="project name"
NEXT_PUBLIC_APPWRITE_DATABASE_ID="db id"
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID="users collection id"
NEXT_PUBLIC_APPWRITE_FILES_COLLECTION_ID="files collection id"
NEXT_PUBLIC_APPWRITE_BUCKET_ID="bucket id"
NEXT_PUBLIC_APPWRITE_KEY="api key"
```


4. Run the dev server

```bash
npm run dev
```

## How to use

- go to [gdc](https://google-drive-clone-kappa-murex.vercel.app/sign-in)

## Tutorial and own tweaks

used Javascript Mastery tutorial

own tweaks:

- new custom folder system
- soft deleting (trash)
- added move to folder
- updated the project to work with newer Appwrite versions including ennviroment configuration changes (tutorial was outdated)
- fixed file preview compatibility

## ai use

- the tutorial targeted older version of dependencies so i used ai to update configs and to match required enviroment
- inline suggestions on vs

## preview

![GDC Previw Pic](/public/gdcpreview.png)
![GDC Preview Pic](/public/gdcpreview2.png)