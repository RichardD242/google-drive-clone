"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

const normalizeOwner = (owner: unknown) => {
  if (!owner || typeof owner !== "object") return owner;
  const doc = owner as Models.Document & { Fullname?: string; accountid?: string };
  return { ...doc, fullName: doc.Fullname, accountId: doc.accountid };
};

const normalizeFolder = (doc: Models.Document) => {
  const raw = doc as Models.Document & { accountid?: string; owner?: unknown };
  return {
    ...raw,
    accountId: raw.accountid,
    owner: normalizeOwner(raw.owner),
  };
};

export const createFolder = async ({
  name,
  ownerId,
  accountId,
  parent,
  path,
}: CreateFolderProps) => {
  const { databases } = await createAdminClient();


  try {
    const folderDocument = {
      name,
      owner: ownerId,
      accountid: accountId,
      parent: parent || null,
    };

    const newFolder = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      ID.unique(),
      folderDocument,
    );

    revalidatePath(path);
    return parseStringify(normalizeFolder(newFolder));
  } catch (error) {
    handleError(error, "failed to create folder");
  }
};

export const getFolders = async ({ parent }: GetFoldersProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const queries = [Query.equal("owner", [currentUser.$id])];
    queries.push(parent ? Query.equal("parent", [parent]) : Query.isNull("parent"));

    const folders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      queries,
    );

    return parseStringify({
      ...folders,
      documents: folders.documents.map(normalizeFolder),
    });
  } catch (error) {
    handleError(error, "failed to get folders");
  }
};



export const getFolder = async (folderId: string) => {
  const { databases } = await createAdminClient();

  try {
    const folder = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
    );

    return parseStringify(normalizeFolder(folder));
  } catch (error) {
    handleError(error, "failed to get folder");
  }
};

export const renameFolder = async ({ folderId, name, path }: RenameFolderProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFolder = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
      { name },
    );

    revalidatePath(path);
    return parseStringify(normalizeFolder(updatedFolder));
  } catch (error) {
    handleError(error, "failed to rename folder");
  }
};



export const deleteFolder = async ({ folderId, path }: DeleteFolderProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const [subfolders, files] = await Promise.all([
      databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.foldersCollectionId, [
        Query.equal("parent", [folderId]),
      ]),
      databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, [
        Query.equal("parent", [folderId]),
      ]),
    ]);



    await Promise.all(
      files.documents.map(async (file) => {
        await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, file.$id);
        await storage.deleteFile(appwriteConfig.bucketId, file.bucketField as string);
      }),
    );

    await Promise.all(
      subfolders.documents.map((subfolder) => deleteFolder({ folderId: subfolder.$id, path })),
    );

    await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.foldersCollectionId, folderId);


    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "failed to delete folder");
  }
};