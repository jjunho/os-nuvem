# 21: Excel export and import

**What to build:** A salesperson exports an Orçamento to Excel, so Carlos can work with the numbers the way he is used to. They import an Orçamento from an Excel file following the CoreaLux template, so quotes started in a spreadsheet can come in. Spec: stories 66, 91.

An import fills the Viagem's existing records. Viajantes already on the Viagem are matched, never created twice. Anything the import can't match is shown for review.

**Blocked by:** 19 (Opções and Margem).

**Status:** done

- [x] The export has one sheet per Opção, with Dias, lines, suggested and applied values, and the price steps.
- [x] Exporting then importing the same file gives the same Orçamento.
- [x] Importing into a Viagem that already has Viajantes reuses them.
- [x] A file off the template is refused with the reason.

## Entrega

Implementado e revisado. Verificação: parte4-excel.spec.ts; parte5-revisao.spec.ts.
