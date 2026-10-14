const DB_NAME = "lexastra_library_db";
const STORE_NAME = "pdf_documents";
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Document storage is unavailable in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Close other LexAstra tabs and try again."));
  });
}
// Resolve writes after the transaction commits, not when a request merely
// succeeds. Always close connections so failed or blocked writes can retry.
async function transact(mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let result;
    const tx = db.transaction(STORE_NAME, mode);
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error("Document storage transaction failed."));
    };
    tx.onerror = () => {}; // onabort provides the transaction's final outcome.
    try {
      const request = action(tx.objectStore(STORE_NAME));
      request.onsuccess = () => {
        result = request.result;
      };
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}
export const saveBook = (id, title, subject, fileData, size) =>
  transact("readwrite", (store) =>
    store.put({ id, title, subject, fileData, size, addedAt: Date.now() }),
  );
export const getBook = (id) => transact("readonly", (store) => store.get(id));
export const deleteBook = (id) =>
  transact("readwrite", (store) => store.delete(id));
export const getAllBooks = async () => {
  const books = await transact("readonly", (store) => store.getAll());
  return books.map(({ id, title, subject, size, addedAt }) => ({
    id,
    title,
    subject,
    size,
    addedAt,
  }));
};
