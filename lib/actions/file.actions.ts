"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
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

const normalizeFile = (doc: Models.Document) => {
  const raw = doc as Models.Document & {
    bucketField?: string;
    accountid?: string;
    owner?: unknown;
  };
  return {
    ...raw,
    bucketFileId: raw.bucketField,
    accountId: raw.accountid,
    owner: normalizeOwner(raw.owner),
  };
};

const attachFolderNames = async (
  files: (Models.Document & { parent?: string | null })[],
) => {
  const parentIds = [...new Set(files.map((file) => file.parent).filter(Boolean))];

  if (parentIds.length === 0) {
    return files.map((file) => ({ ...file, parentName: null }));
  }

  const { databases } = await createAdminClient();
  const folders = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [Query.equal("$id", parentIds)],
  );

  const folderNames = new Map(folders.documents.map((folder) => [folder.$id, folder.name]));

  return files.map((file) => ({
    ...file,
    parentName: file.parent ? (folderNames.get(file.parent) ?? null) : null,
  }));
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  parent,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountid: accountId,
      users: [],
      bucketField: bucketFile.$id,
      parent: parent || null,
      trashed: false,
      favorited: false,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(normalizeFile(newFile as Models.Document));
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: Models.Document & { email: string },
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
  parent?: string | null,

) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
    Query.equal("trashed", [false]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (parent !== undefined) {
    queries.push(parent ? Query.equal("parent", [parent]) : Query.isNull("parent"));
  }

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
  parent,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit, parent);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    const documentsWithFolders = await attachFolderNames(files.documents);

    return parseStringify({
      ...files,
      documents: documentsWithFolders.map(normalizeFile),
    });
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const getTrashedFiles = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id]), Query.equal("trashed", [true])],
    );

    const documentsWithFolders = await attachFolderNames(files.documents);

    return parseStringify({
      ...files,
      documents: documentsWithFolders.map(normalizeFile),
    });
  } catch (error) {
    handleError(error, "Failed to get trashed files");
  }
};

export const trashFile = async ({ fileId, path }: TrashFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { trashed: true },
    );

    revalidatePath(path);
    return parseStringify(normalizeFile(updatedFile));
  } catch (error) {
    handleError(error, "Failed to move file to trash");
  }
};

export const restoreFile = async ({ fileId, path }: RestoreFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { trashed: false },
    );

    revalidatePath(path);
    return parseStringify(normalizeFile(updatedFile));
  } catch (error) {
    handleError(error, "Failed to restore file");
  }
};

export const emptyTrash = async () => {
  const { databases, storage } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const [trashedFiles, trashedFolders] = await Promise.all([
      databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, [
        Query.equal("owner", [currentUser.$id]),
        Query.equal("trashed", [true]),
      ]),
      databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.foldersCollectionId, [
        Query.equal("owner", [currentUser.$id]),
        Query.equal("trashed", [true]),
      ]),
    ]);

    await Promise.all(
      trashedFiles.documents.map(async (file) => {
        await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, file.$id);
        await storage.deleteFile(appwriteConfig.bucketId, file.bucketField as string);
      }),
    );

    await Promise.all(
      trashedFolders.documents.map((folder) =>
        databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.foldersCollectionId, folder.$id),
      ),
    );

    revalidatePath("/trash");
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to empty trash");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(normalizeFile(updatedFile));
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const moveFile = async ({ fileId, parent, path }: MoveFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { parent },
    );

    revalidatePath(path);
    return parseStringify(normalizeFile(updatedFile));
  } catch (error) {
    handleError(error, "Failed to move file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(normalizeFile(updatedFile));
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const toggleFavoriteFile = async ({ fileId, favorited, path }: ToggleFavoriteFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { favorited },
    );

    revalidatePath(path);
    return parseStringify(normalizeFile(updatedFile));
  } catch (error) {
    handleError(error, "failed to favorite");
  }
};

export const getFavoriteFiles = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("user not found");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("owner", [currentUser.$id]),
        Query.equal("favorited", [true]),
        Query.equal("trashed", [false])
      ],
    );

    const documentsWithFolders = await attachFolderNames(files.documents);

    return parseStringify({
      ...files,
      documents: documentsWithFolders.map(normalizeFile),
    });
  } catch (error) {
    handleError(error, "failed to get favorite files");
  }
};

export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}
