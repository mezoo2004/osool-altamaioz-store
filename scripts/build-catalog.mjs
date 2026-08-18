import {
  buildCatalog,
  printImportSummary,
  writeCatalogOutputs,
} from "./lib/catalog-engine.mjs";

const result = buildCatalog();
const report = writeCatalogOutputs(result);
printImportSummary({
  source: report.importBatch,
  rows: report.rawVariantCount,
  products: {
    create: report.groupedProductCount,
    update: 0,
    skip: report.importStats.variantsSkipped,
    conflict: report.conflictCount,
  },
  variants: {
    create: report.importStats.variantsCreated,
    update: report.importStats.variantsUpdated,
  },
  warnings: result.warnings,
});
