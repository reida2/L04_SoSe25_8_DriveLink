/**
 * Jest‑Konfiguration für MoveSmart
 *
 * • testEnvironment   – Testlauf in einer Node‑Umgebung
 * • transform         – Babel‑Jest zum Verarbeiten von ES‑Modulen
 * • moduleFileExtensions – Dateitypen, die Jest erkennt
 */
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'node'],
};
