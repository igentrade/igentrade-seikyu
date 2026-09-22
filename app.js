const yen = (n) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

const todayISO = () => new Date().toISOString().slice(0, 10);

const stateKey = "igentrade-seikyu-draft-v1";

function el(id) {
  return document.getElementById(id);
}

function defaultItem() {
  return { name: "", qty: 1, unit: "式", price: 0 };
}

let items = [defaultItem(), defaultItem(), defaultItem()];

function renderItemInputs() {
  const root = el("items");
  root.innerHTML = "";
  items.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <input data-k="name" data-i="${idx}" placeholder="品目" value="${escapeAttr(item.name)}" />
      <input data-k="qty" data-i="${idx}" type="number" min="0" step="1" value="${item.qty}" />
      <input data-k="unit" data-i="${idx}" placeholder="単位" value="${escapeAttr(item.unit)}" />
      <input data-k="price" data-i="${idx}" type="number" min="0" step="1" value="${item.price}" />
      <button type="button" data-del="${idx}" title="削除">×</button>
    `;
    root.appendChild(row);
  });
}

function escapeAttr(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function readForm() {
  return {
    docType: el("docType").value,
    issueDate: el("issueDate").value,
    dueDate: el("dueDate").value,
    docNumber: el("docNumber").value.trim(),
    sellerName: el("sellerName").value.trim(),
    sellerAddress: el("sellerAddress").value.trim(),
    sellerContact: el("sellerContact").value.trim(),
    invoiceReg: el("invoiceReg").value.trim(),
    bankInfo: el("bankInfo").value.trim(),
    buyerName: el("buyerName").value.trim(),
    buyerAddress: el("buyerAddress").value.trim(),
    taxRate: Number(el("taxRate").value),
    notes: el("notes").value.trim(),
    items: items.map((x) => ({
      name: x.name,
      qty: Number(x.qty) || 0,
      unit: x.unit,
      price: Number(x.price) || 0,
    })),
  };
}

function calc(data) {
  const lines = data.items.filter((i) => i.name || i.price || i.qty);
  const subtotal = lines.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tax = Math.floor(subtotal * data.taxRate);
  const total = subtotal + tax;
  return { lines, subtotal, tax, total };
}

function refreshPreview() {
  const data = readForm();
  const { lines, subtotal, tax, total } = calc(data);
  const isInvoice = data.docType === "invoice";

  el("docLabel").textContent = isInvoice ? "請求書" : "見積書";
  el("dueLabel").textContent = isInvoice ? "支払期限" : "有効期限";
  el("pDocNumber").textContent = data.docNumber || "—";
  el("pIssueDate").textContent = data.issueDate || "—";
  el("pDueDate").textContent = data.dueDate || "—";
  el("pBuyerName").textContent = data.buyerName || "（宛名）";
  el("pBuyerAddress").textContent = data.buyerAddress;
  el("pSellerName").textContent = data.sellerName || "（自社名）";
  el("pSellerAddress").textContent = data.sellerAddress;
  el("pSellerContact").textContent = data.sellerContact;
  el("pInvoiceReg").textContent = data.invoiceReg
    ? `登録番号: ${data.invoiceReg}`
    : "";
  document.querySelector(".honor").textContent = isInvoice
    ? "下記の通りご請求申し上げます。"
    : "下記の通りお見積り申し上げます。";

  const tbody = el("pItems");
  tbody.innerHTML = "";
  if (!lines.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:#5b6475">明細を入力してください</td></tr>`;
  } else {
    lines.forEach((i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeAttr(i.name)}</td>
        <td>${i.qty}</td>
        <td>${escapeAttr(i.unit || "")}</td>
        <td>${yen(i.price)}</td>
        <td>${yen(i.qty * i.price)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const ratePct = Math.round(data.taxRate * 100);
  el("pTaxLabel").textContent =
    data.taxRate === 0 ? "消費税" : `消費税（${ratePct}%）`;
  el("pSubtotal").textContent = yen(subtotal);
  el("pTax").textContent = yen(tax);
  el("pTotal").textContent = yen(total);
  el("pGrandTotal").textContent = yen(total);
  el("pNotes").textContent = data.notes || "—";
  el("pBankInfo").textContent = data.bankInfo || "—";
  el("pBankBlock").style.display = isInvoice ? "block" : "none";
}


function syncBrandFoot() {
  const foot = el("brandFoot");
  const on = el("showBrand") && el("showBrand").checked;
  if (!foot) return;
  foot.classList.toggle("is-hidden", !on);
}

function bind() {
  el("issueDate").value = todayISO();
  const due = new Date();
  due.setDate(due.getDate() + 30);
  el("dueDate").value = due.toISOString().slice(0, 10);
  el("docNumber").value = `INV-${new Date().getFullYear()}-001`;
  el("sellerName").value = "合同会社威源国際貿易";
  el("notes").value = "振込手数料はお客様負担でお願いいたします。";

  renderItemInputs();
  refreshPreview();

  el("items").addEventListener("input", (e) => {
    const t = e.target;
    if (!t.dataset.k) return;
    const i = Number(t.dataset.i);
    const k = t.dataset.k;
    items[i][k] = t.type === "number" ? Number(t.value) : t.value;
    refreshPreview();
  });
  el("items").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del]");
    if (!btn) return;
    const i = Number(btn.dataset.del);
    items.splice(i, 1);
    if (!items.length) items.push(defaultItem());
    renderItemInputs();
    refreshPreview();
  });

  el("addItem").addEventListener("click", () => {
    items.push(defaultItem());
    renderItemInputs();
    refreshPreview();
  });

  [
    "docType",
    "issueDate",
    "dueDate",
    "docNumber",
    "sellerName",
    "sellerAddress",
    "sellerContact",
    "invoiceReg",
    "bankInfo",
    "buyerName",
    "buyerAddress",
    "taxRate",
    "notes",
  ].forEach((id) => el(id).addEventListener("input", refreshPreview));

  el("showBrand").addEventListener("change", syncBrandFoot);
  syncBrandFoot();
  el("printBtn").addEventListener("click", () => window.print());
  el("saveLocal").addEventListener("click", () => {
    localStorage.setItem(stateKey, JSON.stringify(readForm()));
    alert("下書きをこのブラウザに保存しました。");
  });
  el("loadLocal").addEventListener("click", () => {
    const raw = localStorage.getItem(stateKey);
    if (!raw) {
      alert("保存された下書きがありません。");
      return;
    }
    const data = JSON.parse(raw);
    el("docType").value = data.docType;
    el("issueDate").value = data.issueDate || "";
    el("dueDate").value = data.dueDate || "";
    el("docNumber").value = data.docNumber || "";
    el("sellerName").value = data.sellerName || "";
    el("sellerAddress").value = data.sellerAddress || "";
    el("sellerContact").value = data.sellerContact || "";
    el("invoiceReg").value = data.invoiceReg || "";
    el("bankInfo").value = data.bankInfo || "";
    el("buyerName").value = data.buyerName || "";
    el("buyerAddress").value = data.buyerAddress || "";
    el("taxRate").value = String(data.taxRate ?? 0.1);
    el("notes").value = data.notes || "";
    items = (data.items && data.items.length ? data.items : [defaultItem()]).map(
      (x) => ({
        name: x.name || "",
        qty: x.qty ?? 1,
        unit: x.unit || "式",
        price: x.price ?? 0,
      })
    );
    renderItemInputs();
    refreshPreview();
  });
}

bind();
