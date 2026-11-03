import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../src/lib/firebase"; // Tu instancia inicializada de Firestore
import { SAMPLE_PRODUCTOS } from "../src/lib/sampleData";

async function subirCatalogo() {
  console.log("Iniciando carga de productos B2B a Firestore...");

  const productosCol = collection(db, "productos");

  for (const producto of SAMPLE_PRODUCTOS) {
    try {
      // Usamos setDoc para conservar el ID definido ('prod-1', 'prod-2', etc.)
      const docRef = doc(productosCol, producto.id);
      await setDoc(docRef, producto);
      console.log(`✓ Producto guardado: [${producto.sku}] ${producto.nombre}`);
    } catch (error) {
      console.error(`✗ Error al subir el producto ${producto.sku}:`, error);
    }
  }

  console.log("Proceso de carga finalizado.");
}

subirCatalogo();
