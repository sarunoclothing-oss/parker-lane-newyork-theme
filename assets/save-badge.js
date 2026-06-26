function updateSaveBadge() {
  const priceBlock = document.querySelector(".product-block--price");
  if (!priceBlock) return;

  const compareEl = priceBlock.querySelector("[data-compare-price]");
  const priceEl = priceBlock.querySelector("[data-product-price]");
  if (!compareEl || !priceEl) return;

  function toNumber(text) {
    return parseFloat(
      text
        .replace(/\s/g, "")
        .replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  const compare = toNumber(compareEl.textContent);
  const price = toNumber(priceEl.textContent);

  // Remove existing badge
  const oldBadge = priceBlock.querySelector(".save-badge");
  if (oldBadge) oldBadge.remove();

  if (!compare || !price || compare <= price) return;

  const percent = Math.round((1 - price / compare) * 100);

  const badge = document.createElement("span");
  badge.className = "save-badge";
  badge.textContent = "Save " + percent + "%";

  priceEl.insertAdjacentElement("afterend", badge);
}

document.addEventListener("DOMContentLoaded", updateSaveBadge);
document.addEventListener("variant:change", updateSaveBadge);
document.addEventListener("shopify:section:load", updateSaveBadge);