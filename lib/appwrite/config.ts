export const appwriteConfig = {
    endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    projectName: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME!,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION_ID!,
    foldersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION_ID!,
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    secretKey: process.env.NEXT_PUBLIC_APPWRITE_KEY!,
};