// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { SAMPLE_PRODUCTOS } from "@/src/lib/sampleData";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const ultimoMensaje = messages[messages.length - 1]?.text || "";

    // 1. ESTRUCTURAR EL CATÁLOGO AGRUPADO POR CATEGORÍAS OFICIALES
    const categoriasOficiales = [
      "RAM & Flash",
      "Discos & SSD",
      "CPUs & Procesadores",
      "Servidores & Redes",
      "Licenciamiento & OS",
    ];

    const catalogoPorCategoria = categoriasOficiales.map((cat) => ({
      categoria: cat,
      productos: SAMPLE_PRODUCTOS.filter((p) => p.categoria === cat).map(
        (p) => ({
          sku: p.sku,
          nombre: p.nombre,
          precioUnitario: `$${p.precio.toFixed(2)} USD`,
          preciosPorVolumen: p.precioVolumen?.map(
            (v) => `${v.minQty}+ uds: $${v.price.toFixed(2)} USD`,
          ),
          stock: p.stock,
          garantia: `${p.garantiaMeses} meses`,
          specsClave: p.specs
            ?.slice(0, 3)
            .map((s) => `${s.label}: ${s.value}`)
            .join(" | "),
        }),
      ),
    }));

    // 2. MOTOR DE CONTINGENCIA BASADO EN CATEGORÍAS
    const respuestaContingencia = () => {
      const q = ultimoMensaje.toLowerCase();

      // Categoría: RAM & Flash
      if (
        q.includes("ram") ||
        q.includes("memoria") ||
        q.includes("ddr5") ||
        q.includes("ddr4") ||
        q.includes("fury") ||
        q.includes("corsair")
      ) {
        return "En la categoría **RAM & Flash** disponemos de:\n• **Kingston Fury Beast 16GB DDR5 5600MHz** ($65.50 USD | $62.00 desde 5 uds).\n• **Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz** ($128.00 USD | $120.00 desde 4 uds).\n• **Kingston Server Premier 32GB DDR4 ECC Reg** ($115.00 USD | $108.00 desde 4 uds).\n¿Qué tipo de ensamble o equipo necesitas equipar?";
      }

      // Categoría: Discos & SSD
      if (
        q.includes("disco") ||
        q.includes("ssd") ||
        q.includes("almacenamiento") ||
        q.includes("nvme") ||
        q.includes("ironwolf") ||
        q.includes("seagate")
      ) {
        return "En la categoría **Discos & SSD** contamos con stock inmediato de:\n• **SSD Kingston NV2 1TB NVMe PCIe 4.0** ($51.20 USD | $49.50 desde 5 uds).\n• **SSD Samsung 990 PRO 2TB PCIe 4.0** ($185.00 USD | $175.00 desde 5 uds).\n• **Disco Duro Seagate IronWolf 4TB NAS 24/7** ($98.00 USD | $92.50 desde 4 uds).\n¿Buscas estado sólido rápido o almacenamiento masivo para servidor/NAS?";
      }

      // Categoría: CPUs & Procesadores
      if (
        q.includes("procesador") ||
        q.includes("cpu") ||
        q.includes("ryzen") ||
        q.includes("intel") ||
        q.includes("motherboard") ||
        q.includes("placa") ||
        q.includes("b650")
      ) {
        return "En la categoría **CPUs & Procesadores** disponemos de:\n• **AMD Ryzen 7 7700X (8C/16T AM5)**: $349.00 USD ($335.00 por 3+ uds).\n• **Intel Core i7-14700K (20C/28T LGA1700)**: $419.00 USD ($405.00 por 5+ uds).\n• **Motherboard ASUS TUF Gaming B650-PLUS WiFi (AM5)**: $219.75 USD ($209.00 por 3+ uds).\nNota: Por el momento nuestra motherboard en stock es compatible exclusivamente con Socket AMD AM5.";
      }

      // Categoría: Servidores & Redes
      if (
        q.includes("red") ||
        q.includes("router") ||
        q.includes("switch") ||
        q.includes("mikrotik") ||
        q.includes("ubiquiti") ||
        q.includes("ap") ||
        q.includes("ups") ||
        q.includes("fuente") ||
        q.includes("power")
      ) {
        return "En la categoría **Servidores & Redes** disponemos de:\n• **Switch Mikrotik CRS326-24G-2S+RM (24Gb + 2 SFP+ 10G)**: $215.00 USD.\n• **Access Point Ubiquiti UniFi 6 Pro WiFi 6**: $189.50 USD ($179.00 por 3+ uds).\n• **Router VPN TP-Link Omada ER605 Multi-WAN**: $62.00 USD.\n• **UPS APC Smart-UPS 1500VA LCD 120V**: $645.00 USD ($615.00 por 3+ uds).\n• **Fuente Corsair RM750e 750W 80+ Gold Modular**: $104.50 USD.\n¿Qué infraestructura necesitas implementar?";
      }

      // Categoría: Licenciamiento & OS
      if (
        q.includes("licencia") ||
        q.includes("windows") ||
        q.includes("office") ||
        q.includes("tinta") ||
        q.includes("epson") ||
        q.includes("t544") ||
        q.includes("software")
      ) {
        if (q.includes("canon") || q.includes("hp")) {
          return "No comercializamos consumibles de marcas Canon o HP. En la categoría **Licenciamiento & Consumibles** disponemos exclusivamente de **Pack 4 Tintas Epson T544 Originales** ($32.50 USD | $30.00 por 10+ packs) para equipos EcoTank, además de licencias Windows 11 Pro OEM ($145.00 USD), Windows Server 2022 ($890.00 USD) y Office Home & Business 2024 ($259.00 USD).";
        }
        return "En la categoría **Licenciamiento & OS** disponemos de:\n• **Licencia Windows 11 Pro 64-bit OEM DVD**: $145.00 USD ($135.00 por 10+ uds).\n• **Licencia Office Home & Business 2024 Perpetua**: $259.00 USD ($245.00 por 5+ uds).\n• **Licencia Windows Server 2022 Standard 16 Cores**: $890.00 USD.\n• **Pack 4 Tintas Epson T544 Originales**: $32.50 USD ($30.00 por 10+ packs).\nTodas con certificado de autenticidad para auditoría fiscal.";
      }

      // Detección de categorías NO manejadas en Techsmart
      if (
        q.includes("monitor") ||
        q.includes("pantalla") ||
        q.includes("tarjeta de video") ||
        q.includes("gpu") ||
        q.includes("rtx") ||
        q.includes("teclado") ||
        q.includes("mouse") ||
        q.includes("laptop") ||
        q.includes("portatil")
      ) {
        return "En Techsmart B2B nos especializamos en componentes internos e infraestructura en 5 categorías: **RAM & Flash, Discos & SSD, CPUs & Procesadores, Servidores & Redes y Licenciamiento & OS**. Actualmente no manejamos monitores, GPUs dedicadas, periféricos ni laptops completas. ¿Te podemos apoyar con procesadores, almacenamiento, memoria o networking para tu ensamble?";
      }

      // Cotizaciones generales
      if (
        q.includes("cotizar") ||
        q.includes("proforma") ||
        q.includes("como") ||
        q.includes("comprar")
      ) {
        return "Para generar una cotización formal:\n1. Ingresa a la sección **'Cotizador B2B'** en la barra superior.\n2. Añade partidas desde las plantillas de ensamble o desde el catálogo.\n3. Tus datos fiscales se autocompletarán si tienes sesión activa.\n4. Haz clic en **'Imprimir Proforma Formal'** para obtener tu PDF con desglose de IVA (13%).";
      }

      return "¡Hola! En Techsmart B2B El Salvador distribuimos componentes en 5 categorías oficiales:\n1. **RAM & Flash** (Kingston / Corsair)\n2. **Discos & SSD** (NVMe PCIe 4.0 / Seagate NAS)\n3. **CPUs & Procesadores** (AMD Ryzen 7 / Intel i7 / Motherboards AM5)\n4. **Servidores & Redes** (Mikrotik / Ubiquiti / TP-Link / APC / Corsair)\n5. **Licenciamiento & OS** (Microsoft Windows / Office / Tintas Epson)\n¿Cuál de estas categorías te gustaría consultar o cotizar hoy?";
    };

    if (!apiKey || apiKey === "tu_clave_de_gemini_aqui") {
      return NextResponse.json({ reply: respuestaContingencia() });
    }

    // 3. SYSTEM PROMPT CON ROTEADOR CATEGÓRICO PARA GEMINI
    const systemPrompt = `
Eres "TechBot", el asesor comercial de Techsmart B2B El Salvador (Distribuidor Mayorista de Tecnología & Hardware).

POLÍTICA COMERCIAL Y FISCAL:
- Precios: En dólares estadounidenses (USD) netos; en proforma oficial se desglosa el 13% de IVA.
- Bodega Central y Retiro: Parque Industrial Las Mercedes, San Salvador. Despacho en 24h locales / 24-72h departamentales.
- Garantía: Respaldo directo mayorista y cambio express DOA (Dead on Arrival) de 7 días.

INVENTARIO OFICIAL AGRUPADO EN 5 CATEGORÍAS:
${JSON.stringify(catalogoPorCategoria, null, 2)}

METODOLOGÍA DE RESPUESTA BASADA EN CATEGORÍAS (ESTRICTA):
1. IDENTIFICACIÓN DE CATEGORÍA:
   - Cuando el cliente mencione un componente o necesidad, ubícalo mentalmente en una de las 5 categorías oficiales:
     * "RAM & Flash"
     * "Discos & SSD"
     * "CPUs & Procesadores"
     * "Servidores & Redes"
     * "Licenciamiento & OS"
2. SI EL ARTÍCULO/MARCA ESTÁ DENTRO DE LA CATEGORÍA:
   - Indica el modelo exacto de nuestro catálogo, su SKU, stock, precio unitario y si tiene escala de descuento por volumen.
   - Si piden una marca o especificación no disponible (ejemplo: piden motherboard Intel LGA1700, tintas Canon/HP o discos WD Blue):
     * Aclara cortésmente que Techsmart no distribuye esa marca/variante.
     * Ofrece de inmediato el producto sustituto disponible en esa misma categoría (ej. ASUS TUF B650 para AM5, Epson T544 para tanques de tinta, o Kingston/Seagate en discos).
3. SI PIDEN UNA CATEGORÍA QUE NO MANEJAMOS:
   - Si preguntan por monitores, tarjetas gráficas dedicadas (GPUs RTX/Radeon), periféricos (mouses, teclados, auriculares), gabinetes vacíos o laptops completas:
     * Explica con claridad: "En Techsmart nos enfocamos en infraestructura y componentes internos en nuestras 5 categorías principales (...). Por el momento no comercializamos [categoría solicitada]."
     * Guía al cliente hacia los componentes relacionados que sí tenemos (ej. procesadores con gráficos integrados, fuentes de poder o memorias RAM).
4. TONO:
   - Breve, comercial, profesional y adaptado para chat de WhatsApp. Usa viñetas limpias y negritas en nombres de productos y precios.
`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `INSTRUCCIONES DE ATENCIÓN:\n${systemPrompt}\n\nComienza tu atención al cliente.`,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Entendido. Atenderé a los clientes categorizando sus requerimientos dentro de las 5 líneas oficiales de Techsmart B2B con total precisión técnica.",
          },
        ],
      },
      ...messages.map((m: { sender: string; text: string }) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
    ];

    const MODEL_NAME = "gemini-2.0-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn(
        "Aviso de Gemini API. Usando contingencia categórica:",
        data?.error?.message || data,
      );
      return NextResponse.json({ reply: respuestaContingencia() });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    return NextResponse.json({
      reply:
        "Disponemos de stock en Bodega Central de San Salvador con garantía oficial. ¿En qué producto o categoría podemos ayudarte?",
    });
  }
}
