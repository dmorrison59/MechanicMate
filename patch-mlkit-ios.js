const fs = require("fs");
const path = require("path");

const sourceFile = path.join(
  __dirname,
  "node_modules",
  "@infinitered",
  "react-native-mlkit-text-recognition",
  "ios",
  "RNMLKitTextRecord.swift"
);

if (!fs.existsSync(sourceFile)) {
  throw new Error(`ML Kit Swift source was not found: ${sourceFile}`);
}

const original = fs.readFileSync(sourceFile, "utf8");
const ambiguousSignature = "func mapTextToRecord(_ text: Text) -> TextRecord {";
const qualifiedSignature =
  "func mapTextToRecord(_ text: MLKitTextRecognition.Text) -> TextRecord {";

if (original.includes(qualifiedSignature)) {
  console.log("ML Kit iOS Text compatibility patch is already applied.");
  process.exit(0);
}

if (!original.includes(ambiguousSignature)) {
  throw new Error(
    "ML Kit Swift source changed; refusing to apply an unverified compatibility patch."
  );
}

fs.writeFileSync(
  sourceFile,
  original.replace(ambiguousSignature, qualifiedSignature),
  "utf8"
);

console.log("Applied ML Kit iOS Text compatibility patch.");
