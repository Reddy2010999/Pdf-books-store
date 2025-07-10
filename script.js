import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5eabtRXkVrFZqVd4tudD9cwQ6cibuWyE",
  authDomain: "parikshith-reddy-books-store.firebaseapp.com",
  projectId: "parikshith-reddy-books-store",
  storageBucket: "parikshith-reddy-books-store.appspot.com",
  messagingSenderId: "102247596219",
  appId: "1:102247596219:web:a9ad13f87f4fe65b78e99e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Login
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      window.location.href = "dashboard.html";
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}

// Signup
const signupBtn = document.getElementById("signup-btn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created! Please log in.");
      window.location.href = "login.html";
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });
}

// Upload Book
const uploadBtn = document.getElementById("upload-book-btn");
if (uploadBtn) {
  onAuthStateChanged(auth, async (user) => {
    if (!user || user.email !== "jangaparikshithreddy@gmail.com") {
      alert("Access denied. Admin only.");
      window.location.href = "login.html";
      return;
    }

    uploadBtn.addEventListener("click", async () => {
      const title = document.getElementById("book-title").value;
      const price = document.getElementById("book-price").value;
      const pdfFile = document.getElementById("book-pdf").files[0];
      const imgFile = document.getElementById("book-image").files[0];
      if (!title || !price || !pdfFile || !imgFile) {
        alert("Please fill in all fields and select files.");
        return;
      }

      try {
        const pdfRef = ref(storage, `books/${pdfFile.name}`);
        await uploadBytes(pdfRef, pdfFile);
        const pdfURL = await getDownloadURL(pdfRef);

        const imgRef = ref(storage, `images/${imgFile.name}`);
        await uploadBytes(imgRef, imgFile);
        const imgURL = await getDownloadURL(imgRef);

        await addDoc(collection(db, "books"), {
          title,
          price,
          pdfURL,
          imgURL
        });

        alert("Book uploaded successfully!");
      } catch (err) {
        alert("Upload failed: " + err.message);
      }
    });
  });
}

// Load books on homepage
const bookList = document.getElementById("book-list");
if (bookList) {
  (async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "books"));
      bookList.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const book = doc.data();
        bookList.innerHTML += `
          <div>
            <img src="${book.imgURL}" width="150" />
            <h3>${book.title}</h3>
            <p>₹${book.price}</p>
            <a href="${book.pdfURL}" target="_blank">Download</a>
          </div>
        `;
      });
    } catch (err) {
      alert("Failed to load books: " + err.message);
    }
  })();
}
