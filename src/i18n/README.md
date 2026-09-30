# Fieldwise translations

Locale files are static resources and are loaded on demand. `en.json` is the source dictionary; `npm run i18n:check` compares every locale's keys and flags unchanged English strings.

The current dictionaries cover the shared navigation, header, language selector, page introductions, weather summary, and document metadata. Several page bodies still use their existing component text and legacy crop/alert/speech dictionaries, so the translation pass is not yet complete across every screen. Have native-speaking agricultural reviewers validate wording before a production launch, especially crop and treatment terminology.
