import assert from "node:assert/strict";
import { test } from "node:test";
import { countryLocale, pageUrl, path } from "./i18n.ts";

test("visitors get the language of their country, Uzbek when unknown", () => {
  assert.equal(countryLocale("UZ"), "uz");
  assert.equal(countryLocale(null), "uz");
  assert.equal(countryLocale("XX"), "uz");
  assert.equal(countryLocale("RU"), "ru");
  assert.equal(countryLocale("KZ"), "ru");
  assert.equal(countryLocale("DE"), "en");
  assert.equal(countryLocale("US"), "en");
});

test("uz has no prefix, the others live under their code", () => {
  assert.equal(pageUrl("uz"), "https://morefin.uz/");
  assert.equal(pageUrl("ru"), "https://morefin.uz/ru");
  assert.equal(path("uz"), "/");
  assert.equal(path("en"), "/en");
});
