const DB_NAME = "lexastra_library_db";
const DOCS = "pdf_documents",
  META = "pdf_metadata",
  STUDY = "pdf_study";
function metadata(book) {
  const { id, title, subject, size, addedAt } = book;
  return { id, title, subject, size, addedAt };
}
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined")
      return reject(new Error("Browser storage is unavailable."));
    let blocked = false;
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DOCS))
        db.createObjectStore(DOCS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STUDY))
        db.createObjectStore(STUDY, { keyPath: "id" });
      if (!db.objectStoreNames.contains(META)) {
        const meta = db.createObjectStore(META, { keyPath: "id" });
        const cursor = request.transaction.objectStore(DOCS).openCursor();
        cursor.onsuccess = () => {
          const c = cursor.result;
          if (c) {
            meta.put(metadata(c.value));
            c.continue();
          }
        };
      }
    };
    request.onsuccess = () => {
      if (blocked) {
        request.result.close();
        return;
      }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      blocked = true;
      reject(
        new Error(
          "Close other LexAstra tabs to finish updating document storage.",
        ),
      );
    };
  });
}
async function transact(stores, mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let result;
    const tx = db.transaction(stores, mode);
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error("The browser could not save your work."));
    };
    tx.onerror = () => {};
    try {
      action(tx, (value) => {
        result = value;
      });
    } catch (error) {
      tx.abort();
      db.close();
      reject(error);
    }
  });
}
export const saveBook = (id, title, subject, fileData, size) =>
  transact([DOCS, META], "readwrite", (tx) => {
    const book = { id, title, subject, fileData, size, addedAt: Date.now() };
    tx.objectStore(DOCS).put(book);
    tx.objectStore(META).put(metadata(book));
  });
export const getBook = (id) =>
  transact([DOCS], "readonly", (tx, done) => {
    const req = tx.objectStore(DOCS).get(id);
    req.onsuccess = () => done(req.result);
  });
export const deleteBook = (id) =>
  transact([DOCS, META], "readwrite", (tx) => {
    tx.objectStore(DOCS).delete(id);
    tx.objectStore(META).delete(id);
  });
export const getAllBooks = () =>
  transact([META], "readonly", (tx, done) => {
    const req = tx.objectStore(META).getAll();
    req.onsuccess = () =>
      done(req.result.sort((a, b) => b.addedAt - a.addedAt));
  });
export const getStudy = (id) =>
  transact([STUDY], "readonly", (tx, done) => {
    const req = tx.objectStore(STUDY).get(id);
    req.onsuccess = () => done(req.result?.study);
  });
export const saveStudy = (id, study) =>
  transact([STUDY], "readwrite", (tx) => {
    tx.objectStore(STUDY).put({ id, study, updatedAt: Date.now() });
  });
